// Path: map3d\features\distance\DistanceResult\styles.ts
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ResultContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  pointerEvents: 'auto',
}));

export const ResultText = styled(Typography)({
  fontSize: '14px',
  fontFamily: 'monospace',
});
