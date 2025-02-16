import { styled } from '@mui/material/styles';
import { Box, ListItem } from '@mui/material';

export const StyledPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 150,
  right: 60,
  width: 360,
  maxHeight: 'calc(100vh - 200px)',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  padding: theme.spacing(2),
  zIndex: 1000,
  overflowY: 'auto',
}));

export const LayerItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const FeatureProperties = styled(Box)(({ theme }) => ({
  maxHeight: '300px',
  overflowY: 'auto',
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
}));