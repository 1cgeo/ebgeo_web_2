// Path: map3d\components\Map3DView\styles.ts
import { styled } from '@mui/material/styles';

export const MapContainer = styled('div')({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  height: '100vh',
  top: 0,
  left: 0,
  cursor: 'default',
});

export const ToolbarContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
}));
