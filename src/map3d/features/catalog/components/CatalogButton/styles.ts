import { styled, keyframes } from '@mui/material/styles';

const enhancedBlinkAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
`;

export const BlinkWrapper = styled('div')<{ $isBlinking: boolean }>(
  ({ $isBlinking }) => ({
    display: 'inline-block',
    borderRadius: '50%',
    animation: $isBlinking 
      ? `${enhancedBlinkAnimation} 1.5s infinite`
      : 'none'
  })
);