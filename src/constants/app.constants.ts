// Path: constants\app.constants.ts
export const APP_INFO = {
  name: 'EBGeo',
  fullName: 'Sistema de Desenho Vetorial EBGeo',
  version: '1.0.0',
  description: 'Sistema interativo de desenho vetorial para operações geoespaciais militares',
  author: 'EBGeo Team',
  license: 'MIT',
} as const;

// Configurações de I/O (Import/Export)
export const IO_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFeaturesPerFile: 1000,
  supportedFormats: ['.ebgeo'],
  defaultExportName: 'ebgeo-export',
} as const;

// Tipos de geometria suportados
export const GEOMETRY_TYPES = {
  POINT: 'Point',
  LINESTRING: 'LineString',
  POLYGON: 'Polygon',
} as const;

// Ferramentas de desenho disponíveis
export const DRAWING_TOOLS = {
  SELECT: 'select',
  POINT: 'point',
  LINE: 'line',
  POLYGON: 'polygon',
  TEXT: 'text',
  MILITARY_SYMBOL: 'military-symbol',
} as const;

// Estados das ferramentas de desenho
export const TOOL_STATES = {
  IDLE: 'idle',
  DRAWING: 'drawing',
  EDITING: 'editing',
} as const;

// Configurações do mapa
export const MAP_CONFIG = {
  defaultCenter: [-15.77972, -47.92972] as [number, number], // Brasília
  defaultZoom: 10,
  minZoom: 0,
  maxZoom: 22,
} as const;

// Configurações de camadas
export const LAYER_CONFIG = {
  defaultOpacity: 1,
  defaultVisible: true,
  defaultZIndex: 0,
} as const;

// Configurações de seleção
export const SELECTION_CONFIG = {
  maxSelectableFeatures: 100,
  selectionColor: '#0080ff',
  selectionOpacity: 0.7,
} as const;

// Configurações de estilo padrão
export const DEFAULT_STYLES = {
  point: {
    fillColor: '#3388ff',
    fillOpacity: 0.7,
    strokeColor: '#ffffff',
    strokeWidth: 2,
    radius: 8,
  },
  line: {
    strokeColor: '#3388ff',
    strokeWidth: 3,
    strokeOpacity: 1,
  },
  polygon: {
    fillColor: '#3388ff',
    fillOpacity: 0.3,
    strokeColor: '#3388ff',
    strokeWidth: 2,
    strokeOpacity: 1,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    fillColor: '#000000',
    strokeColor: '#ffffff',
    strokeWidth: 1,
  },
} as const;

// Configurações de precisão
export const PRECISION_CONFIG = {
  coordinateDecimals: 8, // Precisão das coordenadas
  areaDecimals: 2, // Precisão de cálculos de área
  distanceDecimals: 2, // Precisão de cálculos de distância
} as const;

// Configurações de UI
export const UI_CONFIG = {
  sidebarWidth: 320,
  toolbarHeight: 56,
  panelMinWidth: 280,
  panelMaxWidth: 500,
} as const;

// Códigos de erro
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  IMPORT_ERROR: 'IMPORT_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
  TOOL_ERROR: 'TOOL_ERROR',
  GEOMETRY_ERROR: 'GEOMETRY_ERROR',
} as const;

// Tipos de transação para undo/redo
export const TRANSACTION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  BATCH: 'batch',
} as const;

// Configurações de validação
export const VALIDATION_CONFIG = {
  minFeatureName: 1,
  maxFeatureName: 100,
  minLayerName: 1,
  maxLayerName: 50,
  minMapName: 1,
  maxMapName: 50,
  maxPropertiesPerFeature: 50,
} as const;
