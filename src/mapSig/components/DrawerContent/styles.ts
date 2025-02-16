// Path: mapSig\components\DrawerContent\styles.ts
import { List, ListItem } from '@mui/material';
import { styled } from '@mui/material/styles';

export const DrawerList = styled(List)(({ theme }) => ({
  padding: theme.spacing(1),
  overflow: 'auto',

  // Personaliza a scrollbar
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

export const DrawerListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5),

  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },

  // Estilo para o botão dentro do item
  '& .MuiButton-root': {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,

    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}));
