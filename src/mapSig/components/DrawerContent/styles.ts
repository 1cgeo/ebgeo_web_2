import { styled } from '@mui/material/styles';
import { List, ListItem } from '@mui/material';

export const DrawerList = styled(List)(({ theme }) => ({
  width: 250,
  padding: theme.spacing(1),
}));

export const DrawerListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiButton-root': {
    justifyContent: 'flex-start',
    width: '100%',
    textTransform: 'none',
    padding: theme.spacing(1),
  },
}));