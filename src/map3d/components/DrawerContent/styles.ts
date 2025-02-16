// Path: map3d\components\DrawerContent\styles.ts
import { Button, List, ListItem } from '@mui/material';
import { styled } from '@mui/material/styles';

export const DrawerList = styled(List)(({ theme }) => ({
  padding: theme.spacing(1),
}));

export const DrawerItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
}));

export const FeatureButton = styled(Button)(({ theme }) => ({
  width: '100%',
  justifyContent: 'flex-start',
  textTransform: 'none',
  color: theme.palette.text.primary,
  padding: theme.spacing(1),
}));
