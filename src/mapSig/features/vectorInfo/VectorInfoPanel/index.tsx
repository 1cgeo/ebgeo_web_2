// Path: mapSig\features\vectorInfo\VectorInfoPanel\index.tsx
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  Typography,
} from '@mui/material';

import { type FC } from 'react';

import { useVectorInfoStore } from '../store';
import { layerTypeLabels } from '../types';
import { FeatureProperties, LayerItem, StyledPanel } from './styles';

interface VectorInfoPanelProps {
  open: boolean;
}

export const VectorInfoPanel: FC<VectorInfoPanelProps> = ({ open }) => {
  const { layers, selectedFeature, updateLayerVisibility, closePanel } =
    useVectorInfoStore();

  if (!open) return null;

  return (
    <StyledPanel>
      <Typography variant="h6" gutterBottom>
        Camadas Vetoriais
      </Typography>

      <List>
        {layers.map(layer => (
          <LayerItem key={layer.id}>
            <ListItemText
              primary={layer.name}
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {layerTypeLabels[layer.type]}
                  {layer.minzoom &&
                    layer.maxzoom &&
                    ` (Zoom ${layer.minzoom}-${layer.maxzoom})`}
                </Typography>
              }
            />
            <Switch
              edge="end"
              checked={layer.visible}
              onChange={e => updateLayerVisibility(layer.id, e.target.checked)}
            />
          </LayerItem>
        ))}
      </List>

      {selectedFeature && (
        <>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Propriedades da Feição
          </Typography>

          <FeatureProperties>
            {Object.entries(selectedFeature.properties).map(([key, value]) => (
              <ListItem key={key} dense>
                <ListItemText primary={key} secondary={String(value)} />
              </ListItem>
            ))}
          </FeatureProperties>
        </>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={closePanel}>Fechar</button>
      </Box>
    </StyledPanel>
  );
};
