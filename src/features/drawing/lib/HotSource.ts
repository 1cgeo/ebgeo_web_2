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

// Interface para tracking de event listeners (corrigida para exactOptionalPropertyTypes)
interface EventListenerTracker {
  element: EventTarget;
  event: string;
  handler: (event: Event) => void; // Usar Event genérico em vez de EventListener
  options: boolean | AddEventListenerOptions; // Tornar obrigatório para evitar undefined
}

// Interface para estado de vertex drag
interface VertexDragState {
  isDragging: boolean;
  featureId: string;
  vertexIndex: number;
  startPosition: Position;
  currentPosition: Position;
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
  private dragState: VertexDragState | null = null;
  private vertexHandles: maplibregl.Marker[] = [];
  private midpointHandles: maplibregl.Marker[] = [];

  // Event listeners tracking robusto
  private eventListeners: Set<EventListenerTracker> = new Set();
  private isDestroyed: boolean = false;

  // WeakMap para tracking de handles por feature
  private featureHandles: WeakMap<ExtendedFeature, maplibregl.Marker[]> = new WeakMap();

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
    if (this.isDestroyed) {
      console.warn('Tentativa de inicializar HotSource destruído');
      return;
    }

    // Verificar se o source hot-features existe
    if (!this.map.getSource('hot-features')) {
      console.warn('Source hot-features não encontrado');
      return;
    }

