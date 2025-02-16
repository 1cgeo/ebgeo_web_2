// Path: mapSig\features\vectorInfo\VectorInfoControl\styles.ts
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledIconButton = styled(IconButton)<{ $active?: boolean }>(
  ({ theme, $active }) => ({
    width: 32,
    height: 32,
    padding: 4,
    backgroundColor: $active ? theme.palette.action.selected : 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
);
