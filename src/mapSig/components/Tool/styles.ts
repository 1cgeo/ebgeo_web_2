// Path: mapSig\components\Tool\styles.ts
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StyledIconButtonProps {
  $active?: boolean;
  $disabled?: boolean;
  $drawerMode?: boolean;
}

export const StyledIconButton = styled(IconButton, {
  shouldForwardProp: prop => !prop.startsWith('$'),
})<StyledIconButtonProps>(({ theme, $active, $disabled, $drawerMode }) => ({
  width: $drawerMode ? 24 : 32,
  height: $drawerMode ? 24 : 32,
  padding: 4,
  backgroundColor: $active ? theme.palette.action.selected : 'transparent',
  opacity: $disabled ? 0.5 : 1,
  transition: theme.transitions.create(
    ['background-color', 'opacity', 'transform'],
    { duration: theme.transitions.duration.shortest },
  ),

  '&:hover': {
    backgroundColor: $disabled ? 'transparent' : theme.palette.action.hover,
    transform: $disabled ? 'none' : 'scale(1.05)',
  },

  '&:active': {
    transform: $disabled ? 'none' : 'scale(0.95)',
  },
}));
