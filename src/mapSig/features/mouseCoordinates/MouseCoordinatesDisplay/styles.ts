// Path: mapSig\features\mouseCoordinates\MouseCoordinatesDisplay\styles.ts
import { Box, IconButton } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const CoordinatesContainer = styled(Box, {
  shouldForwardProp: prop => prop !== '$visible',
})<{ $visible: boolean }>(({ theme, $visible }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1.5),
  display: 'flex',
  alignItems: 'center',
  transition: 'opacity 0.3s ease, transform 0.3s ease',
  boxShadow: theme.shadows[1],
  zIndex: 1000,
  maxWidth: '90%',
  animation: `${fadeIn} 0.3s ease-out`,
  opacity: $visible ? 1 : 0,
  visibility: $visible ? 'visible' : 'hidden',
  '@media (max-width: 600px)': {
    fontSize: '0.75rem',
    padding: theme.spacing(0.25, 1),
  },
}));

export const CoordinatesText = styled(Box)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  userSelect: 'text',
  marginRight: theme.spacing(1),
  '@media (max-width: 600px)': {
    fontSize: '0.75rem',
  },
}));

export const SettingsButton = styled(IconButton)(({ theme }) => ({
  padding: 0,
  width: 20,
  height: 20,
  marginLeft: theme.spacing(1),
  opacity: 0.7,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 1,
    backgroundColor: 'transparent',
  },
  '& svg': {
    width: 16,
    height: 16,
  },
}));

export const CopyButton = styled(IconButton)(({ theme }) => ({
  padding: 0,
  width: 20,
  height: 20,
  marginLeft: theme.spacing(0.5),
  opacity: 0.7,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 1,
    backgroundColor: 'transparent',
  },
  '& svg': {
    width: 16,
    height: 16,
  },
}));
