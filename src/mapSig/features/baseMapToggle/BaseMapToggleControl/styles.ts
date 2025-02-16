// Path: mapSig\features\baseMapToggle\BaseMapToggleControl\styles.ts
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PreviewButtonProps {
  $isOrtho: boolean;
}

export const PreviewButtonContainer = styled(Box)(({ theme: _theme }) => ({
  position: 'absolute',
  bottom: 20,
  left: 20,
  zIndex: 1000,
}));

export const StyledPreviewButton = styled('div')<PreviewButtonProps>(
  ({ theme, $isOrtho }) => ({
    width: 80,
    height: 80,
    backgroundImage: `url(${$isOrtho ? '/images/imagem_topo.png' : '/images/imagem_orto.png'})`,
    backgroundSize: 'cover',
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    transition: theme.transitions.create(['box-shadow', 'transform'], {
      duration: theme.transitions.duration.shorter,
    }),
    border: `1px solid ${$isOrtho ? '#fff' : '#000'}`,
    '&:hover': {
      boxShadow: theme.shadows[8],
      transform: 'scale(1.02)',
    },
  }),
);
