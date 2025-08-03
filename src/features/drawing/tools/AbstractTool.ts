// Path: features\drawing\tools\AbstractTool.ts

import maplibregl from 'maplibre-gl';
import { Position } from 'geojson';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { DrawingTool } from '../../../types/feature.types';

// Interface para eventos de mouse no mapa
export interface MapMouseEvent {
  lngLat: maplibregl.LngLat;
  point: maplibregl.Point;
  originalEvent: MouseEvent;
}

// Interface para eventos de teclado
export interface MapKeyboardEvent {
  originalEvent: KeyboardEvent;
}

// Interface para configuração da ferramenta
export interface ToolConfig {
  snapToVertices: boolean;
  snapToEdges: boolean;
  snapTolerance: number; // em pixels
  showCoordinates: boolean;
  allowUndo: boolean;
}

// Interface para resultado de snap
export interface SnapResult {
  position: Position;
  snapped: boolean;
  snapType: 'vertex' | 'edge' | 'grid' | 'none';
  targetFeatureId?: string;
  targetVertexIndex?: number;
}

// Interface para callbacks da ferramenta
export interface ToolCallbacks {
  onFeatureComplete: (feature: ExtendedFeature) => void;
  onFeatureUpdate: (feature: ExtendedFeature) => void;
  onCancel: () => void;
  onError: (error: string) => void;
  onStatusChange: (status: string) => void;
}

// Classe abstrata base para todas as ferramentas de desenho
export abstract class AbstractTool {
  protected map: maplibregl.Map;
  protected config: ToolConfig;
  protected callbacks: ToolCallbacks;
  protected isActive: boolean = false;
  protected currentFeature: ExtendedFeature | null = null;
  protected tempFeatures: ExtendedFeature[] = [];
  
  // Estado interno da ferramenta
  protected isDrawing: boolean = false;
  protected coordinates: Position[] = [];
  protected lastMousePosition: maplibregl.LngLat | null = null;
  
  constructor(
    map: maplibregl.Map,
    config: ToolConfig,
    callbacks: ToolCallbacks
  ) {
    this.map = map;
    this.config = config;
    this.callbacks = callbacks;
  }

  // Métodos abstratos que devem ser implementados pelas ferramentas específicas
  abstract getToolType(): DrawingTool;
  abstract getName(): string;
  abstract getDescription(): string;
  abstract getCursor(): string;
  
  // Métodos de ciclo de vida da ferramenta
  activate(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.addEventListeners();
    this.updateCursor();
    this.callbacks.onStatusChange(`Ferramenta ${this.getName()} ativada`);
  }

  deactivate(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.removeEventListeners();
    this.reset();
    this.updateCursor('');
    this.callbacks.onStatusChange('Ferramenta desativada');
  }

  // Métodos de eventos - podem ser sobrescritos pelas ferramentas específicas
  protected onMouseDown(e: MapMouseEvent): void {
    // Implementação base - pode ser sobrescrita
  }

  protected onMouseUp(e: MapMouseEvent): void {
    // Implementação base - pode ser sobrescrita
  }

  protected onMouseMove(e: MapMouseEvent): void {
    this.lastMousePosition = e.lngLat;
    // Implementação base - pode ser sobrescrita
  }

  protected onClick(e: MapMouseEvent): void {
    // Implementação base - deve ser sobrescrita pelas ferramentas
  }

  protected onDoubleClick(e: MapMouseEvent): void {
    // Implementação base - pode ser sobrescrita
    if (this.isDrawing) {
      this.finishDrawing();
    }
  }

  protected onKeyDown(e: MapKeyboardEvent): void {
    const key = e.originalEvent.key;
    
    switch (key) {
      case 'Escape':
        this.cancel();
        break;
      case 'Enter':
        if (this.isDrawing) {
          this.finishDrawing();
        }
        break;
      case 'Backspace':
      case 'Delete':
        if (this.config.allowUndo) {
          this.undoLastPoint();
        }
        break;
    }
  }

  // Métodos de gerenciamento de eventos
  private addEventListeners(): void {
    this.map.on('mousedown', this.handleMouseDown);
    this.map.on('mouseup', this.handleMouseUp);
    this.map.on('mousemove', this.handleMouseMove);
    this.map.on('click', this.handleClick);
    this.map.on('dblclick', this.handleDoubleClick);
    
    // Eventos de teclado no canvas do mapa
    this.map.getCanvas().addEventListener('keydown', this.handleKeyDown);
    this.map.getCanvas().tabIndex = 0; // Permitir foco para eventos de teclado
  }

  private removeEventListeners(): void {
    this.map.off('mousedown', this.handleMouseDown);
    this.map.off('mouseup', this.handleMouseUp);
    this.map.off('mousemove', this.handleMouseMove);
    this.map.off('click', this.handleClick);
    this.map.off('dblclick', this.handleDoubleClick);
    
    this.map.getCanvas().removeEventListener('keydown', this.handleKeyDown);
  }

