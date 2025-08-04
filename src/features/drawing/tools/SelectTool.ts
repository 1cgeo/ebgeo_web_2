// Path: features\drawing\tools\SelectTool.ts

import { Position } from 'geojson';
import { transformTranslate } from '@turf/turf';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { DrawingTool } from '../../../types/feature.types';
import { AbstractTool, MapMouseEvent, ToolConfig, ToolCallbacks } from './AbstractTool';
import { HotSource } from '../lib/HotSource';

// Estados da ferramenta de seleção
type SelectToolState = 'idle' | 'selecting' | 'dragging';

// Interface para estado de dragging
interface DraggingState {
  featureId: string;
  startCoords: Position;
  originalGeometry: GeoJSON.Geometry;
  isDragging: boolean;
}

// Interface para configuração específica da SelectTool
export interface SelectToolConfig extends ToolConfig {
  enableDrag: boolean;
  dragThreshold: number; // pixels de movimento antes de iniciar drag
  multiSelectKey: 'ctrl' | 'shift';
}

// Callbacks específicos da SelectTool
export interface SelectToolCallbacks extends ToolCallbacks {
  onFeatureSelected: (featureId: string, mode: 'single' | 'add' | 'toggle') => void;
  onFeaturesDeselected: () => void;
  onDragStart: (featureId: string) => void;
  onDragEnd: (featureId: string, finalGeometry: GeoJSON.Geometry) => void;
}

export class SelectTool extends AbstractTool {
  private config: SelectToolConfig;
  private callbacks: SelectToolCallbacks;
  private hotSource: HotSource | null = null;

  // Estado da ferramenta
  private toolState: SelectToolState = 'idle';
  private draggingState: DraggingState | null = null;

  // Controle de drag
  private mouseDownPosition: Position | null = null;
  private dragStarted: boolean = false;

  constructor(
    map: maplibregl.Map,
    config: Partial<SelectToolConfig>,
    callbacks: SelectToolCallbacks,
    hotSource?: HotSource
  ) {
    // Configuração padrão específica da SelectTool
    const defaultConfig: SelectToolConfig = {
      snapToVertices: false,
      snapToEdges: false,
      snapTolerance: 10,
      showCoordinates: false,
      allowUndo: true,
      enableDrag: true,
      dragThreshold: 5,
      multiSelectKey: 'ctrl',
    };

    const finalConfig = { ...defaultConfig, ...config };
    super(map, finalConfig, callbacks);

    this.config = finalConfig;
    this.callbacks = callbacks;
    this.hotSource = hotSource || null;
  }

  // Implementação dos métodos abstratos
  getToolType(): DrawingTool {
    return 'select';
  }

  getName(): string {
    return 'Selecionar';
  }

  getDescription(): string {
    return 'Clique para selecionar features. Arraste para mover. Ctrl+clique para seleção múltipla';
  }

  getCursor(): string {
    switch (this.toolState) {
      case 'dragging':
        return 'move';
      case 'selecting':
        return 'pointer';
      default:
        return 'default';
    }
  }

  // Definir HotSource para operações de drag
  setHotSource(hotSource: HotSource): void {
    this.hotSource = hotSource;
  }

  // Eventos de mouse específicos da SelectTool
  protected onMouseDown(e: MapMouseEvent): void {
    if (!this.isActive) return;

    this.mouseDownPosition = [e.lngLat.lng, e.lngLat.lat];
    this.dragStarted = false;

    // Buscar features no ponto clicado
    const features = this.queryFeaturesAtPoint(e);

    if (features.length > 0) {
      const feature = features[0];
      const featureId = feature.properties?.featureId || feature.id;

      if (featureId) {
        // Determinar modo de seleção baseado nas teclas pressionadas
        const mode = this.getSelectionMode(e.originalEvent);

        // Selecionar a feature
        this.callbacks.onFeatureSelected(featureId as string, mode);

        // Preparar para possível drag se estiver habilitado
        if (this.config.enableDrag && this.hotSource) {
          this.prepareForDrag(featureId as string, feature);
        }

        this.toolState = 'selecting';
        this.updateCursor();
      }
    } else {
      // Clique no vazio - limpar seleção se não for multi-select
      if (!this.isMultiSelectActive(e.originalEvent)) {
        this.callbacks.onFeaturesDeselected();
      }
      this.toolState = 'idle';
      this.updateCursor();
    }
  }

  protected onMouseMove(e: MapMouseEvent): void {
    if (!this.isActive) return;

    super.onMouseMove(e);

    // Se estamos em modo de seleção e o mouse se moveu além do threshold, iniciar drag
    if (this.toolState === 'selecting' && this.mouseDownPosition && !this.dragStarted) {
      const currentPos: Position = [e.lngLat.lng, e.lngLat.lat];
      const distance = this.calculatePixelDistance(this.mouseDownPosition, currentPos);

      if (distance > this.config.dragThreshold) {
        this.startDrag();
      }
    }

    // Se estamos arrastando, atualizar posição
    if (this.toolState === 'dragging' && this.draggingState) {
      this.updateDrag(e);
    }
  }

  protected onMouseUp(e: MapMouseEvent): void {
    if (!this.isActive) return;

    if (this.toolState === 'dragging') {
      this.finishDrag();
    }

    // Reset do estado
    this.toolState = 'idle';
    this.mouseDownPosition = null;
    this.dragStarted = false;
    this.updateCursor();

    // Reabilitar pan do mapa
    this.map.dragPan.enable();
  }

  protected onKeyDown(e: MapKeyboardEvent): void {
    super.onKeyDown(e);

    const key = e.originalEvent.key;

    switch (key) {
      case 'Escape':
        if (this.toolState === 'dragging') {
          this.cancelDrag();
        }
        this.toolState = 'idle';
        this.updateCursor();
        break;
    }
  }

