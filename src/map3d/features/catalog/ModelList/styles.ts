// Path: map3d\features\catalog\ModelList\styles.ts
import { Box, ListItem as MuiListItem } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ListContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(1),
  top: 120,
  width: 250,
  maxHeight: 'calc(100vh - 140px)',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  zIndex: 1000,
}));

export const ListItem = styled(MuiListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  display: 'flex',
  alignItems: 'center',
}));

export const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  marginLeft: 'auto',
  '& .MuiIconButton-root': {
    padding: theme.spacing(0.5),
  },
}));
