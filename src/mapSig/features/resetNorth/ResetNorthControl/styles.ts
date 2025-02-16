// Path: mapSig\features\resetNorth\ResetNorthControl\styles.ts
import { IconButton } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
`;

interface StyledIconButtonProps {
  $isResetting?: boolean;
}

export const StyledIconButton = styled(IconButton, {
  shouldForwardProp: prop => prop !== '$isResetting',
})<StyledIconButtonProps>(({ theme, $isResetting }) => ({
  width: 32,
  height: 32,
  padding: 4,
  transition: theme.transitions.create(['transform', 'background-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  animation: $isResetting ? `${rotate} 1s ease-in-out` : 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'rotate(-45deg)',
  },
  '&:disabled': {
    opacity: 0.5,
  },
}));
