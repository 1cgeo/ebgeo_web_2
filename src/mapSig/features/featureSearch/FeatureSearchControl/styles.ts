// Path: mapSig\features\featureSearch\FeatureSearchControl\styles.ts
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: 32,
  height: 32,
  padding: 4,
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));
