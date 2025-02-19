// Path: map3d\features\catalog\ModelCard\styles.ts
import {
  Box,
  Button,
  Card,
  Chip,
  CardContent as MuiCardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonStyleProps {
  disabled?: boolean;
}

export const CardContainer = styled(Card)(({ theme }) => ({
  height: 320,
  width: '100%',
  maxWidth: 250,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.03)',
    '& .MuiCardContent-root': {
      opacity: 1,
    },
    '& .model-button': {
      opacity: 1,
    },
  },
}));

export const CardMedia = styled('img')({
  flexGrow: 1,
  objectFit: 'cover',
});

export const CardContent = styled(MuiCardContent)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  transition: '0.3s',
  opacity: 0.8,
  padding: theme.spacing(2),
}));

export const ActionButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'disabled',
})<ButtonStyleProps>(({ theme, disabled }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: disabled
    ? theme.palette.primary.main
    : 'rgba(255, 255, 255, 0.8)',
  color: disabled ? 'white' : theme.palette.primary.main,
  opacity: 0,
  transition: '0.3s',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    opacity: 1,
  },
}));

export const InfoContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
});

export const MetaInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const KeywordChip = styled(Chip)(({ theme: _theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  fontSize: '0.7rem',
  height: 20,
  maxWidth: 60,
  '& .MuiChip-label': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));
