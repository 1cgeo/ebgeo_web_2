// Path: features\drawing\tools\PointTool.ts

import { Position } from 'geojson';
import { ExtendedFeature, createDefaultFeature } from '../../data-access/schemas/feature.schema';
import { DrawingTool } from '../../../types/feature.types';
import { AbstractTool, MapMouseEvent, ToolConfig, ToolCallbacks } from './AbstractTool';

export class PointTool extends AbstractTool {
  private activeLayerId: string | null = null;

  constructor(map: maplibregl.Map, config: ToolConfig, callbacks: ToolCallbacks, layerId?: string) {
    super(map, config, callbacks);
    this.activeLayerId = layerId || null;
  }

  // Implementação dos métodos abstratos
  getToolType(): DrawingTool {
    return 'point';
  }

  getName(): string {
    return 'Ponto';
  }

  getDescription(): string {
    return 'Clique no mapa para criar um ponto';
  }

  getCursor(): string {
    return 'crosshair';
  }

  // Definir camada ativa para novos pontos
  setActiveLayer(layerId: string): void {
    this.activeLayerId = layerId;
  }

  // Eventos de mouse específicos do ponto
  protected onClick(e: MapMouseEvent): void {
    if (!this.isActive || !this.activeLayerId) {
      this.callbacks.onError('Nenhuma camada ativa selecionada');
      return;
    }

    try {
      // Aplicar snap se habilitado
      const snapResult = this.snapToFeatures([e.lngLat.lng, e.lngLat.lat]);
      const position: Position = snapResult.snapped
        ? snapResult.position
        : [e.lngLat.lng, e.lngLat.lat];

      // Criar feature de ponto
      const pointFeature = this.createPointFeature(position);

      if (pointFeature) {
        this.callbacks.onFeatureComplete(pointFeature);
        this.callbacks.onStatusChange('Ponto criado com sucesso');

        // Dar feedback visual
        this.showCreationFeedback(position);
      }
    } catch (error) {
      this.callbacks.onError(
        `Erro ao criar ponto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  protected onMouseMove(e: MapMouseEvent): void {
    super.onMouseMove(e);

    if (!this.isActive) return;

    // Mostrar preview do ponto
    this.showPointPreview([e.lngLat.lng, e.lngLat.lat]);

    // Atualizar status com coordenadas
    if (this.config.showCoordinates) {
      const coords = [e.lngLat.lng.toFixed(6), e.lngLat.lat.toFixed(6)];
      this.callbacks.onStatusChange(`Posição: ${coords[1]}, ${coords[0]}`);
    }
  }

  // Implementação dos métodos abstratos
  protected createFeatureFromCoordinates(): ExtendedFeature | null {
    // Para pontos, não usamos o array de coordenadas acumulado
    // O ponto é criado diretamente no onClick
    return null;
  }

  protected updateTempFeature(): void {
    // Para pontos, não há feature temporária sendo construída
    // O preview é atualizado no mousemove
  }

  protected clearTempFeatures(): void {
    // Limpar preview do ponto
    this.clearPointPreview();
  }

  // Métodos específicos do ponto
  private createPointFeature(position: Position): ExtendedFeature {
    if (!this.activeLayerId) {
      throw new Error('Camada ativa não definida');
    }

    const geometry = {
      type: 'Point' as const,
      coordinates: position,
    };

    const feature = createDefaultFeature(geometry, this.activeLayerId, {
      name: 'Novo Ponto',
      style: {
        markerColor: '#1976d2',
        markerSize: 8,
      },
    });

    return feature;
  }

  private showPointPreview(position: Position): void {
    if (!this.activeLayerId) return;

    try {
      // Criar feature temporária para preview
      const previewFeature = this.createTempFeature([position], 'Point');

      // Atualizar source hot-features com o preview
      const source = this.map.getSource('hot-features') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [previewFeature],
        });
      }
    } catch (error) {
      console.warn('Erro ao mostrar preview do ponto:', error);
    }
  }

  private clearPointPreview(): void {
    try {
      const source = this.map.getSource('hot-features') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    } catch (error) {
      console.warn('Erro ao limpar preview do ponto:', error);
    }
  }

  private showCreationFeedback(position: Position): void {
    // Animação simples de feedback visual
    try {
      const tempFeature = this.createTempFeature([position], 'Point');
      tempFeature.properties.style = {
        ...tempFeature.properties.style,
        markerColor: '#4caf50',
        markerSize: 12,
      };

      const source = this.map.getSource('hot-features') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [tempFeature],
        });

        // Limpar depois de um tempo
        setTimeout(() => {
          this.clearPointPreview();
        }, 500);
      }
    } catch (error) {
      console.warn('Erro ao mostrar feedback de criação:', error);
    }
  }

  // Método para criar ponto em posição específica (programaticamente)
  createPointAt(position: Position, properties?: any): ExtendedFeature | null {
    if (!this.activeLayerId) {
      this.callbacks.onError('Nenhuma camada ativa selecionada');
      return null;
    }

    try {
      const pointFeature = this.createPointFeature(position);

      // Aplicar propriedades adicionais se fornecidas
      if (properties) {
        pointFeature.properties = {
          ...pointFeature.properties,
          ...properties,
        };
      }

      this.callbacks.onFeatureComplete(pointFeature);
      this.callbacks.onStatusChange('Ponto criado programaticamente');

      return pointFeature;
    } catch (error) {
      this.callbacks.onError(
        `Erro ao criar ponto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
      return null;
    }
  }

  // Método para criar múltiplos pontos
  createPointsAt(positions: Position[], properties?: any[]): ExtendedFeature[] {
    const features: ExtendedFeature[] = [];

    positions.forEach((position, index) => {
      const props = properties?.[index] || {};
      const feature = this.createPointAt(position, props);
      if (feature) {
        features.push(feature);
      }
    });

    return features;
  }

  // Override do reset para limpar preview
  protected reset(): void {
    super.reset();
    this.clearPointPreview();
  }

  // Override da ativação para mostrar instruções
  activate(): void {
    super.activate();
    if (!this.activeLayerId) {
      this.callbacks.onStatusChange('Selecione uma camada antes de desenhar pontos');
    } else {
      this.callbacks.onStatusChange('Clique no mapa para criar um ponto');
    }
  }
}
