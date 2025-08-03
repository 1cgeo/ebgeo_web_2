// Path: types\feature.types.ts

import { Feature, Geometry, Position } from 'geojson';

// Estilo da feature
export interface FeatureStyle {
  // Cores
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  
  // Ponto
  markerColor?: string;
  markerSize?: number;
  
  // Texto
  textColor?: string;
  textSize?: number;
  textFont?: string;
  textOffset?: [number, number];
  
  // Simbologia militar
  sidc?: string; // Código SIDC para simbologia militar
}

// Propriedades estendidas da feature
export interface ExtendedFeatureProperties {
  id: string;
  layerId: string;
  name?: string;
  description?: string;
  style?: FeatureStyle;
  
  // Campos de auditoria
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  
  // Propriedades customizadas (atributos)
  [key: string]: any;
}

// Feature estendida do GeoJSON
export interface ExtendedFeature extends Feature {
  id: string;
  properties: ExtendedFeatureProperties;
}

// Tipos de geometria suportados
export type SupportedGeometry = 
  | 'Point' 
  | 'LineString' 
  | 'Polygon';

// Estados de edição
export type EditMode = 
  | 'none'
  | 'drawing'
  | 'editing'
  | 'selecting';

// Tipos de ferramentas de desenho
export type DrawingTool = 
  | 'select'
  | 'point'
  | 'line'
  | 'polygon'
  | 'text'
  | 'military-symbol';

// Estado de seleção
export interface SelectionState {
  selectedFeatureIds: string[];
  hoveredFeatureId?: string;
  editingFeatureId?: string;
  editingVertexIndex?: number;
}

// Estado de desenho
export interface DrawingState {
  activeTool: DrawingTool;
  activeLayerId?: string;
  isDrawing: boolean;
  currentFeature?: ExtendedFeature;
  mousePosition?: Position;
}

// Configuração de camada
export interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
}

// Configuração de mapa
export interface MapConfig {
  id: string;
  name: string;
  description?: string;
  layerIds: string[];
  center: Position;
  zoom: number;
  createdAt: string;
  updatedAt: string;
}

// Evento de interação com feature
export interface FeatureInteractionEvent {
  feature: ExtendedFeature;
  lngLat: Position;
  point: [number, number];
  originalEvent: MouseEvent;
}

// Resultado de hit test
export interface HitTestResult {
  features: ExtendedFeature[];
  point: [number, number];
  lngLat: Position;
}

// Operações de transação para undo/redo
export type TransactionType = 
  | 'create'
  | 'update'
  | 'delete'
  | 'batch';

export interface Transaction {
  id: string;
  type: TransactionType;
  timestamp: number;
  description: string;
  data: {
    before?: ExtendedFeature | ExtendedFeature[];
    after?: ExtendedFeature | ExtendedFeature[];
  };
}