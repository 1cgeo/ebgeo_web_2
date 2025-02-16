import { styled } from '@mui/material/styles';
import { Box, TextField } from '@mui/material';

export const StyledPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  right: 20,
  width: 300,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  padding: theme.spacing(2),
  zIndex: 1000,
}));

export const ColorInput = styled(TextField)(({ theme }) => ({
  '& input[type="color"]': {
    width: '100%',
    height: '40px',
    padding: theme.spacing(0.5),
    border: 'none',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  }
}));