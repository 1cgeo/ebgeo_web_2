// Path: features\drawing\tools\LineTool.ts

import { Position } from 'geojson';
import { ExtendedFeature, createDefaultFeature } from '../../data-access/schemas/feature.schema';
import { DrawingTool } from '../../../types/feature.types';
import { AbstractTool, MapMouseEvent, ToolConfig, ToolCallbacks } from './AbstractTool';

export class LineTool extends AbstractTool {
  private activeLayerId: string | null = null;
  private minPoints: number = 2;
  private maxPoints: number = 1000;
  private lastClickTime: number = 0;
  private doubleClickDelay: number = 300; // ms

  constructor(map: maplibregl.Map, config: ToolConfig, callbacks: ToolCallbacks, layerId?: string) {
    super(map, config, callbacks);
    this.activeLayerId = layerId || null;
  }

  // Implementação dos métodos abstratos
  getToolType(): DrawingTool {
    return 'line';
  }

  getName(): string {
    return 'Linha';
  }

  getDescription(): string {
    return 'Clique para adicionar pontos à linha. Duplo clique ou Enter para finalizar';
  }

  getCursor(): string {
    return this.isDrawing ? 'crosshair' : 'crosshair';
  }

  // Definir camada ativa para novas linhas
  setActiveLayer(layerId: string): void {
    this.activeLayerId = layerId;
  }

  // Configurar limites de pontos
  setPointLimits(min: number, max: number): void {
    this.minPoints = Math.max(2, min);
    this.maxPoints = Math.max(this.minPoints, max);
  }

