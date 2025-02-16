import { styled } from '@mui/material/styles';
import { IconButton } from '@mui/material';

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: 32,
  height: 32,
  padding: 4,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));