  // Métodos de drag
  private prepareForDrag(featureId: string, feature: any): void {
    if (!this.hotSource || !this.mouseDownPosition) return;

    // Preparar estado de dragging
    this.draggingState = {
      featureId,
      startCoords: [...this.mouseDownPosition],
      originalGeometry: feature.geometry,
      isDragging: false,
    };
  }

  private startDrag(): void {
    if (!this.draggingState || !this.hotSource) return;

    this.toolState = 'dragging';
    this.dragStarted = true;
    this.draggingState.isDragging = true;

    // Desabilitar pan do mapa durante drag
    this.map.dragPan.disable();

    // Adicionar feature ao HotSource para feedback visual
    const feature: ExtendedFeature = {
      id: this.draggingState.featureId,
      type: 'Feature',
      geometry: this.draggingState.originalGeometry,
      properties: {
        handle: 'body',
        featureId: this.draggingState.featureId,
      },
    };

    this.hotSource.addFeatureForDrag(feature);

    // Notificar início do drag
    this.callbacks.onDragStart(this.draggingState.featureId);
    this.callbacks.onStatusChange('Arrastando feature...');

    this.updateCursor();
  }

  private updateDrag(e: MapMouseEvent): void {
    if (!this.draggingState || !this.hotSource || !this.mouseDownPosition) return;

    const currentCoords: Position = [e.lngLat.lng, e.lngLat.lat];
    const startCoords = this.draggingState.startCoords;

    // Calcular deslocamento
    const dx = currentCoords[0] - startCoords[0];
    const dy = currentCoords[1] - startCoords[1];

    try {
      // Criar feature Turf para translação
      const originalFeature = {
        type: 'Feature' as const,
        geometry: this.draggingState.originalGeometry,
        properties: {},
      };

      // Calcular nova geometria usando Turf.js
      // IMPORTANTE: Usar geometria ORIGINAL para evitar erros cumulativos
      const movedFeature = transformTranslate(originalFeature, dx, dy, 'degrees');

      // Atualizar HotSource com nova geometria para feedback visual
      this.hotSource.updateGeometry(this.draggingState.featureId, movedFeature.geometry);

      // Atualizar status
      this.callbacks.onStatusChange(`Movendo feature: ${dx.toFixed(6)}°, ${dy.toFixed(6)}°`);
    } catch (error) {
      this.callbacks.onError(
        `Erro durante drag: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  private finishDrag(): void {
    if (!this.draggingState || !this.hotSource) return;

    try {
      // Obter geometria final do HotSource
      const finalFeature = this.hotSource.getFeature(this.draggingState.featureId);

      if (finalFeature) {
        // Notificar fim do drag com geometria final
        this.callbacks.onDragEnd(this.draggingState.featureId, finalFeature.geometry);
        this.callbacks.onStatusChange('Feature movida com sucesso');
      }

      // Limpar HotSource
      this.hotSource.removeFeature(this.draggingState.featureId);
    } catch (error) {
      this.callbacks.onError(
        `Erro ao finalizar drag: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }

    // Reset do estado
    this.draggingState = null;
  }

  private cancelDrag(): void {
    if (!this.draggingState || !this.hotSource) return;

    // Limpar HotSource sem salvar
    this.hotSource.removeFeature(this.draggingState.featureId);

    // Reset do estado
    this.draggingState = null;

    this.callbacks.onStatusChange('Arraste cancelado');
  }

  // Métodos utilitários
  private queryFeaturesAtPoint(e: MapMouseEvent): any[] {
    const point = this.map.project([e.lngLat.lng, e.lngLat.lat]);

    // Buscar features renderizadas no ponto
    return this.map.queryRenderedFeatures(point, {
      radius: 5,
      layers: [
        'cold-features-points',
        'cold-features-lines',
        'cold-features-polygons',
        'selected-features-points',
        'selected-features-lines',
        'selected-features-polygons',
        'hot-features-points',
        'hot-features-lines',
        'hot-features-polygons',
      ],
    });
  }

  private getSelectionMode(event: MouseEvent): 'single' | 'add' | 'toggle' {
    if (this.config.multiSelectKey === 'ctrl' && event.ctrlKey) {
      return 'toggle';
    } else if (this.config.multiSelectKey === 'shift' && event.shiftKey) {
      return 'add';
    }
    return 'single';
  }

  private isMultiSelectActive(event: MouseEvent): boolean {
    return (
      (this.config.multiSelectKey === 'ctrl' && event.ctrlKey) ||
      (this.config.multiSelectKey === 'shift' && event.shiftKey)
    );
  }

  private calculatePixelDistance(pos1: Position, pos2: Position): number {
    const point1 = this.map.project([pos1[0], pos1[1]]);
    const point2 = this.map.project([pos2[0], pos2[1]]);

    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  // Override do reset para limpar estado específico
  protected reset(): void {
    super.reset();

    this.toolState = 'idle';
    this.draggingState = null;
    this.mouseDownPosition = null;
    this.dragStarted = false;

    // Reabilitar pan do mapa
    this.map.dragPan.enable();
  }

  // Override do deactivate para cleanup
  deactivate(): void {
    // Cancelar drag se estiver ativo
    if (this.toolState === 'dragging') {
      this.cancelDrag();
    }

    super.deactivate();
  }

  // Getters para estado
  get isDragging(): boolean {
    return this.toolState === 'dragging';
  }

  get currentState(): SelectToolState {
    return this.toolState;
  }

  get draggedFeatureId(): string | null {
    return this.draggingState?.featureId || null;
  }
}
