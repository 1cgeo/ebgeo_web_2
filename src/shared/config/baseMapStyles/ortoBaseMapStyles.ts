// Path: shared\config\baseMapStyles\ortoBaseMapStyles.ts
import { type OrtoStyle } from '../../types';

export const ortoBaseMapStyle: OrtoStyle = {
  version: 8,
  name: 'EBGEO - Ortoimagem',
  sources: {
    orto: {
      type: 'raster',
      tiles: ['https://example.com/orto/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'Diretoria de Serviço Geográfico - Exército Brasileiro',
    },
  },
  layers: [
    {
      id: 'orto-layer',
      type: 'raster',
      source: 'orto',
      minzoom: 0,
      maxzoom: 22,
      paint: {
        'raster-opacity': 1,
        'raster-brightness-min': 0,
        'raster-brightness-max': 1,
        'raster-contrast': 0,
        'raster-saturation': 0,
      },
    },
  ],
};
