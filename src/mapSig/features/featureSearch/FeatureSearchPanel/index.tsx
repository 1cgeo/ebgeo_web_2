// Path: mapSig\features\featureSearch\FeatureSearchPanel\index.tsx
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

import { type FC } from 'react';

import { useFeatureSearchStore } from '../store';
import { useFeatureMarker } from '../useFeatureMarker';
import { StyledPanel } from './styles';

interface FeatureSearchPanelProps {
  open: boolean;
}

export const FeatureSearchPanel: FC<FeatureSearchPanelProps> = ({ open }) => {
  const { selectedFeature, closePanel } = useFeatureSearchStore();
  const { clearMarker } = useFeatureMarker();

  if (!open || !selectedFeature) return null;

  const displayProperties = [
    { key: 'Nome', value: selectedFeature.nome },
    { key: 'Latitude', value: selectedFeature.coordinates.lat },
    { key: 'Longitude', value: selectedFeature.coordinates.lng },
    { key: 'Classe', value: selectedFeature.tipo },
    { key: 'Município', value: selectedFeature.municipio },
    { key: 'Estado', value: selectedFeature.estado },
  ];

  const handleClose = () => {
    clearMarker();
    closePanel();
  };

  return (
    <StyledPanel>
      <Typography variant="h6" gutterBottom>
        Resultado da busca
      </Typography>

      <List dense>
        {displayProperties.map(({ key, value }) => (
          <ListItem key={key}>
            <ListItemText primary={`${key}: ${value}`} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleClose}>
          Fechar
        </Button>
      </Box>
    </StyledPanel>
  );
};
