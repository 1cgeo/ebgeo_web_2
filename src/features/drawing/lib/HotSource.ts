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
      this.callbacks.onError(`Erro ao atualizar hot source: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Criar handles de vértices para edição
  private createVertexHandles(feature: ExtendedFeature): void {
    if (feature.geometry.type === 'Point') {
      this.createPointHandle(feature);
    } else if (feature.geometry.type === 'LineString') {
      this.createLineHandles(feature);
    } else if (feature.geometry.type === 'Polygon') {
      this.createPolygonHandles(feature);
    }
  }

  // Criar handle para ponto
  private createPointHandle(feature: ExtendedFeature): void {
    const coords = feature.geometry.coordinates as Position;
    const handle = this.createVertexMarker(coords, 0);
    this.vertexHandles.push(handle);
  }

  // Criar handles para linha
  private createLineHandles(feature: ExtendedFeature): void {
    const coords = feature.geometry.coordinates as Position[];
    
    // Criar handles nos vértices
    coords.forEach((coord, index) => {
      const handle = this.createVertexMarker(coord, index);
      this.vertexHandles.push(handle);
    });

    // Criar handles nos pontos médios (para adicionar vértices)
    if (this.config.enableVertexAdd) {
      for (let i = 0; i < coords.length - 1; i++) {
        const midpoint = this.calculateMidpoint(coords[i], coords[i + 1]);
        const midHandle = this.createMidpointMarker(midpoint, i);
        this.midpointHandles.push(midHandle);
      }
    }
  }

  // Criar handles para polígono
  private createPolygonHandles(feature: ExtendedFeature): void {
    // Para polígonos, trabalhar com o anel exterior
    const coords = feature.geometry.coordinates[0] as Position[];
    
    // Remover último ponto (que é igual ao primeiro)
    const vertices = coords.slice(0, -1);
    
    vertices.forEach((coord, index) => {
      const handle = this.createVertexMarker(coord, index);
      this.vertexHandles.push(handle);
    });

    // Pontos médios
    if (this.config.enableVertexAdd) {
      for (let i = 0; i < vertices.length; i++) {
        const nextIndex = (i + 1) % vertices.length;
        const midpoint = this.calculateMidpoint(vertices[i], vertices[nextIndex]);
        const midHandle = this.createMidpointMarker(midpoint, i);
        this.midpointHandles.push(midHandle);
      }
    }
  }

  // Criar marcador de vértice
  private createVertexMarker(position: Position, index: number): maplibregl.Marker {
    const el = document.createElement('div');
    el.className = 'vertex-handle';
    el.style.width = `${this.config.vertexRadius * 2}px`;
    el.style.height = `${this.config.vertexRadius * 2}px`;
    el.dataset.vertexIndex = index.toString();
    
    // Event listeners para arrastar
    el.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.startDragVertex(index, e);
    });

    // Double click para remover vértice
    if (this.config.enableVertexRemove) {
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.removeVertex(index);
      });
    }

    const marker = new maplibregl.Marker({ element: el, draggable: false })
      .setLngLat([position[0], position[1]])
      .addTo(this.map);

    return marker;
  }

  // Criar marcador de ponto médio
  private createMidpointMarker(position: Position, afterIndex: number): maplibregl.Marker {
    const el = document.createElement('div');
    el.className = 'vertex-midpoint';
    el.style.width = `${this.config.midpointRadius * 2}px`;
    el.style.height = `${this.config.midpointRadius * 2}px`;
    
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.addVertex(afterIndex + 1, position);
    });

    const marker = new maplibregl.Marker({ element: el, draggable: false })
      .setLngLat([position[0], position[1]])
      .addTo(this.map);

    return marker;
  }

  // Calcular ponto médio entre duas posições
  private calculateMidpoint(pos1: Position, pos2: Position): Position {
    return [
      (pos1[0] + pos2[0]) / 2,
      (pos1[1] + pos2[1]) / 2
    ];
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
    const point = new maplibregl.Point(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
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
      this.callbacks.onError(`Erro ao mover vértice: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
      this.callbacks.onError(`Erro ao adicionar vértice: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
      this.callbacks.onError(`Erro ao remover vértice: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Métodos auxiliares para manipulação de geometria
  private updateVertexPosition(feature: ExtendedFeature, vertexIndex: number, newPosition: Position): ExtendedFeature {
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

  private insertVertex(feature: ExtendedFeature, vertexIndex: number, position: Position): ExtendedFeature {
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
      if (ring.length <= 4) { // 3 pontos + fechamento
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
    
    this.vertexHandles.forEach((handle, index) => {
      if (index < coords.length) {
        handle.setLngLat([coords[index][0], coords[index][1]]);
      }
    });
  }

  // Recriar handles de vértices
  private recreateVertexHandles(feature: ExtendedFeature): void {
    this.clearVertexHandles();
    this.createVertexHandles(feature);
  }

  // Obter vértices da feature
  private getFeatureVertices(feature: ExtendedFeature): Position[] {
    if (feature.geometry.type === 'Point') {
      return [feature.geometry.coordinates as Position];
    } else if (feature.geometry.type === 'LineString') {
      return feature.geometry.coordinates as Position[];
    } else if (feature.geometry.type === 'Polygon') {
      return (feature.geometry.coordinates[0] as Position[]).slice(0, -1);
    }
    return [];
  }

  // Limpar handles de vértices
  private clearVertexHandles(): void {
    this.vertexHandles.forEach(handle => handle.remove());
    this.midpointHandles.forEach(handle => handle.remove());
    this.vertexHandles = [];
    this.midpointHandles = [];
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

  // Getters
  get features(): ExtendedFeature[] {
    return Array.from(this.hotFeatures.values());
  }

  get editingFeature(): string | null {
    return this.editingFeatureId;
  }

  get isEditingVertices(): boolean {
    return this.editingFeatureId !== null;
  }
}