// Path: shared\config\baseMapStyles\topoBaseMapStyles.ts
import { type TopoStyle } from '../../types';

export const topoBaseMapStyle: TopoStyle = {
  version: 8,
  name: 'EBGEO - Topográfico',
  sources: {
    topo: {
      type: 'vector',
      tiles: ['https://example.com/topo/{z}/{x}/{y}.pbf'],
      minzoom: 0,
      maxzoom: 22,
      attribution: 'Diretoria de Serviço Geográfico - Exército Brasileiro',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'fill',
      source: 'topo',
      'source-layer': 'background',
      paint: {
        'fill-color': '#f8f8f8',
        'fill-opacity': 1,
      },
    },
    {
      id: 'roads',
      type: 'line',
      source: 'topo',
      'source-layer': 'transportation',
      paint: {
        'line-color': '#888888',
        'line-width': 1,
      },
    },
    {
      id: 'places',
      type: 'symbol',
      source: 'topo',
      'source-layer': 'places',
      layout: {
        'text-field': '{name}',
        'text-font': ['Roboto Regular'],
        'text-size': 12,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#666666',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1,
      },
    },
  ],
};
