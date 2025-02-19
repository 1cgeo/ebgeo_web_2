// Path: map3d\features\label\LabelPanel\styles.ts
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PanelContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: 300,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[4],
  zIndex: 1002,
}));
