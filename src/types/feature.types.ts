// Path: types\feature.types.ts

import { Position } from 'geojson';

// Tipos de ferramentas de desenho
export type DrawingTool =
  | 'select' // Nova ferramenta de seleção e drag
  | 'point'
  | 'line'
  | 'polygon'
  | 'circle'
  | 'rectangle'
  | 'text'
  | 'military-symbol'
  | 'measure-distance'
  | 'measure-area';

// Tipos de geometria suportados
export type GeometryType = 'Point' | 'LineString' | 'Polygon' | 'Circle' | 'Rectangle';

// Estados de uma feature
export type FeatureState =
  | 'normal' // Estado padrão
  | 'selected' // Selecionada
  | 'editing' // Sendo editada (vértices visíveis)
  | 'dragging' // Sendo arrastada
  | 'highlighted' // Destacada (hover)
  | 'hidden'; // Oculta

// Tipos de handle para identificação em HotSource
export type HandleType =
  | 'body' // Corpo da geometria (para drag)
  | 'vertex' // Vértice para edição
  | 'midpoint' // Ponto médio para adicionar vértices
  | 'control'; // Pontos de controle especiais

// Interface para propriedades de estilo
export interface FeatureStyle {
  // Propriedades de linha
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDashArray?: number[];

  // Propriedades de preenchimento
  fillColor?: string;
  fillOpacity?: number;

  // Propriedades de ponto
  markerColor?: string;
  markerSize?: number;
  markerSymbol?: string;

  // Propriedades de texto
  textColor?: string;
  textSize?: number;
  textFont?: string;
  textHalo?: {
    color: string;
    width: number;
  };

  // Propriedades específicas para drag
  dragFeedback?: {
    opacity?: number;
    strokeWidth?: number;
    strokeColor?: string;
  };
}

// Interface para propriedades específicas do domínio militar
export interface MilitaryProperties {
  sidc?: string; // Symbol Identification Coding
  affiliation?: 'friend' | 'hostile' | 'neutral' | 'unknown';
  echelon?: string; // Escalão militar
  uniqueDesignation?: string; // Designação única
  higherFormation?: string; // Formação superior
  specialHeadquarters?: boolean;
}

// Interface para propriedades de medição
export interface MeasurementProperties {
  measurementType?: 'distance' | 'area' | 'bearing';
  value?: number;
  unit?: string;
  precision?: number;
  displayLabel?: boolean;
}

// Interface estendida para propriedades de feature
export interface ExtendedFeatureProperties {
  // Identificação
  layerId: string;
  featureType?: GeometryType;
  name?: string;
  description?: string;

  // Estado
  state?: FeatureState;
  visible?: boolean;
  locked?: boolean;

  // Estilo
  style?: FeatureStyle;

  // Propriedades específicas de domínio
  military?: MilitaryProperties;
  measurement?: MeasurementProperties;

  // Metadados para operações
  handle?: HandleType; // Tipo de handle (usado no HotSource)
  featureId?: string; // Referência ao ID da feature original
  originalGeometry?: GeoJSON.Geometry; // Geometria original (para drag)

  // Auditoria
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;

  // Versionamento
  version?: number;

  // Atributos customizados (dinâmicos)
  [key: string]: any;
}

// Interface para resultado de operação de drag
export interface DragResult {
  success: boolean;
  featureId: string;
  originalGeometry: GeoJSON.Geometry;
  finalGeometry: GeoJSON.Geometry;
  translation: {
    dx: number;
    dy: number;
  };
  duration: number; // em millisegundos
  error?: string;
}

// Interface para configuração de drag
export interface DragConfig {
  enabled: boolean;
  threshold: number; // pixels de movimento antes de iniciar drag
  showFeedback: boolean; // mostrar feedback visual durante drag
  snapToGrid?: boolean; // snap para grade
  snapToFeatures?: boolean; // snap para outras features
  constrainToLayer?: boolean; // restringir movimento dentro da camada
  preserveAspectRatio?: boolean; // manter proporção (para formas)
}

