import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const ToolbarContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 150,
  right: 10,
  backgroundColor: 'white',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  boxShadow: theme.shadows[2],
  zIndex: 1000,
  opacity: 0.9,
}));