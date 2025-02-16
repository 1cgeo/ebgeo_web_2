// Path: map3d\components\Layout\styles.ts
import { styled } from '@mui/material/styles';

export const RootStyle = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
  overflow: 'hidden',
});

export const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  [theme.breakpoints.down(260)]: {
    paddingTop: 60,
  },
}));

export const DrawerContentStyle = styled('div')(({ theme }) => ({
  width: 250,
  padding: theme.spacing(2),
}));
