// Path: map3d\features\identify\IdentifyPanel\styles.ts
import { styled } from '@mui/material/styles';

interface FeatureInfoContainerProps {
  $backgroundColor: string;
  $textColor: string;
  $borderColor: string;
  $width: number;
}

export const FeatureInfoContainer = styled('div')<FeatureInfoContainerProps>(
  ({ $backgroundColor, $textColor, $borderColor, $width }) => ({
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    backgroundColor: $backgroundColor,
    color: $textColor,
    border: `1px solid ${$borderColor}`,
    borderRadius: '4px',
    padding: '10px',
    maxWidth: `${$width}px`,
    width: '100%',
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",

    '& h3': {
      margin: '0 0 10px 0',
      fontSize: '16px',
      fontWeight: 500,
    },

    '& p': {
      margin: '6px 0',
      fontSize: '14px',
      lineHeight: 1.5,
    },
  }),
);

export const CloseButton = styled('button')({
  position: 'absolute',
  top: '5px',
  right: '5px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#666',
  padding: '2px',
  lineHeight: 1,
  '&:hover': {
    color: '#000',
  },
});
