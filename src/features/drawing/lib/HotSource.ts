// Path: features\drawing\lib\HotSource.ts

import maplibregl from 'maplibre-gl';
import { Position } from 'geojson';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';

// Interface para callbacks do HotSource
export interface HotSourceCallbacks {
  onFeatureUpdated: (feature: ExtendedFeature) => void;
  onVertexMoved: (featureId: string, vertexIndex: number, newPosition: Position) => void;
  onVertexAdded: (featureId: string, vertexIndex: number, position: Position) => void;
  onVertexRemoved: (featureId: string, vertexIndex: number) => void;
  onError: (error: string) => void;
}

// Interface para configuração de edição
export interface EditConfig {
  enableVertexEdit: boolean;
  enableVertexAdd: boolean;
  enableVertexRemove: boolean;
  vertexRadius: number;
  midpointRadius: number;
  snapTolerance: number;
}

// Classe que gerencia features sendo editadas no "hot source"
export class HotSource {
  private map: maplibregl.Map;
  private callbacks: HotSourceCallbacks;
  private config: EditConfig;

  // Features sendo editadas
  private hotFeatures: Map<string, ExtendedFeature> = new Map();
  private editingFeatureId: string | null = null;

  // Estado de edição de vértices
  private isDragging: boolean = false;
  private dragVertexIndex: number = -1;
  private vertexHandles: maplibregl.Marker[] = [];
  private midpointHandles: maplibregl.Marker[] = [];

  // Event listeners
  private boundHandlers: Map<string, EventListener> = new Map();

  constructor(
    map: maplibregl.Map,
    callbacks: HotSourceCallbacks,
    config: Partial<EditConfig> = {}
  ) {
    this.map = map;
    this.callbacks = callbacks;
    this.config = {
      enableVertexEdit: true,
      enableVertexAdd: true,
      enableVertexRemove: true,
      vertexRadius: 6,
      midpointRadius: 4,
      snapTolerance: 10,
      ...config,
    };

    this.initialize();
  }

  // Inicializar o HotSource
  private initialize(): void {
    // Verificar se o source hot-features existe
    if (!this.map.getSource('hot-features')) {
      console.warn('Source hot-features não encontrado');
      return;
    }

    this.setupEventListeners();
  }

  // Configurar event listeners
  private setupEventListeners(): void {
    // Mouse events para arrastar vértices
    const onMouseDown = (e: MouseEvent) => this.handleMouseDown(e);
    const onMouseMove = (e: MouseEvent) => this.handleMouseMove(e);
    const onMouseUp = (e: MouseEvent) => this.handleMouseUp(e);

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Armazenar referências para cleanup
    this.boundHandlers.set('mousedown', onMouseDown);
    this.boundHandlers.set('mousemove', onMouseMove);
    this.boundHandlers.set('mouseup', onMouseUp);
  }

  // Adicionar feature para edição
  addFeature(feature: ExtendedFeature): void {
    this.hotFeatures.set(feature.id, feature);
    this.updateHotSource();
  }

  // Adicionar feature para edição com suporte a drag (nova funcionalidade)
  addFeatureForDrag(feature: ExtendedFeature): void {
    // Criar cópia da feature com identificação para drag
    const dragFeature: ExtendedFeature = {
      ...feature,
      properties: {
        ...feature.properties,
        handle: 'body', // Identificador para o corpo da geometria
        featureId: feature.id,
      },
    };

    this.hotFeatures.set(feature.id, dragFeature);
    this.updateHotSource();
  }

  // Remover feature da edição
  removeFeature(featureId: string): void {
    this.hotFeatures.delete(featureId);

    if (this.editingFeatureId === featureId) {
      this.stopEditingVertices();
    }

    this.updateHotSource();
  }

  // Limpar todas as features
  clear(): void {
    this.hotFeatures.clear();
    this.stopEditingVertices();
    this.updateHotSource();
  }

  // Atualizar feature específica
  updateFeature(feature: ExtendedFeature): void {
    if (this.hotFeatures.has(feature.id)) {
      this.hotFeatures.set(feature.id, feature);
      this.updateHotSource();

      // Atualizar handles de vértices se estiver editando
      if (this.editingFeatureId === feature.id) {
        this.updateVertexHandles(feature);
      }
    }
  }

