// Path: map3d\components\DrawerContent\styles.ts
import { Button, List, ListItem } from '@mui/material';
import { styled } from '@mui/material/styles';

export const DrawerList = styled(List)(({ theme }) => ({
  padding: theme.spacing(1),
  overflow: 'auto',

  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '4px',
  },
}));

export const DrawerItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5),

  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
}));

export const FeatureButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.text.primary,

  '&:hover': {
    backgroundColor: 'transparent',
  },
}));
