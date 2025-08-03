// Path: constants\app.constants.ts

// Informações da aplicação
export const APP_INFO = {
  name: 'EBGeo',
  fullName: 'Sistema de Desenho Vetorial EBGeo',
  version: '1.0.0',
  description: 'Sistema interativo de desenho vetorial para operações geoespaciais militares',
  author: 'EBGeo Team',
  license: 'MIT',
} as const;

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  // Limites de features para otimização
  maxFeaturesBeforeVirtualization: 1000,
  maxFeaturesPerLayer: 500,
  
  // Timeouts
  mapLoadTimeout: 10000, // 10 segundos
  featureSaveTimeout: 5000, // 5 segundos
  
  // Cache
  queryStaleTime: 30000, // 30 segundos
  queryCacheTime: 300000, // 5 minutos
  
  // Rendering
  maxZoomLevel: 22,
  minZoomLevel: 0,
  defaultZoomLevel: 10,
} as const;

// Configurações de rede (para ambiente de baixa velocidade)
export const NETWORK_CONFIG = {
  // Retry configurations
  maxRetries: 3,
  retryDelay: 1000, // Base delay em ms
  retryMultiplier: 2,
  
  // Timeouts
  requestTimeout: 30000, // 30 segundos
  
  // Batch sizes para operações em lote
  batchSize: 50,
  maxBatchSize: 100,
  
  // Configurações de tiles
  tileTimeout: 15000,
  maxTileCacheSize: 100,
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

// Atalhos de teclado
export const KEYBOARD_SHORTCUTS = {
  // Ferramentas
  SELECT_TOOL: 'KeyS',
  POINT_TOOL: 'KeyP',
  LINE_TOOL: 'KeyL',
  POLYGON_TOOL: 'KeyO',
  
  // Ações
  DELETE: 'Delete',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  UNDO: 'KeyZ',
  REDO: 'KeyY',
  SAVE: 'KeyS',
  
  // Navegação
  ZOOM_IN: 'Equal',
  ZOOM_OUT: 'Minus',
  FIT_VIEW: 'KeyF',
  
  // Seleção
  SELECT_ALL: 'KeyA',
  COPY: 'KeyC',
  PASTE: 'KeyV',
  
  // Modificadores
  CTRL: 'ctrlKey',
  SHIFT: 'shiftKey',
  ALT: 'altKey',
} as const;

// Configurações de estilo padrão
export const DEFAULT_STYLES = {
  // Pontos
  point: {
    markerColor: '#1976d2',
    markerSize: 8,
  },
  
  // Linhas
  line: {
    strokeColor: '#1976d2',
    strokeWidth: 3,
    strokeOpacity: 1,
  },
  
  // Polígonos
  polygon: {
    strokeColor: '#1976d2',
    strokeWidth: 2,
    strokeOpacity: 1,
    fillColor: '#1976d2',
    fillOpacity: 0.3,
  },
  
  // Seleção
  selection: {
    strokeColor: '#ff6b35',
    strokeWidth: 3,
    fillColor: '#ff6b35',
    fillOpacity: 0.2,
  },
  
  // Edição (hot)
  editing: {
    strokeColor: '#4caf50',
    strokeWidth: 2,
    fillColor: '#4caf50',
    fillOpacity: 0.3,
  },
  
  // Vértices
  vertex: {
    color: '#1976d2',
    radius: 6,
    strokeColor: '#ffffff',
    strokeWidth: 2,
  },
  
  // Pontos médios
  midpoint: {
    color: 'rgba(25, 118, 210, 0.6)',
    radius: 4,
    strokeColor: '#1976d2',
    strokeWidth: 1,
  },
} as const;

// Configurações de snap
export const SNAP_CONFIG = {
  defaultTolerance: 10, // pixels
  vertexTolerance: 15,
  edgeTolerance: 8,
  gridSize: 100, // metros
  enabled: true,
  snapToVertices: true,
  snapToEdges: false,
  snapToGrid: false,
} as const;

// Limites de dados
export const DATA_LIMITS = {
  // Coordenadas
  maxCoordinatePrecision: 6, // casas decimais
  maxCoordinateValue: 180,
  minCoordinateValue: -180,
  
  // Features
  maxFeatureNameLength: 100,
  maxFeatureDescriptionLength: 1000,
  maxPropertiesCount: 50,
  
  // Geometrias
  maxVerticesPerLineString: 1000,
  maxVerticesPerPolygon: 1000,
  minVerticesPerLineString: 2,
  minVerticesPerPolygon: 3,
  
  // Layers
  maxLayerNameLength: 50,
  maxLayersCount: 100,
  
  // Maps
  maxMapNameLength: 50,
  maxMapsCount: 20,
} as const;

// Estados da aplicação
export const APP_STATES = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
  SAVING: 'saving',
  IMPORTING: 'importing',
  EXPORTING: 'exporting',
} as const;

