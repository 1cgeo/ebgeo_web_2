// Path: map3d\components\Map3DView\styles.ts
import { styled } from '@mui/material/styles';

export const MapContainer = styled('div')({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  height: '100vh',
  cursor: 'default',

  // Estilos para controles do Cesium
  '& .cesium-viewer-toolbar': {
    top: 80,
    right: 10,
  },

  '& .cesium-viewer-cesiumInspectorContainer': {
    top: 80,
    right: 10,
  },
});
