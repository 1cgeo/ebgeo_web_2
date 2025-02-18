// Path: mapSig\features\mouseCoordinates\FormatSelector\styles.ts
import { Box, MenuItem, Popover } from '@mui/material';
import { styled } from '@mui/material/styles';

export const SelectorContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  width: 200,
}));

export const StyledPopover = styled(Popover)({
  '& .MuiPopover-paper': {
    overflow: 'visible',
  },
});

export const FormatMenuItem = styled(MenuItem, {
  shouldForwardProp: prop => prop !== '$selected',
})<{ $selected?: boolean }>(({ theme, $selected }) => ({
  fontSize: '0.875rem',
  padding: theme.spacing(0.75, 1.5),
  minHeight: 'auto',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  ...($selected && {
    backgroundColor: theme.palette.action.selected,
  }),
}));

export const SelectorTitle = styled(Box)(({ theme }) => ({
  fontWeight: 'bold',
  padding: theme.spacing(0.5, 1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(0.5),
}));