  // Eventos de mouse específicos da linha
  protected onClick(e: MapMouseEvent): void {
    if (!this.isActive || !this.activeLayerId) {
      this.callbacks.onError('Nenhuma camada ativa selecionada');
      return;
    }

    const currentTime = Date.now();
    const isDoubleClick = currentTime - this.lastClickTime < this.doubleClickDelay;
    this.lastClickTime = currentTime;

    // Se for duplo clique, finalizar linha
    if (isDoubleClick && this.isDrawing) {
      this.finishDrawing();
      return;
    }

    try {
      // Aplicar snap se habilitado
      const snapResult = this.snapToFeatures([e.lngLat.lng, e.lngLat.lat]);
      const position: Position = snapResult.snapped
        ? snapResult.position
        : [e.lngLat.lng, e.lngLat.lat];

      if (!this.isDrawing) {
        // Iniciar nova linha
        this.startDrawing();
        this.addPoint(position);
        this.callbacks.onStatusChange(
          `Linha iniciada. ${this.coordinateCount}/${this.maxPoints} pontos`
        );
      } else {
        // Adicionar ponto à linha existente
        if (this.coordinateCount < this.maxPoints) {
          this.addPoint(position);
          this.callbacks.onStatusChange(
            `${this.coordinateCount}/${this.maxPoints} pontos. Duplo clique para finalizar`
          );
        } else {
          this.callbacks.onStatusChange(
            'Número máximo de pontos atingido. Duplo clique para finalizar'
          );
        }
      }

      this.updateTempFeature();
    } catch (error) {
      this.callbacks.onError(
        `Erro ao adicionar ponto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  protected onMouseMove(e: MapMouseEvent): void {
    super.onMouseMove(e);

    if (!this.isActive) return;

    if (this.isDrawing) {
      // Mostrar preview da linha com o cursor
      this.showLinePreview([e.lngLat.lng, e.lngLat.lat]);
    }

    // Atualizar status com coordenadas
    if (this.config.showCoordinates) {
      const coords = [e.lngLat.lng.toFixed(6), e.lngLat.lat.toFixed(6)];
      const status = this.isDrawing
        ? `${this.coordinateCount} pontos - Posição: ${coords[1]}, ${coords[0]}`
        : `Posição: ${coords[1]}, ${coords[0]}`;
      this.callbacks.onStatusChange(status);
    }
  }

  protected onDoubleClick(e: MapMouseEvent): void {
    e.originalEvent.preventDefault();
    if (this.isDrawing) {
      this.finishDrawing();
    }
  }

  protected onKeyDown(e: MapKeyboardEvent): void {
    super.onKeyDown(e);

    const key = e.originalEvent.key;

    if (this.isDrawing) {
      switch (key) {
        case 'Backspace':
        case 'Delete':
          this.removeLastPoint();
          break;
        case ' ': // Espaço para adicionar ponto na posição atual do mouse
          if (this.lastMousePosition) {
            const position: Position = [this.lastMousePosition.lng, this.lastMousePosition.lat];
            this.addPoint(position);
            this.updateTempFeature();
          }
          e.originalEvent.preventDefault();
          break;
      }
    }
  }

  // Implementação dos métodos abstratos
  protected createFeatureFromCoordinates(): ExtendedFeature | null {
    if (!this.activeLayerId || this.coordinates.length < this.minPoints) {
      return null;
    }

    const geometry = {
      type: 'LineString' as const,
      coordinates: this.coordinates,
    };

    const feature = createDefaultFeature(geometry, this.activeLayerId, {
      name: 'Nova Linha',
      style: {
        strokeColor: '#1976d2',
        strokeWidth: 3,
        strokeOpacity: 1,
      },
    });

    return feature;
  }

  protected updateTempFeature(): void {
    if (!this.isDrawing || this.coordinates.length === 0) {
      this.clearTempFeatures();
      return;
    }

    try {
      let tempCoords = [...this.coordinates];

      // Adicionar posição do mouse se houver pelo menos um ponto
      if (this.lastMousePosition && this.coordinates.length >= 1) {
        tempCoords.push([this.lastMousePosition.lng, this.lastMousePosition.lat]);
      }

      if (tempCoords.length >= 2) {
        const tempFeature = this.createTempFeature(tempCoords, 'LineString');
        this.showTempFeature(tempFeature);
      }
    } catch (error) {
      console.warn('Erro ao atualizar feature temporária:', error);
    }
  }

  protected clearTempFeatures(): void {
    try {
      const source = this.map.getSource('hot-features') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    } catch (error) {
      console.warn('Erro ao limpar features temporárias:', error);
    }
  }

  // Métodos específicos da linha
  private addPoint(position: Position): void {
    // Verificar se não é muito próximo do último ponto
    if (this.coordinates.length > 0) {
      const lastPoint = this.coordinates[this.coordinates.length - 1];
      const distance = this.calculateDistance(lastPoint, position);

      // Distância mínima de 1 metro entre pontos
      if (distance < 1) {
        this.callbacks.onStatusChange('Ponto muito próximo do anterior');
        return;
      }
    }

    this.coordinates.push(position);
  }

  private removeLastPoint(): void {
    if (this.coordinates.length > 0) {
      this.coordinates.pop();
      this.updateTempFeature();

      if (this.coordinates.length === 0) {
        this.cancel();
      } else {
        this.callbacks.onStatusChange(
          `${this.coordinateCount} pontos. Backspace para remover ponto`
        );
      }
    }
  }

  private showLinePreview(mousePosition: Position): void {
    if (!this.isDrawing || this.coordinates.length === 0) return;

    try {
      const previewCoords = [...this.coordinates, mousePosition];
      const previewFeature = this.createTempFeature(previewCoords, 'LineString');
      previewFeature.properties.style = {
        ...previewFeature.properties.style,
        strokeOpacity: 0.6,
      };

      this.showTempFeature(previewFeature);
    } catch (error) {
      console.warn('Erro ao mostrar preview da linha:', error);
    }
  }

  private showTempFeature(feature: ExtendedFeature): void {
    try {
      const source = this.map.getSource('hot-features') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [feature],
        });
      }
    } catch (error) {
      console.warn('Erro ao mostrar feature temporária:', error);
    }
  }

  private calculateDistance(point1: Position, point2: Position): number {
    // Cálculo simples de distância em metros (aproximado)
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;

    const R = 6371000; // Raio da Terra em metros
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Finalizar desenho com validação
  protected finishDrawing(): void {
    if (!this.isDrawing) return;

    if (this.coordinates.length < this.minPoints) {
      this.callbacks.onError(`Linha deve ter pelo menos ${this.minPoints} pontos`);
      return;
    }

    super.finishDrawing();
  }

  // Método para criar linha programaticamente
  createLineFromPoints(positions: Position[], properties?: any): ExtendedFeature | null {
    if (!this.activeLayerId) {
      this.callbacks.onError('Nenhuma camada ativa selecionada');
      return null;
    }

    if (positions.length < this.minPoints) {
      this.callbacks.onError(`Linha deve ter pelo menos ${this.minPoints} pontos`);
      return null;
    }

    try {
      const geometry = {
        type: 'LineString' as const,
        coordinates: positions,
      };

      const feature = createDefaultFeature(geometry, this.activeLayerId, {
        name: 'Nova Linha',
        style: {
          strokeColor: '#1976d2',
          strokeWidth: 3,
          strokeOpacity: 1,
        },
        ...properties,
      });

      this.callbacks.onFeatureComplete(feature);
      this.callbacks.onStatusChange('Linha criada programaticamente');

      return feature;
    } catch (error) {
      this.callbacks.onError(
        `Erro ao criar linha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
      return null;
    }
  }

  // Override da ativação para mostrar instruções
  activate(): void {
    super.activate();
    if (!this.activeLayerId) {
      this.callbacks.onStatusChange('Selecione uma camada antes de desenhar linhas');
    } else {
      this.callbacks.onStatusChange('Clique para iniciar a linha');
    }
  }

  // Override do reset
  protected reset(): void {
    super.reset();
    this.clearTempFeatures();
  }

  // Getter para número de pontos mínimo/máximo
  get pointLimits(): { min: number; max: number } {
    return { min: this.minPoints, max: this.maxPoints };
  }

  // Verificar se pode finalizar
  get canFinish(): boolean {
    return this.isDrawing && this.coordinates.length >= this.minPoints;
  }
}
