// Path: mapSig\components\Layout\styles.ts
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
  paddingTop: 80, // Altura do AppBar
  transition: theme.transitions.create('padding', {
    duration: theme.transitions.duration.standard,
  }),

  // Ajuste para telas muito pequenas
  [theme.breakpoints.down(260)]: {
    paddingTop: 60,
  },

  // Esconde scrollbar em webkit
  '&::-webkit-scrollbar': {
    display: 'none',
  },

  // Esconde scrollbar em firefox
  scrollbarWidth: 'none',

  // Esconde scrollbar em IE/Edge
  '-ms-overflow-style': 'none',
}));