  // Handlers de eventos (arrow functions para manter o contexto)
  private handleMouseDown = (e: maplibregl.MapMouseEvent) => {
    this.onMouseDown(e as MapMouseEvent);
  };

  private handleMouseUp = (e: maplibregl.MapMouseEvent) => {
    this.onMouseUp(e as MapMouseEvent);
  };

  private handleMouseMove = (e: maplibregl.MapMouseEvent) => {
    this.onMouseMove(e as MapMouseEvent);
  };

  private handleClick = (e: maplibregl.MapMouseEvent) => {
    e.preventDefault();
    this.onClick(e as MapMouseEvent);
  };

  private handleDoubleClick = (e: maplibregl.MapMouseEvent) => {
    e.preventDefault();
    this.onDoubleClick(e as MapMouseEvent);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    this.onKeyDown({ originalEvent: e });
  };

  // Métodos utilitários
  protected updateCursor(cursor?: string): void {
    const canvas = this.map.getCanvas();
    canvas.style.cursor = cursor || this.getCursor();
  }

  protected snapToFeatures(position: Position): SnapResult {
    if (!this.config.snapToVertices && !this.config.snapToEdges) {
      return {
        position,
        snapped: false,
        snapType: 'none',
      };
    }

    // Implementação básica de snap - pode ser melhorada
    const point = this.map.project([position[0], position[1]]);
    const features = this.map.queryRenderedFeatures(point, {
      radius: this.config.snapTolerance,
    });

    // Por simplicidade, retornar posição original
    // Implementação completa seria feita aqui
    return {
      position,
      snapped: false,
      snapType: 'none',
    };
  }

  protected createTempFeature(coordinates: Position[], geometryType: string): ExtendedFeature {
    const now = new Date().toISOString();
    
    let geometry: any;
    switch (geometryType) {
      case 'Point':
        geometry = {
          type: 'Point',
          coordinates: coordinates[0] || [0, 0],
        };
        break;
      case 'LineString':
        geometry = {
          type: 'LineString',
          coordinates: coordinates.length >= 2 ? coordinates : [[0, 0], [0, 0]],
        };
        break;
      case 'Polygon':
        geometry = {
          type: 'Polygon',
          coordinates: [coordinates.length >= 3 ? [...coordinates, coordinates[0]] : [[0, 0], [0, 0], [0, 0], [0, 0]]],
        };
        break;
      default:
        throw new Error(`Tipo de geometria não suportado: ${geometryType}`);
    }

    return {
      type: 'Feature',
      id: 'temp-feature',
      geometry,
      properties: {
        id: 'temp-feature',
        layerId: 'temp',
        createdAt: now,
        updatedAt: now,
        style: {
          strokeColor: '#4caf50',
          strokeWidth: 2,
          fillColor: '#4caf50',
          fillOpacity: 0.3,
          markerColor: '#4caf50',
          markerSize: 8,
        },
      },
    };
  }

  // Métodos de controle do desenho
  protected startDrawing(): void {
    this.isDrawing = true;
    this.coordinates = [];
    this.callbacks.onStatusChange(`Desenhando ${this.getName()}`);
  }

  protected finishDrawing(): void {
    if (!this.isDrawing || this.coordinates.length === 0) return;

    try {
      const feature = this.createFeatureFromCoordinates();
      if (feature) {
        this.callbacks.onFeatureComplete(feature);
        this.callbacks.onStatusChange(`${this.getName()} criado com sucesso`);
      }
    } catch (error) {
      this.callbacks.onError(`Erro ao criar ${this.getName()}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    this.reset();
  }

  protected cancel(): void {
    if (this.isDrawing) {
      this.callbacks.onStatusChange(`Criação de ${this.getName()} cancelada`);
    }
    this.callbacks.onCancel();
    this.reset();
  }

  protected undoLastPoint(): void {
    if (this.coordinates.length > 0) {
      this.coordinates.pop();
      this.updateTempFeature();
      this.callbacks.onStatusChange(`Último ponto removido`);
    }
  }

  protected reset(): void {
    this.isDrawing = false;
    this.coordinates = [];
    this.currentFeature = null;
    this.tempFeatures = [];
    this.clearTempFeatures();
  }

  // Métodos abstratos que devem ser implementados
  protected abstract createFeatureFromCoordinates(): ExtendedFeature | null;
  protected abstract updateTempFeature(): void;
  protected abstract clearTempFeatures(): void;

  // Getters
  get active(): boolean {
    return this.isActive;
  }

  get drawing(): boolean {
    return this.isDrawing;
  }

  get coordinateCount(): number {
    return this.coordinates.length;
  }
}