// Path: mapSig\components\RightSideToolBar\styles.ts
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ToolbarContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 150,
  right: 10,
  backgroundColor: 'white',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  boxShadow: theme.shadows[2],
  zIndex: 1000,
  opacity: 0.9,
  transition: theme.transitions.create(['opacity']),

  '&:hover': {
    opacity: 1,
  },

  // Estilos para o container das ferramentas
  '& > div': {
    position: 'relative',

    // Animação no hover
    '&:hover': {
      '& > .MuiTooltip-tooltip': {
        opacity: 1,
        visibility: 'visible',
      },
    },
  },

  // Responsividade
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));
