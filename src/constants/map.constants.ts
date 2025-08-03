// Path: constants\map.constants.ts

// Configurações do mapa base
export const MAP_CONFIG = {
  // Configurações padrão do MapLibre
  defaultStyle: {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster' as const,
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm-layer',
        type: 'raster' as const,
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  
  // Vista inicial
  initialView: {
    center: [-51.2177, -30.0346] as [number, number], // Porto Alegre
    zoom: 10,
    bearing: 0,
    pitch: 0,
  },
  
  // Limites de navegação
  navigation: {
    minZoom: 0,
    maxZoom: 22,
    maxBounds: [
      [-180, -85], // Southwest
      [180, 85]    // Northeast
    ] as [[number, number], [number, number]],
  },
  
  // Configurações de controles
  controls: {
    navigation: {
      showCompass: true,
      showZoom: true,
      visualizePitch: false,
    },
    scale: {
      maxWidth: 100,
      unit: 'metric' as const,
    },
    attribution: {
      compact: true,
      customAttribution: 'EBGeo v1.0',
    },
  },
} as const;

// Sources do mapa para features
export const MAP_SOURCES = {
  // Features persistidas (cold source)
  COLD_FEATURES: 'cold-features',
  
  // Features sendo editadas (hot source)
  HOT_FEATURES: 'hot-features',
  
  // Features selecionadas
  SELECTED_FEATURES: 'selected-features',
  
  // Features temporárias/preview
  TEMP_FEATURES: 'temp-features',
  
  // Tiles de base
  BASE_TILES: 'osm-tiles',
} as const;

// Layers do mapa
export const MAP_LAYERS = {
  // Camada base
  BASE_LAYER: 'osm-layer',
  
  // Camadas de features (pontos)
  COLD_FEATURES_POINTS: 'cold-features-points',
  HOT_FEATURES_POINTS: 'hot-features-points',
  SELECTED_FEATURES_POINTS: 'selected-features-points',
  TEMP_FEATURES_POINTS: 'temp-features-points',
  
  // Camadas de features (linhas)
  COLD_FEATURES_LINES: 'cold-features-lines',
  HOT_FEATURES_LINES: 'hot-features-lines',
  SELECTED_FEATURES_LINES: 'selected-features-lines',
  TEMP_FEATURES_LINES: 'temp-features-lines',
  
  // Camadas de features (polígonos)
  COLD_FEATURES_POLYGONS: 'cold-features-polygons',
  HOT_FEATURES_POLYGONS: 'hot-features-polygons',
  SELECTED_FEATURES_POLYGONS: 'selected-features-polygons',
  TEMP_FEATURES_POLYGONS: 'temp-features-polygons',
  
  // Camadas de texto
  COLD_FEATURES_TEXT: 'cold-features-text',
  HOT_FEATURES_TEXT: 'hot-features-text',
  
  // Camadas de símbolos militares
  COLD_FEATURES_MILITARY: 'cold-features-military',
  HOT_FEATURES_MILITARY: 'hot-features-military',
} as const;

// Configurações de estilo para camadas
export const LAYER_PAINT_CONFIGS = {
  // Pontos normais
  pointsPaint: {
    'circle-radius': [
      'case',
      ['has', 'markerSize', ['get', 'style']],
      ['get', 'markerSize', ['get', 'style']],
      8
    ],
    'circle-color': [
      'case',
      ['has', 'markerColor', ['get', 'style']],
      ['get', 'markerColor', ['get', 'style']],
      '#1976d2'
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': [
      'case',
      ['has', 'markerOpacity', ['get', 'style']],
      ['get', 'markerOpacity', ['get', 'style']],
      1
    ],
  },
  
  // Pontos selecionados
  selectedPointsPaint: {
    'circle-radius': [
      'case',
      ['has', 'markerSize', ['get', 'style']],
      ['*', ['get', 'markerSize', ['get', 'style']], 1.3],
      10
    ],
    'circle-color': '#ff6b35',
    'circle-stroke-width': 3,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 1,
  },
  
  // Linhas normais
  linesPaint: {
    'line-width': [
      'case',
      ['has', 'strokeWidth', ['get', 'style']],
      ['get', 'strokeWidth', ['get', 'style']],
      3
    ],
    'line-color': [
      'case',
      ['has', 'strokeColor', ['get', 'style']],
      ['get', 'strokeColor', ['get', 'style']],
      '#1976d2'
    ],
    'line-opacity': [
      'case',
      ['has', 'strokeOpacity', ['get', 'style']],
      ['get', 'strokeOpacity', ['get', 'style']],
      1
    ],
  },
  
  // Linhas selecionadas
  selectedLinesPaint: {
    'line-width': [
      'case',
      ['has', 'strokeWidth', ['get', 'style']],
      ['+', ['get', 'strokeWidth', ['get', 'style']], 2],
      5
    ],
    'line-color': '#ff6b35',
    'line-opacity': 0.9,
  },
  
  // Polígonos normais
  polygonsPaint: {
    'fill-color': [
      'case',
      ['has', 'fillColor', ['get', 'style']],
      ['get', 'fillColor', ['get', 'style']],
      '#1976d2'
    ],
    'fill-opacity': [
      'case',
      ['has', 'fillOpacity', ['get', 'style']],
      ['get', 'fillOpacity', ['get', 'style']],
      0.3
    ],
    'fill-outline-color': [
      'case',
      ['has', 'strokeColor', ['get', 'style']],
      ['get', 'strokeColor', ['get', 'style']],
      '#1976d2'
    ],
  },
  
  // Polígonos selecionados
  selectedPolygonsPaint: {
    'fill-color': '#ff6b35',
    'fill-opacity': 0.4,
    'fill-outline-color': '#ff6b35',
  },
  
  // Features sendo editadas (hot)
  hotFeaturesPaint: {
    points: {
      'circle-radius': 8,
      'circle-color': '#4caf50',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
    lines: {
      'line-width': 3,
      'line-color': '#4caf50',
      'line-opacity': 0.8,
    },
    polygons: {
      'fill-color': '#4caf50',
      'fill-opacity': 0.3,
      'fill-outline-color': '#4caf50',
    },
  },
} as const;

// Configurações de layout para camadas
export const LAYER_LAYOUT_CONFIGS = {
  // Layout para linhas
  linesLayout: {
    'line-join': 'round' as const,
    'line-cap': 'round' as const,
  },
  
  // Layout para texto
  textLayout: {
    'text-field': ['get', 'name'],
    'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
    'text-size': [
      'case',
      ['has', 'textSize', ['get', 'style']],
      ['get', 'textSize', ['get', 'style']],
      12
    ],
    'text-offset': [
      'case',
      ['has', 'textOffset', ['get', 'style']],
      ['get', 'textOffset', ['get', 'style']],
      [0, 0]
    ],
    'text-anchor': 'center' as const,
    'text-allow-overlap': false,
  },
  
  // Layout para símbolos
  symbolLayout: {
    'icon-image': ['get', 'icon'],
    'icon-size': [
      'case',
      ['has', 'iconSize', ['get', 'style']],
      ['get', 'iconSize', ['get', 'style']],
      1
    ],
    'icon-rotation-alignment': 'map' as const,
    'icon-allow-overlap': true,
  },
} as const;

// Filtros para diferentes tipos de geometria
export const GEOMETRY_FILTERS = {
  POINTS: ['==', '$type', 'Point'],
  LINES: ['==', '$type', 'LineString'],
  POLYGONS: ['==', '$type', 'Polygon'],
  MULTI_POLYGONS: ['==', '$type', 'MultiPolygon'],
} as const;

// Configurações de interação
export const INTERACTION_CONFIG = {
  // Raio para detecção de cliques (pixels)
  clickRadius: 5,
  hoverRadius: 3,
  
  // Cursors
  cursors: {
    default: 'default',
    pointer: 'pointer',
    crosshair: 'crosshair',
    move: 'move',
    grab: 'grab',
    grabbing: 'grabbing',
    notAllowed: 'not-allowed',
  },
  
  // Timeouts
  hoverDelay: 100, // ms
  clickDelay: 200, // ms para distinguir single/double click
  
  // Drag thresholds
  dragThreshold: 3, // pixels
  minDragDistance: 5, // pixels
} as const;

// Configurações de animação
export const ANIMATION_CONFIG = {
  // Durações (ms)
  flyToDuration: 1000,
  easeToDuration: 500,
  fadeDuration: 300,
  
  // Easing functions
  easing: {
    linear: (t: number) => t,
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t: number) => t * (2 - t),
  },
  
  // Configurações de fit bounds
  fitBounds: {
    padding: 50,
    maxZoom: 18,
    duration: 1000,
  },
} as const;

// Configurações específicas para o Brasil
export const BRAZIL_CONFIG = {
  // Bounds do Brasil
  bounds: [
    [-73.9872354804, -33.7683777809],  // Southwest
    [-28.6341164009, 5.2842873289]     // Northeast
  ] as [[number, number], [number, number]],
  
  // Principais cidades para navegação rápida
  cities: {
    'porto-alegre': {
      name: 'Porto Alegre',
      center: [-51.2177, -30.0346] as [number, number],
      zoom: 12,
    },
    'sao-paulo': {
      name: 'São Paulo',
      center: [-46.6333, -23.5505] as [number, number],
      zoom: 11,
    },
    'rio-de-janeiro': {
      name: 'Rio de Janeiro',
      center: [-43.1729, -22.9068] as [number, number],
      zoom: 11,
    },
    'brasilia': {
      name: 'Brasília',
      center: [-47.8825, -15.7942] as [number, number],
      zoom: 11,
    },
    'salvador': {
      name: 'Salvador',
      center: [-38.5014, -12.9714] as [number, number],
      zoom: 11,
    },
    'fortaleza': {
      name: 'Fortaleza',
      center: [-38.5434, -3.7174] as [number, number],
      zoom: 11,
    },
    'belo-horizonte': {
      name: 'Belo Horizonte',
      center: [-43.9352, -19.9167] as [number, number],
      zoom: 11,
    },
    'manaus': {
      name: 'Manaus',
      center: [-60.0212, -3.1190] as [number, number],
      zoom: 11,
    },
    'curitiba': {
      name: 'Curitiba',
      center: [-49.2743, -25.4195] as [number, number],
      zoom: 11,
    },
    'recife': {
      name: 'Recife',
      center: [-34.8811, -8.0578] as [number, number],
      zoom: 11,
    },
  },
  
  // Sistemas de coordenadas comuns no Brasil
  projections: {
    SIRGAS2000: 'EPSG:4674',
    UTM_21S: 'EPSG:31981',
    UTM_22S: 'EPSG:31982',
    UTM_23S: 'EPSG:31983',
    UTM_24S: 'EPSG:31984',
    UTM_25S: 'EPSG:31985',
  },
} as const;

// Export consolidado
export const MAP_CONSTANTS = {
  MAP_CONFIG,
  MAP_SOURCES,
  MAP_LAYERS,
  LAYER_PAINT_CONFIGS,
  LAYER_LAYOUT_CONFIGS,
  GEOMETRY_FILTERS,
  INTERACTION_CONFIG,
  ANIMATION_CONFIG,
  BRAZIL_CONFIG,
} as const;