import { styled } from '@mui/material/styles';
import { IconButton } from '@mui/material';

interface StyledIconButtonProps {
  $active?: boolean;
  $disabled?: boolean;
}

export const StyledIconButton = styled(IconButton)<StyledIconButtonProps>(
  ({ theme, $active, $disabled }) => ({
    width: 32,
    height: 32,
    padding: 4,
    backgroundColor: $active ? theme.palette.action.selected : 'transparent',
    opacity: $disabled ? 0.5 : 1,
    '&:hover': {
      backgroundColor: $disabled ? 'transparent' : theme.palette.action.hover,
    },
  })
);