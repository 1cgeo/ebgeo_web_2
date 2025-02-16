// Path: mapSig\features\featureSearch\SearchInput\styles.ts
import { Box, ListItem } from '@mui/material';
import { styled } from '@mui/material/styles';

export const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(7),
  width: 300,
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

export const SuggestionsList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  maxHeight: 350,
  overflowY: 'auto',
}));

export const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));
