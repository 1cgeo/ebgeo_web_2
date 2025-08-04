// Path: features\drawing\lib\DrawingManager.ts

import maplibregl from 'maplibre-gl';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { DrawingTool } from '../../../types/feature.types';
import { AbstractTool, ToolConfig, ToolCallbacks } from '../tools/AbstractTool';
import { PointTool } from '../tools/PointTool';
import { LineTool } from '../tools/LineTool';
import { SelectTool, SelectToolCallbacks } from '../tools/SelectTool';
import { HotSource } from './HotSource';

// Interface para configuração do manager
export interface DrawingManagerConfig {
  defaultTool: DrawingTool;
  enableKeyboardShortcuts: boolean;
  toolConfig: ToolConfig;
}

// Interface para callbacks do manager
export interface DrawingManagerCallbacks {
  onFeatureCreated: (feature: ExtendedFeature) => void;
  onFeatureUpdated: (feature: ExtendedFeature) => void;
  onToolChanged: (tool: DrawingTool) => void;
  onError: (error: string) => void;
  onStatusChange: (status: string) => void;
  // Novos callbacks para seleção e drag
  onFeatureSelected?: (featureId: string, mode: 'single' | 'add' | 'toggle') => void;
  onFeaturesDeselected?: () => void;
  onFeatureDragStart?: (featureId: string) => void;
  onFeatureDragEnd?: (featureId: string, finalGeometry: GeoJSON.Geometry) => void;
}

// Estado global de dragging
interface GlobalDragState {
  isDragging: boolean;
  draggedFeatureId: string | null;
  startTime: number | null;
}

// Classe principal que gerencia todas as ferramentas de desenho
export class DrawingManager {
  private map: maplibregl.Map;
  private config: DrawingManagerConfig;
  private callbacks: DrawingManagerCallbacks;
  private hotSource: HotSource;

  // Ferramentas disponíveis
  private tools: Map<DrawingTool, AbstractTool> = new Map();
  private activeTool: AbstractTool | null = null;
  private activeLayerId: string | null = null;

  // Estado do manager
  private isEnabled: boolean = false;
  private isInitialized: boolean = false;

  // Estado global de dragging
  private dragState: GlobalDragState = {
    isDragging: false,
    draggedFeatureId: null,
    startTime: null,
  };

  constructor(
    map: maplibregl.Map,
    hotSource: HotSource,
    config: DrawingManagerConfig,
    callbacks: DrawingManagerCallbacks
  ) {
    this.map = map;
    this.hotSource = hotSource;
    this.config = config;
    this.callbacks = callbacks;

    this.initialize();
  }

