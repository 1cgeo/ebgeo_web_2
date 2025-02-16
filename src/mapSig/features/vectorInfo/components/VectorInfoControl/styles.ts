import { styled } from '@mui/material/styles';
import { IconButton } from '@mui/material';

export const StyledIconButton = styled(IconButton)<{ $active?: boolean }>(
  ({ theme, $active }) => ({
    width: 32,
    height: 32,
    padding: 4,
    backgroundColor: $active ? theme.palette.action.selected : 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  })
);