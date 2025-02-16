// Path: map3d\features\viewshed\ViewshedOptions\styles.ts
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const OptionsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  width: 300,
  zIndex: 1000,
  '& .MuiSlider-root': {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

export const OptionGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
  '& .MuiTypography-body2': {
    marginBottom: theme.spacing(0.5),
  },
}));