  // Inicializar o manager e suas ferramentas
  private initialize(): void {
    if (this.isInitialized) return;

    try {
      // Criar callbacks base para as ferramentas
      const baseToolCallbacks: ToolCallbacks = {
        onFeatureComplete: feature => {
          this.callbacks.onFeatureCreated(feature);
        },
        onFeatureUpdate: feature => {
          this.callbacks.onFeatureUpdated(feature);
        },
        onCancel: () => {
          this.callbacks.onStatusChange('Operação cancelada');
        },
        onError: error => {
          this.callbacks.onError(error);
        },
        onStatusChange: status => {
          this.callbacks.onStatusChange(status);
        },
      };

      // Callbacks específicos para SelectTool
      const selectToolCallbacks: SelectToolCallbacks = {
        ...baseToolCallbacks,
        onFeatureSelected: (featureId, mode) => {
          this.callbacks.onFeatureSelected?.(featureId, mode);
        },
        onFeaturesDeselected: () => {
          this.callbacks.onFeaturesDeselected?.();
        },
        onDragStart: featureId => {
          this.startGlobalDrag(featureId);
          this.callbacks.onFeatureDragStart?.(featureId);
        },
        onDragEnd: (featureId, finalGeometry) => {
          this.endGlobalDrag();
          this.callbacks.onFeatureDragEnd?.(featureId, finalGeometry);
        },
      };

      // Criar ferramentas
      this.tools.set(
        'select',
        new SelectTool(this.map, this.config.toolConfig, selectToolCallbacks, this.hotSource)
      );

      this.tools.set('point', new PointTool(this.map, this.config.toolConfig, baseToolCallbacks));

      this.tools.set('line', new LineTool(this.map, this.config.toolConfig, baseToolCallbacks));

      // Ativar ferramenta padrão
      this.setActiveTool(this.config.defaultTool);

      // Configurar atalhos de teclado se habilitado
      if (this.config.enableKeyboardShortcuts) {
        this.setupKeyboardShortcuts();
      }

      this.isInitialized = true;
      this.callbacks.onStatusChange('Drawing Manager inicializado');
    } catch (error) {
      this.callbacks.onError(
        `Erro ao inicializar Drawing Manager: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Configurar atalhos de teclado
  private setupKeyboardShortcuts(): void {
    const keyboardHandler = (e: KeyboardEvent) => {
      if (!this.isEnabled) return;

      // Não processar se estiver em um input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '1':
          if (e.ctrlKey) {
            e.preventDefault();
            this.setActiveTool('select');
          }
          break;
        case '2':
          if (e.ctrlKey) {
            e.preventDefault();
            this.setActiveTool('point');
          }
          break;
        case '3':
          if (e.ctrlKey) {
            e.preventDefault();
            this.setActiveTool('line');
          }
          break;
        case 'Escape':
          if (this.dragState.isDragging) {
            e.preventDefault();
            this.cancelDrag();
          }
          break;
      }
    };

    document.addEventListener('keydown', keyboardHandler);
    (this as any).keyboardHandler = keyboardHandler;
  }

  // Gerenciamento de ferramentas
  setActiveTool(toolType: DrawingTool): boolean {
    if (!this.isInitialized) {
      this.callbacks.onError('Drawing Manager não inicializado');
      return false;
    }

    // Não permitir troca de ferramenta durante drag
    if (this.dragState.isDragging) {
      this.callbacks.onError('Não é possível trocar de ferramenta durante arraste');
      return false;
    }

    const tool = this.tools.get(toolType);
    if (!tool) {
      this.callbacks.onError(`Ferramenta ${toolType} não encontrada`);
      return false;
    }

    try {
      // Desativar ferramenta atual
      if (this.activeTool) {
        this.activeTool.deactivate();
      }

      // Ativar nova ferramenta
      this.activeTool = tool;

      if (this.isEnabled) {
        this.activeTool.activate();
      }

      // Configurar camada ativa se disponível
      if (this.activeLayerId && 'setActiveLayer' in tool) {
        (tool as any).setActiveLayer(this.activeLayerId);
      }

      // Configurar HotSource para SelectTool
      if (toolType === 'select' && tool instanceof SelectTool) {
        tool.setHotSource(this.hotSource);
      }

      this.callbacks.onToolChanged(toolType);
      this.callbacks.onStatusChange(`Ferramenta ${tool.getName()} ativada`);

      return true;
    } catch (error) {
      this.callbacks.onError(
        `Erro ao ativar ferramenta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
      return false;
    }
  }

  // Habilitar/desabilitar manager
  enable(): void {
    if (!this.isInitialized) {
      this.callbacks.onError('Drawing Manager não inicializado');
      return;
    }

    this.isEnabled = true;

    if (this.activeTool) {
      this.activeTool.activate();
    }

    this.callbacks.onStatusChange('Drawing Manager habilitado');
  }

  disable(): void {
    // Cancelar drag se estiver ativo
    if (this.dragState.isDragging) {
      this.cancelDrag();
    }

    this.isEnabled = false;

    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    this.callbacks.onStatusChange('Drawing Manager desabilitado');
  }

  // Gerenciamento de camada ativa
  setActiveLayer(layerId: string): void {
    this.activeLayerId = layerId;

    // Atualizar ferramenta ativa se tiver o método
    if (this.activeTool && 'setActiveLayer' in this.activeTool) {
      (this.activeTool as any).setActiveLayer(layerId);
    }

    this.callbacks.onStatusChange(`Camada ativa: ${layerId}`);
  }

  // Gerenciamento de estado de drag
  private startGlobalDrag(featureId: string): void {
    this.dragState = {
      isDragging: true,
      draggedFeatureId: featureId,
      startTime: Date.now(),
    };

    // Desabilitar interações do mapa que podem interferir
    this.map.boxZoom.disable();
    this.map.doubleClickZoom.disable();

    this.callbacks.onStatusChange(`Iniciando arraste da feature: ${featureId}`);
  }

  private endGlobalDrag(): void {
    const duration = this.dragState.startTime ? Date.now() - this.dragState.startTime : 0;

    this.dragState = {
      isDragging: false,
      draggedFeatureId: null,
      startTime: null,
    };

    // Reabilitar interações do mapa
    this.map.boxZoom.enable();
    this.map.doubleClickZoom.enable();

    this.callbacks.onStatusChange(`Arraste finalizado em ${duration}ms`);
  }

  private cancelDrag(): void {
    if (!this.dragState.isDragging) return;

    // Notificar ferramenta ativa para cancelar drag
    if (this.activeTool instanceof SelectTool) {
      // Forçar cancelamento via ESC
      this.activeTool['onKeyDown']({
        originalEvent: new KeyboardEvent('keydown', { key: 'Escape' }),
      });
    }

    this.endGlobalDrag();
    this.callbacks.onStatusChange('Arraste cancelado');
  }

  // Métodos de informação
  getActiveToolInfo(): {
    name: string;
    description: string;
    isDrawing: boolean;
    canFinish: boolean;
  } | null {
    if (!this.activeTool) return null;

    return {
      name: this.activeTool.getName(),
      description: this.activeTool.getDescription(),
      isDrawing: this.activeTool.drawing,
      canFinish: (this.activeTool as any).canFinish || false,
    };
  }

  // Verificações de estado
  isDrawing(): boolean {
    return this.activeTool?.drawing || false;
  }

  isDragging(): boolean {
    return this.dragState.isDragging;
  }

  getDraggedFeatureId(): string | null {
    return this.dragState.draggedFeatureId;
  }

  canSwitchTool(): boolean {
    return !this.isDrawing() && !this.isDragging();
  }

  // Métodos para criação programática
  createPoint(position: [number, number], properties?: any): ExtendedFeature | null {
    const pointTool = this.tools.get('point') as PointTool;
    if (!pointTool) {
      this.callbacks.onError('Ferramenta de ponto não disponível');
      return null;
    }

    return pointTool.createPointAt(position, properties);
  }

  createLine(positions: [number, number][], properties?: any): ExtendedFeature | null {
    const lineTool = this.tools.get('line') as LineTool;
    if (!lineTool) {
      this.callbacks.onError('Ferramenta de linha não disponível');
      return null;
    }

    return lineTool.createLineFromPoints(positions, properties);
  }

  // Cleanup
  destroy(): void {
    // Cancelar drag se estiver ativo
    if (this.dragState.isDragging) {
      this.cancelDrag();
    }

    // Desativar ferramenta atual
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // Remover event listeners
    if ((this as any).keyboardHandler) {
      document.removeEventListener('keydown', (this as any).keyboardHandler);
    }

    // Limpar ferramentas
    this.tools.clear();
    this.activeTool = null;
    this.isEnabled = false;
    this.isInitialized = false;

    this.callbacks.onStatusChange('Drawing Manager destruído');
  }

  // Getters para estado
  get enabled(): boolean {
    return this.isEnabled;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  get availableTools(): DrawingTool[] {
    return Array.from(this.tools.keys());
  }

  get activeToolType(): DrawingTool | null {
    return this.activeTool?.getToolType() || null;
  }

  get dragState(): GlobalDragState {
    return { ...this.dragState };
  }
}

// Factory function para criar o manager
export const createDrawingManager = (
  map: maplibregl.Map,
  hotSource: HotSource,
  callbacks: DrawingManagerCallbacks,
  config?: Partial<DrawingManagerConfig>
): DrawingManager => {
  const defaultConfig: DrawingManagerConfig = {
    defaultTool: 'select',
    enableKeyboardShortcuts: true,
    toolConfig: {
      snapToVertices: true,
      snapToEdges: false,
      snapTolerance: 10,
      showCoordinates: true,
      allowUndo: true,
    },
  };

  const finalConfig = { ...defaultConfig, ...config };
  return new DrawingManager(map, hotSource, finalConfig, callbacks);
};
