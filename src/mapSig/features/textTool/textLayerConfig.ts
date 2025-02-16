// Path: mapSig\features\textTool\textLayerConfig.ts
export const TEXT_SOURCE_ID = 'text-features-source';
export const TEXT_LAYER_ID = 'text-features-layer';

export const textLayerStyle = {
  type: 'symbol' as const,
  layout: {
    'text-field': ['get', 'text'],
    'text-size': ['get', 'size'],
    'text-justify': ['get', 'justify'],
    'text-anchor': 'center',
    'text-rotate': ['get', 'rotation'],
    'text-allow-overlap': true,
    'text-ignore-placement': true,
    'text-font': ['Noto Sans Regular'],
  },
  paint: {
    'text-color': ['get', 'color'],
    'text-halo-color': ['get', 'backgroundColor'],
    'text-halo-width': 2,
  },
};