  // Atualizar geometria de uma feature (usado durante drag)
  updateGeometry(featureId: string, newGeometry: GeoJSON.Geometry): void {
    const feature = this.hotFeatures.get(featureId);
    if (feature) {
      const updatedFeature: ExtendedFeature = {
        ...feature,
        geometry: newGeometry,
      };
      this.hotFeatures.set(featureId, updatedFeature);
      this.updateHotSource();
    }
  }

  // Obter feature específica
  getFeature(featureId: string): ExtendedFeature | undefined {
    return this.hotFeatures.get(featureId);
  }

  // Iniciar edição de vértices para uma feature
  startEditingVertices(featureId: string): void {
    const feature = this.hotFeatures.get(featureId);
    if (!feature) {
      this.callbacks.onError('Feature não encontrada no hot source');
      return;
    }

    if (!this.config.enableVertexEdit) {
      this.callbacks.onError('Edição de vértices não habilitada');
      return;
    }

    // Parar edição anterior se houver
    this.stopEditingVertices();

    this.editingFeatureId = featureId;
    this.createVertexHandles(feature);
  }

  // Parar edição de vértices
  stopEditingVertices(): void {
    this.editingFeatureId = null;
    this.clearVertexHandles();
    this.isDragging = false;
    this.dragVertexIndex = -1;
  }

