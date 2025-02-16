// Path: mapSig\components\MapSIGView\styles.ts
import { styled } from '@mui/material/styles';

export const MapContainer = styled('div')({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  top: 0,
  left: 0,
  height: '100vh',
  cursor: 'default',

  // Estilos para controles do MapLibre
  '& .maplibregl-ctrl-group': {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },

  // Estilos para popup
  '& .maplibregl-popup-content': {
    padding: '12px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
});