    this.setupEventListeners();
  }

  // Configurar event listeners com tracking robusto
  private setupEventListeners(): void {
    if (this.isDestroyed) {
      console.warn('Tentativa de configurar listeners em HotSource destruído');
      return;
    }

    // Usar arrow functions para manter contexto e facilitar remoção
    const onMouseDown = (e: Event) => {
      if (this.isDestroyed) return;
      this.handleMouseDown(e as MouseEvent);
    };

    const onMouseMove = (e: Event) => {
      if (this.isDestroyed) return;
      this.handleMouseMove(e as MouseEvent);
    };

    const onMouseUp = (e: Event) => {
      if (this.isDestroyed) return;
      this.handleMouseUp(e as MouseEvent);
    };

    // Usar método helper para adicionar e trackear listeners
    this.addTrackedEventListener(document, 'mousedown', onMouseDown, { passive: false });
    this.addTrackedEventListener(document, 'mousemove', onMouseMove, { passive: true });
    this.addTrackedEventListener(document, 'mouseup', onMouseUp, { passive: false });

    // Adicionar listener para visibilitychange para cleanup em caso de aba oculta
    this.addTrackedEventListener(
      document,
      'visibilitychange',
      () => {
        if (document.hidden && this.dragState?.isDragging) {
          this.stopDragVertex();
        }
      },
      false
    );

    // Adicionar listener para beforeunload para cleanup garantido
    this.addTrackedEventListener(
      window,
      'beforeunload',
      () => {
        this.destroy();
      },
      false
    );

    console.log(`HotSource: ${this.eventListeners.size} event listeners configurados`);
  }

  // Método helper para adicionar e trackear event listeners
  private addTrackedEventListener(
    element: EventTarget,
    event: string,
    handler: (event: Event) => void,
    options: boolean | AddEventListenerOptions
  ): void {
    if (this.isDestroyed) {
      console.warn('Tentativa de adicionar listener em HotSource destruído');
      return;
    }

    const tracker: EventListenerTracker = {
      element,
      event,
      handler,
      options,
    };

    try {
      element.addEventListener(event, handler, options);
      this.eventListeners.add(tracker);
      console.log(`Event listener adicionado: ${event} em`, element.constructor.name);
    } catch (error) {
      console.error('Erro ao adicionar event listener:', error);
    }
  }

  // Método helper para remover event listener específico
  private removeTrackedEventListener(tracker: EventListenerTracker): void {
    try {
      tracker.element.removeEventListener(tracker.event, tracker.handler, tracker.options);
      this.eventListeners.delete(tracker);
      console.log(`Event listener removido: ${tracker.event} de`, tracker.element.constructor.name);
    } catch (error) {
      console.warn('Erro ao remover event listener:', error);
    }
  }

  // Adicionar feature para edição
  addFeature(feature: ExtendedFeature): void {
    if (this.isDestroyed) {
      console.warn('Tentativa de adicionar feature em HotSource destruído');
      return;
    }

    this.hotFeatures.set(feature.id, feature);
    this.updateHotSource();
  }

  // Remover feature da edição
  removeFeature(featureId: string): void {
    if (this.isDestroyed) {
      console.warn('Tentativa de remover feature em HotSource destruído');
      return;
    }

    const feature = this.hotFeatures.get(featureId);
    if (feature) {
      // Limpar handles específicos da feature
      this.cleanupFeatureHandles(feature);
      this.hotFeatures.delete(featureId);
    }

    if (this.editingFeatureId === featureId) {
      this.stopEditingVertices();
    }

    this.updateHotSource();
  }

  // Limpar handles específicos de uma feature
  private cleanupFeatureHandles(feature: ExtendedFeature): void {
    const handles = this.featureHandles.get(feature);
    if (handles) {
      handles.forEach(handle => {
        try {
          handle.remove();
        } catch (error) {
          console.warn('Erro ao remover handle:', error);
        }
      });
      this.featureHandles.delete(feature);
    }
  }

  // Atualizar source com features atuais
  private updateHotSource(): void {
    if (this.isDestroyed) return;

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
      console.error('Erro ao atualizar hot source:', error);
      this.callbacks.onError('Erro ao atualizar visualização de edição');
    }
  }

  // Iniciar edição de vértices para uma feature
  startEditingVertices(featureId: string): void {
    if (this.isDestroyed) return;

    const feature = this.hotFeatures.get(featureId);
    if (!feature) {
      console.warn(`Feature ${featureId} não encontrada no HotSource`);
      return;
    }

    this.editingFeatureId = featureId;
    this.createVertexHandles(feature);
  }

  // Parar edição de vértices
  stopEditingVertices(): void {
    if (this.isDestroyed) return;

    this.editingFeatureId = null;
    this.clearVertexHandles();
  }

  // Criar handles de vértices para edição
  private createVertexHandles(feature: ExtendedFeature): void {
    this.clearVertexHandles();

    const vertices = this.getFeatureVertices(feature);
    const handles: maplibregl.Marker[] = [];

    vertices.forEach((vertex, index) => {
      if (this.isValidPosition(vertex)) {
        const handle = this.createVertexHandle(index, vertex, feature.id);
        handles.push(handle);
        this.vertexHandles.push(handle);
      }
    });

    // Criar midpoint handles se necessário
    if (this.config.enableVertexAdd && vertices.length > 1) {
      for (let i = 0; i < vertices.length - 1; i++) {
        const v1 = vertices[i];
        const v2 = vertices[i + 1];

        if (this.isValidPosition(v1) && this.isValidPosition(v2)) {
          const midpoint = this.calculateMidpoint(v1, v2);
          const midpointHandle = this.createMidpointHandle(i, midpoint);
          handles.push(midpointHandle);
          this.midpointHandles.push(midpointHandle);
        }
      }
    }

    // Armazenar handles para cleanup
    this.featureHandles.set(feature, handles);
  }

  // Verificar se uma posição é válida
  private isValidPosition(position: any): position is Position {
    return (
      Array.isArray(position) &&
      position.length >= 2 &&
      typeof position[0] === 'number' &&
      typeof position[1] === 'number'
    );
  }

  // Criar handle de vértice
  private createVertexHandle(
    index: number,
    position: Position,
    featureId: string
  ): maplibregl.Marker {
    const el = document.createElement('div');
    el.className = 'vertex-handle';
    el.style.width = `${this.config.vertexRadius * 2}px`;
    el.style.height = `${this.config.vertexRadius * 2}px`;
    el.style.backgroundColor = '#007cbf';
    el.style.border = '2px solid white';
    el.style.borderRadius = '50%';
    el.style.cursor = 'grab';

    const onMouseDown = (e: MouseEvent) => {
      if (this.isDestroyed) return;
      e.stopPropagation();
      this.startDragVertex(index, featureId, position, e);
    };

    el.addEventListener('mousedown', onMouseDown);

    const marker = new maplibregl.Marker({
      element: el,
      draggable: false,
    })
      .setLngLat([position[0], position[1]])
      .addTo(this.map);

    return marker;
  }

  // Criar handle de midpoint
  private createMidpointHandle(afterIndex: number, position: Position): maplibregl.Marker {
    const el = document.createElement('div');
    el.className = 'vertex-midpoint';
    el.style.width = `${this.config.midpointRadius * 2}px`;
    el.style.height = `${this.config.midpointRadius * 2}px`;
    el.style.backgroundColor = '#ffa500';
    el.style.border = '1px solid white';
    el.style.borderRadius = '50%';
    el.style.cursor = 'pointer';

    const onClick = (e: MouseEvent) => {
      if (this.isDestroyed) return;
      e.stopPropagation();
      this.addVertex(afterIndex + 1, position);
    };

    el.addEventListener('click', onClick);

    const marker = new maplibregl.Marker({
      element: el,
      draggable: false,
    })
      .setLngLat([position[0], position[1]])
      .addTo(this.map);

    return marker;
  }

  // Calcular ponto médio entre dois vértices
  private calculateMidpoint(p1: Position, p2: Position): Position {
    const lng = (p1[0] + p2[0]) / 2;
    const lat = (p1[1] + p2[1]) / 2;
    return [lng, lat];
  }

  // Handlers de eventos
  private handleMouseDown(e: MouseEvent): void {
    // Implementação do mousedown
    if (this.dragState?.isDragging) {
      e.preventDefault();
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    // Implementação do mousemove
    if (this.dragState?.isDragging) {
      e.preventDefault();
      this.updateVertexDrag(e);
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    // Implementação do mouseup
    if (this.dragState?.isDragging) {
      e.preventDefault();
      this.stopDragVertex();
    }
  }

  // Métodos para manipulação de vértices
  private startDragVertex(
    index: number,
    featureId: string,
    position: Position,
    e: MouseEvent
  ): void {
    if (this.isDestroyed) return;

    this.dragState = {
      isDragging: true,
      featureId,
      vertexIndex: index,
      startPosition: [...position] as Position,
      currentPosition: [...position] as Position,
    };

    // Alterar cursor
    const canvas = this.map.getCanvas();
    if (canvas) {
      canvas.style.cursor = 'grabbing';
    }

    e.preventDefault();
  }

  private updateVertexDrag(e: MouseEvent): void {
    if (!this.dragState?.isDragging) return;

    const rect = this.map.getContainer().getBoundingClientRect();
    const point = new maplibregl.Point(e.clientX - rect.left, e.clientY - rect.top);

    const lngLat = this.map.unproject(point);
    const newPosition: Position = [lngLat.lng, lngLat.lat];

    this.dragState.currentPosition = newPosition;

    // Notificar movimento
    this.callbacks.onVertexMoved(this.dragState.featureId, this.dragState.vertexIndex, newPosition);
  }

  private stopDragVertex(): void {
    if (!this.dragState?.isDragging) return;

    // Restaurar cursor
    const canvas = this.map.getCanvas();
    if (canvas) {
      canvas.style.cursor = '';
    }

    this.dragState = null;
  }

  private addVertex(index: number, position: Position): void {
    if (this.isDestroyed || !this.editingFeatureId) return;

    this.callbacks.onVertexAdded(this.editingFeatureId, index, position);
  }

  private removeVertex(index: number): void {
    if (this.isDestroyed || !this.editingFeatureId) return;

    this.callbacks.onVertexRemoved(this.editingFeatureId, index);
  }

  // Obter vértices da feature
  private getFeatureVertices(feature: ExtendedFeature): Position[] {
    switch (feature.geometry.type) {
      case 'Point':
        return [feature.geometry.coordinates as Position];
      case 'LineString':
        return feature.geometry.coordinates as Position[];
      case 'Polygon':
        const coords = feature.geometry.coordinates[0] as Position[];
        return coords.slice(0, -1); // Remove último ponto (fechamento)
      default:
        return [];
    }
  }

  // Limpar handles de vértices
  private clearVertexHandles(): void {
    // Limpar handles de vértices
    this.vertexHandles.forEach(handle => {
      try {
        handle.remove();
      } catch (error) {
        console.warn('Erro ao remover vertex handle:', error);
      }
    });
    this.vertexHandles = [];

    // Limpar handles de midpoints
    this.midpointHandles.forEach(handle => {
      try {
        handle.remove();
      } catch (error) {
        console.warn('Erro ao remover midpoint handle:', error);
      }
    });
    this.midpointHandles = [];
  }

  // Limpar todos os event listeners
  private removeAllEventListeners(): void {
    for (const tracker of this.eventListeners) {
      this.removeTrackedEventListener(tracker);
    }
    this.eventListeners.clear();
  }

  // Destruir o HotSource
  destroy(): void {
    if (this.isDestroyed) {
      console.warn('HotSource já foi destruído');
      return;
    }

    console.log('Destruindo HotSource...');

    this.isDestroyed = true;

    // Parar qualquer edição ativa
    this.stopEditingVertices();

    // Limpar todas as features
    for (const feature of this.hotFeatures.values()) {
      this.cleanupFeatureHandles(feature);
    }
    this.hotFeatures.clear();

    // Remover todos os event listeners
    this.removeAllEventListeners();

    // Limpar handles restantes
    this.clearVertexHandles();

    // Reset estado
    this.dragState = null;
    this.editingFeatureId = null;

    console.log('HotSource destruído com sucesso');
  }

  // Getters para estado público
  get features(): ExtendedFeature[] {
    return Array.from(this.hotFeatures.values());
  }

  get isEditing(): boolean {
    return this.editingFeatureId !== null;
  }

  get isDragging(): boolean {
    return this.dragState?.isDragging || false;
  }
}
