import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StyledPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 150,
  right: 60,
  width: 300,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  overflow: 'hidden',
  zIndex: 1000,
}));

export const SearchBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const ResultsList = styled(Box)(({ theme }) => ({
  maxHeight: 400,
  overflowY: 'auto',
  padding: theme.spacing(1, 0),
}));

export const LoadingWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
});

export const NoResultsMessage = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));