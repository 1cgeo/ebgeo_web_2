// Path: map3d\components\Layout\styles.ts
import { styled } from '@mui/material/styles';

export const RootStyle = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
  overflow: 'hidden',
  position: 'relative',
});

export const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: 80,
  transition: theme.transitions.create('padding', {
    duration: theme.transitions.duration.standard,
  }),

  [theme.breakpoints.down(260)]: {
    paddingTop: 60,
  },

  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  '-ms-overflow-style': 'none',
}));
