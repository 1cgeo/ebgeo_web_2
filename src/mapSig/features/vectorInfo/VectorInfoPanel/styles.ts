// Path: mapSig\features\vectorInfo\VectorInfoPanel\styles.ts
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledPanel = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: 300,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  zIndex: 1000,
  boxShadow: theme.shadows[2],
}));