// Tipos de eventos
export const EVENT_TYPES = {
  FEATURE_CREATED: 'feature:created',
  FEATURE_UPDATED: 'feature:updated',
  FEATURE_DELETED: 'feature:deleted',
  LAYER_CREATED: 'layer:created',
  LAYER_UPDATED: 'layer:updated',
  LAYER_DELETED: 'layer:deleted',
  MAP_CREATED: 'map:created',
  MAP_UPDATED: 'map:updated',
  MAP_DELETED: 'map:deleted',
  TOOL_CHANGED: 'tool:changed',
  SELECTION_CHANGED: 'selection:changed',
} as const;

// Configurações de validação
export const VALIDATION_CONFIG = {
  // Tolerâncias geométricas
  geometryTolerance: 0.000001, // ~10cm na linha do equador
  selfIntersectionTolerance: 0.0001,
  
  // Validação de dados
  requireFeatureName: false,
  allowEmptyGeometries: false,
  validateTopology: true,
} as const;

// Configurações de exportação/importação
export const IO_CONFIG = {
  // Formatos suportados
  supportedExportFormats: ['ebgeo', 'geojson', 'kml'],
  supportedImportFormats: ['ebgeo', 'geojson', 'kml', 'shapefile'],
  
  // Limites de arquivo
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFeaturesPerFile: 10000,
  
  // Configurações de compressão
  compressionLevel: 6,
  includeStyles: true,
  includeMetadata: true,
} as const;

// URLs e endpoints (para futuras implementações)
export const API_CONFIG = {
  // Base URLs
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  mapTilesUrl: import.meta.env.VITE_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Endpoints
  endpoints: {
    features: '/api/features',
    layers: '/api/layers',
    maps: '/api/maps',
    assets: '/api/assets',
    export: '/api/export',
    import: '/api/import',
  },
  
  // Headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// Configurações de debug
export const DEBUG_CONFIG = {
  enabled: import.meta.env.DEV,
  showPerformanceMetrics: false,
  showCoordinates: false,
  showBoundingBoxes: false,
  showVertexIndices: false,
  logLevel: import.meta.env.DEV ? 'debug' : 'error',
} as const;

// Configurações regionais (Brasil)
export const LOCALE_CONFIG = {
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm:ss',
  coordinateFormat: 'decimal', // decimal, dms, utm
  
  // Coordenadas padrão para o Brasil
  defaultCenter: [-51.2177, -30.0346] as [number, number], // Porto Alegre
  defaultBounds: [
    [-73.9872354804, -33.7683777809],  // Southwest
    [-28.6341164009, 5.2842873289]     // Northeast
  ] as [[number, number], [number, number]],
} as const;

// Export de todas as constantes
export const CONSTANTS = {
  APP_INFO,
  PERFORMANCE_CONFIG,
  NETWORK_CONFIG,
  GEOMETRY_TYPES,
  DRAWING_TOOLS,
  KEYBOARD_SHORTCUTS,
  DEFAULT_STYLES,
  SNAP_CONFIG,
  DATA_LIMITS,
  APP_STATES,
  EVENT_TYPES,
  VALIDATION_CONFIG,
  IO_CONFIG,
  API_CONFIG,
  DEBUG_CONFIG,
  LOCALE_CONFIG,
} as const;