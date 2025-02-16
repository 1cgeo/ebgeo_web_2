// Path: map3d\components\Tool\styles.ts
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StyledIconButtonProps {
  $active?: boolean;
  $disabled?: boolean;
  $drawerMode?: boolean;
}

export const StyledIconButton = styled(IconButton)<StyledIconButtonProps>(
  ({ theme, $active, $disabled, $drawerMode }) => ({
    width: $drawerMode ? 24 : 32,
    height: $drawerMode ? 24 : 32,
    padding: 4,
    backgroundColor: $active ? theme.palette.action.selected : 'transparent',
    opacity: $disabled ? 0.5 : 1,
    '&:hover': {
      backgroundColor: $disabled ? 'transparent' : theme.palette.action.hover,
    },
  }),
);