  // Atualizar o source hot-features do mapa
  private updateHotSource(): void {
    try {
      const source = this.map.getSource('hot-features') as maplibregl.GeoJSONSource;
      if (source) {
        const features = Array.from(this.hotFeatures.values());
        source.setData({
          type: 'FeatureCollection',
          features,
        });
      }
    } catch (error) {
      this.callbacks.onError(
        `Erro ao atualizar hot source: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Criar handles visuais para os vértices
  private createVertexHandles(feature: ExtendedFeature): void {
    this.clearVertexHandles();

    const vertices = this.getFeatureVertices(feature);

    // Criar handles para cada vértice
    vertices.forEach((vertex, index) => {
      this.createVertexMarker(vertex, index);
    });

    // Criar handles de midpoint se habilitado
    if (this.config.enableVertexAdd && vertices.length > 1) {
      this.createMidpointHandles(vertices);
    }
  }

  // Criar marker para um vértice
  private createVertexMarker(position: Position, index: number): void {
    const el = document.createElement('div');
    el.className = 'vertex-handle';
    el.style.width = `${this.config.vertexRadius * 2}px`;
    el.style.height = `${this.config.vertexRadius * 2}px`;
    el.style.backgroundColor = '#ffffff';
    el.style.border = '2px solid #1976d2';
    el.style.borderRadius = '50%';
    el.style.cursor = 'move';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

    // Event listeners para arrastar
    el.addEventListener('mousedown', e => {
      this.startDragVertex(index, e);
    });

    // Context menu para remover vértice
    if (this.config.enableVertexRemove) {
      el.addEventListener('contextmenu', e => {
        e.preventDefault();
        this.removeVertex(index);
      });
    }

    const marker = new maplibregl.Marker({
      element: el,
      draggable: false, // Controlamos o drag manualmente
    })
      .setLngLat([position[0], position[1]])
      .addTo(this.map);

    this.vertexHandles.push(marker);
  }

  // Criar handles de midpoint para adicionar vértices
  private createMidpointHandles(vertices: Position[]): void {
    for (let i = 0; i < vertices.length - 1; i++) {
      const midpoint = this.calculateMidpoint(vertices[i], vertices[i + 1]);
      this.createMidpointMarker(midpoint, i + 1);
    }

    // Para polígonos, adicionar midpoint entre último e primeiro vértice
    const feature = this.hotFeatures.get(this.editingFeatureId!);
    if (feature && feature.geometry.type === 'Polygon') {
      const lastIndex = vertices.length - 1;
      const midpoint = this.calculateMidpoint(vertices[lastIndex], vertices[0]);
      this.createMidpointMarker(midpoint, 0);
    }
  }

  // Criar marker de midpoint
  private createMidpointMarker(position: Position, insertIndex: number): void {
    const el = document.createElement('div');
    el.className = 'midpoint-handle';
    el.style.width = `${this.config.midpointRadius * 2}px`;
    el.style.height = `${this.config.midpointRadius * 2}px`;
    el.style.backgroundColor = '#ffffff';
    el.style.border = '1px solid #757575';
    el.style.borderRadius = '50%';
    el.style.cursor = 'pointer';
    el.style.opacity = '0.7';

    el.addEventListener('mousedown', e => {
      e.stopPropagation();
      this.addVertex(insertIndex, position);
    });

    const marker = new maplibregl.Marker({
      element: el,
      draggable: false,
    })
      .setLngLat([position[0], position[1]])
      .addTo(this.map);

    this.midpointHandles.push(marker);
  }

  // Limpar todos os handles
  private clearVertexHandles(): void {
    this.vertexHandles.forEach(marker => marker.remove());
    this.vertexHandles = [];

    this.midpointHandles.forEach(marker => marker.remove());
    this.midpointHandles = [];
  }

  // Recriar handles após mudança na geometria
  private recreateVertexHandles(feature: ExtendedFeature): void {
    if (this.editingFeatureId === feature.id) {
      this.createVertexHandles(feature);
    }
  }

  // Obter vértices de uma feature
  private getFeatureVertices(feature: ExtendedFeature): Position[] {
    switch (feature.geometry.type) {
      case 'Point':
        return [feature.geometry.coordinates as Position];
      case 'LineString':
        return feature.geometry.coordinates as Position[];
      case 'Polygon':
        return (feature.geometry.coordinates as Position[][])[0].slice(0, -1); // Remove último ponto duplicado
      default:
        return [];
    }
  }

  // Calcular ponto médio entre duas posições
  private calculateMidpoint(pos1: Position, pos2: Position): Position {
    return [(pos1[0] + pos2[0]) / 2, (pos1[1] + pos2[1]) / 2];
  }

  // Iniciar arrastar vértice
  private startDragVertex(vertexIndex: number, event: MouseEvent): void {
    this.isDragging = true;
    this.dragVertexIndex = vertexIndex;
    this.map.getCanvas().style.cursor = 'move';
    event.preventDefault();
  }

  // Handlers de mouse para arrastar
  private handleMouseDown(e: MouseEvent): void {
    // Implementado no createVertexMarker
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging || this.dragVertexIndex === -1 || !this.editingFeatureId) return;

    // Converter posição do mouse para coordenadas do mapa
    const rect = this.map.getContainer().getBoundingClientRect();
    const point = new maplibregl.Point(e.clientX - rect.left, e.clientY - rect.top);
    const lngLat = this.map.unproject(point);
    const newPosition: Position = [lngLat.lng, lngLat.lat];

    this.moveVertex(this.dragVertexIndex, newPosition);
  }

  private handleMouseUp(e: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragVertexIndex = -1;
      this.map.getCanvas().style.cursor = '';
    }
  }

  // Mover vértice
  private moveVertex(vertexIndex: number, newPosition: Position): void {
    if (!this.editingFeatureId) return;

    const feature = this.hotFeatures.get(this.editingFeatureId);
    if (!feature) return;

    try {
      const updatedFeature = this.updateVertexPosition(feature, vertexIndex, newPosition);
      this.updateFeature(updatedFeature);
      this.callbacks.onVertexMoved(this.editingFeatureId, vertexIndex, newPosition);
    } catch (error) {
      this.callbacks.onError(
        `Erro ao mover vértice: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Adicionar vértice
  private addVertex(vertexIndex: number, position: Position): void {
    if (!this.editingFeatureId) return;

    const feature = this.hotFeatures.get(this.editingFeatureId);
    if (!feature) return;

    try {
      const updatedFeature = this.insertVertex(feature, vertexIndex, position);
      this.updateFeature(updatedFeature);
      this.recreateVertexHandles(updatedFeature);
      this.callbacks.onVertexAdded(this.editingFeatureId, vertexIndex, position);
    } catch (error) {
      this.callbacks.onError(
        `Erro ao adicionar vértice: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Remover vértice
  private removeVertex(vertexIndex: number): void {
    if (!this.editingFeatureId) return;

    const feature = this.hotFeatures.get(this.editingFeatureId);
    if (!feature) return;

    try {
      const updatedFeature = this.deleteVertex(feature, vertexIndex);
      if (updatedFeature) {
        this.updateFeature(updatedFeature);
        this.recreateVertexHandles(updatedFeature);
        this.callbacks.onVertexRemoved(this.editingFeatureId, vertexIndex);
      }
    } catch (error) {
      this.callbacks.onError(
        `Erro ao remover vértice: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Métodos auxiliares para manipulação de geometria
  private updateVertexPosition(
    feature: ExtendedFeature,
    vertexIndex: number,
    newPosition: Position
  ): ExtendedFeature {
    const updatedFeature = { ...feature };

    if (feature.geometry.type === 'Point') {
      updatedFeature.geometry = {
        ...feature.geometry,
        coordinates: newPosition,
      };
    } else if (feature.geometry.type === 'LineString') {
      const coords = [...feature.geometry.coordinates] as Position[];
      coords[vertexIndex] = newPosition;
      updatedFeature.geometry = {
        ...feature.geometry,
        coordinates: coords,
      };
    } else if (feature.geometry.type === 'Polygon') {
      const coords = [...feature.geometry.coordinates] as Position[][];
      const ring = [...coords[0]];
      ring[vertexIndex] = newPosition;

      // Atualizar último ponto se for igual ao primeiro
      if (vertexIndex === 0) {
        ring[ring.length - 1] = newPosition;
      }

      coords[0] = ring;
      updatedFeature.geometry = {
        ...feature.geometry,
        coordinates: coords,
      };
    }

    return updatedFeature;
  }

  private insertVertex(
    feature: ExtendedFeature,
    vertexIndex: number,
    position: Position
  ): ExtendedFeature {
    const updatedFeature = { ...feature };

    if (feature.geometry.type === 'LineString') {
      const coords = [...feature.geometry.coordinates] as Position[];
      coords.splice(vertexIndex, 0, position);
      updatedFeature.geometry = {
        ...feature.geometry,
        coordinates: coords,
      };
    } else if (feature.geometry.type === 'Polygon') {
      const coords = [...feature.geometry.coordinates] as Position[][];
      const ring = [...coords[0]];
      ring.splice(vertexIndex, 0, position);
      coords[0] = ring;
      updatedFeature.geometry = {
        ...feature.geometry,
        coordinates: coords,
      };
    }

    return updatedFeature;
  }

  private deleteVertex(feature: ExtendedFeature, vertexIndex: number): ExtendedFeature | null {
    if (feature.geometry.type === 'LineString') {
      const coords = [...feature.geometry.coordinates] as Position[];
      if (coords.length <= 2) {
        this.callbacks.onError('Linha deve ter pelo menos 2 pontos');
        return null;
      }
      coords.splice(vertexIndex, 1);
      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: coords,
        },
      };
    } else if (feature.geometry.type === 'Polygon') {
      const coords = [...feature.geometry.coordinates] as Position[][];
      const ring = [...coords[0]];
      if (ring.length <= 4) {
        // 3 pontos + fechamento
        this.callbacks.onError('Polígono deve ter pelo menos 3 pontos');
        return null;
      }
      ring.splice(vertexIndex, 1);
      coords[0] = ring;
      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: coords,
        },
      };
    }

    return null;
  }

  // Atualizar handles de vértices
  private updateVertexHandles(feature: ExtendedFeature): void {
    // Atualizar posições dos handles existentes
    const coords = this.getFeatureVertices(feature);

    this.vertexHandles.forEach((marker, index) => {
      if (coords[index]) {
        marker.setLngLat([coords[index][0], coords[index][1]]);
      }
    });
  }

  // Cleanup
  destroy(): void {
    this.stopEditingVertices();
    this.clear();

    // Remover event listeners
    this.boundHandlers.forEach((handler, event) => {
      document.removeEventListener(event, handler);
    });
    this.boundHandlers.clear();
  }
}
