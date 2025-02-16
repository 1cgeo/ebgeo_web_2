// Path: map3d\features\catalog\Catalog\styles.ts
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CatalogContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 1200,
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  boxShadow: theme.shadows[24],
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,

  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: '4px',
  },
}));

export const SearchBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: '50px',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const ResultsContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: 200,
}));

export const LoadMoreButton = styled(Button)(({ theme }) => ({
  display: 'block',
  margin: `${theme.spacing(3)} auto`,
  minWidth: 200,
}));

export const NoResultsMessage = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
}));

export const LoadingWrapper = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});
