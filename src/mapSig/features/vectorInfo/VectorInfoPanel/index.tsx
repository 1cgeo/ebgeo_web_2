// Path: mapSig\features\vectorInfo\VectorInfoPanel\index.tsx
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

import { type FC } from 'react';

import { cleanSourceName, filterProperties } from '../featureUtils';
import { useVectorInfoStore } from '../store';
import { StyledPanel } from './styles';

interface VectorInfoPanelProps {
  open: boolean;
}

export const VectorInfoPanel: FC<VectorInfoPanelProps> = ({ open }) => {
  const { selectedFeature, closePanel } = useVectorInfoStore();

  if (!open || !selectedFeature) return null;

  const displayProperties = filterProperties(selectedFeature.properties);
  const title = selectedFeature.source
    ? `Atributos ${cleanSourceName(selectedFeature.source)}:`
    : 'Informação da Feição';

  return (
    <StyledPanel>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      {displayProperties.length > 0 ? (
        <List dense>
          {displayProperties.map(({ key, value }) => (
            <ListItem key={key}>
              <ListItemText primary={`${key}: ${value}`} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>Feição sem atributos</Typography>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={closePanel}>
          Fechar
        </Button>
      </Box>
    </StyledPanel>
  );
};