// Interface para estatísticas de seleção
export interface SelectionStats {
  count: number;
  geometryTypes: Record<string, number>;
  layerCount: number;
  layers: string[];
  totalArea?: number; // área total (para polígonos)
  totalLength?: number; // comprimento total (para linhas)
  bounds?: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
}

// Interface para operações em lote
export interface BatchOperation {
  type: 'move' | 'copy' | 'delete' | 'style' | 'transfer';
  featureIds: string[];
  parameters?: {
    targetLayerId?: string;
    translation?: { dx: number; dy: number };
    style?: Partial<FeatureStyle>;
    [key: string]: any;
  };
}

// Interface para resultado de operação em lote
export interface BatchOperationResult {
  success: boolean;
  operation: BatchOperation;
  processedCount: number;
  errors: Array<{
    featureId: string;
    error: string;
  }>;
  duration: number;
}

// Interface para configuração de ferramenta
export interface ToolConfiguration {
  // Configurações gerais
  snapToVertices: boolean;
  snapToEdges: boolean;
  snapTolerance: number;
  showCoordinates: boolean;
  allowUndo: boolean;

  // Configurações específicas de drag
  drag?: DragConfig;

  // Configurações de seleção
  selection?: {
    multiSelectKey: 'ctrl' | 'shift';
    boxSelectEnabled: boolean;
    autoDeselectOnClick: boolean;
  };

  // Configurações de feedback visual
  feedback?: {
    showTooltips: boolean;
    showMeasurements: boolean;
    highlightOnHover: boolean;
  };
}

// Interface para evento de feature
export interface FeatureEvent {
  type:
    | 'create'
    | 'update'
    | 'delete'
    | 'select'
    | 'deselect'
    | 'drag-start'
    | 'drag-end'
    | 'hover';
  featureId: string;
  timestamp: number;
  data?: {
    geometry?: GeoJSON.Geometry;
    properties?: Partial<ExtendedFeatureProperties>;
    dragResult?: DragResult;
    [key: string]: any;
  };
}

// Interface para histórico de operações (Undo/Redo)
export interface OperationHistoryEntry {
  id: string;
  type: 'create' | 'update' | 'delete' | 'batch';
  timestamp: number;
  description: string;
  data: {
    featureIds: string[];
    beforeState?: any;
    afterState?: any;
  };
  canUndo: boolean;
  canRedo: boolean;
}

// Tipos para export/import
export interface ExportData {
  features: GeoJSON.FeatureCollection;
  layers: Array<{
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
  }>;
  maps: Array<{
    id: string;
    name: string;
    layerIds: string[];
  }>;
  metadata: {
    version: string;
    exportedAt: string;
    exportedBy: string;
    application: string;
  };
}

// Utilitários de tipo
export type FeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  ExtendedFeatureProperties
>;
export type Feature = GeoJSON.Feature<GeoJSON.Geometry, ExtendedFeatureProperties>;

// Type guards
export const isPoint = (geometry: GeoJSON.Geometry): geometry is GeoJSON.Point => {
  return geometry.type === 'Point';
};

export const isLineString = (geometry: GeoJSON.Geometry): geometry is GeoJSON.LineString => {
  return geometry.type === 'LineString';
};

export const isPolygon = (geometry: GeoJSON.Geometry): geometry is GeoJSON.Polygon => {
  return geometry.type === 'Polygon';
};

export const hasHandle = (properties: any): properties is { handle: HandleType } => {
  return properties && typeof properties.handle === 'string';
};

export const isDraggableFeature = (feature: Feature): boolean => {
  return feature.properties?.state !== 'locked' && feature.properties?.visible !== false;
};

export const isSelectableFeature = (feature: Feature): boolean => {
  return feature.properties?.visible !== false;
};
