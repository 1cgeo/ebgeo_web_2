// Path: map3d\features\label\LabelPanel\styles.ts
import { Box, Button, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PanelContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: 300,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[4],
  zIndex: 1002,
}));

export const ColorInput = styled(TextField)(({ theme }) => ({
  '& input[type="color"]': {
    width: '100%',
    height: '40px',
    padding: theme.spacing(0.5),
    cursor: 'pointer',
  },
}));

export const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(3),
  gap: theme.spacing(2),
}));

export const StyledButton = styled(Button)({
  flex: 1,
});
