// Path: map3d\components\Map3DView\styles.ts
import { styled } from '@mui/material/styles';

export const MapContainer = styled('div')({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  top: 0,
  left: 0,
  height: '100vh',
  cursor: 'default',

  // Estilos específicos do Cesium
  '& .cesium-viewer-toolbar': {
    top: '80px',
    position: 'fixed',
  },

  '& .cesium-viewer-toolbar > span > div': {
    position: 'absolute',
    right: '60px',
  },
});
