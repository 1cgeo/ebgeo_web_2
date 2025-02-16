// Path: map3d\features\identify\IdentifyPanel\styles.ts
import { styled } from '@mui/material/styles';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const PanelContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: 300,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[4],
  zIndex: 1002,
}));

export const InfoGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  '& .MuiTypography-root': {
    fontSize: '0.875rem',
  },
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  padding: theme.spacing(0.5),
  '& svg': {
    fontSize: '1.25rem',
  },
}))(({ children, ...props }) => (
  <IconButton {...props}>
    <CloseIcon />
  </IconButton>
));