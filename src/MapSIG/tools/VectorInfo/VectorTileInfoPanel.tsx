import { FC } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

type GenericMapGeoJSONFeature = {
    source?: string;
    geometry: {
      type: string;
    };
    properties: Record<string, any>;
};

interface VectorTileInfoPanelProps {
    feature: GenericMapGeoJSONFeature | null;
    onClose: () => void;
}

const VectorTileInfoPanel: FC<VectorTileInfoPanelProps> = ({ feature, onClose }) => {
  const blacklist = ['id', 'vector_type', 'tilequery', 'mapbox_clip_start', 'mapbox_clip_end', 'justificativa_txt_value', 'visivel_value', 'exibir_linha_rotulo_value', 'suprimir_bandeira_value', 'posicao_rotulo_value', 'direcao_fixada_value', 'exibir_ponta_simbologia_value', 'exibir_lado_simbologia_value'];
  const blacklistSuffixes = ['_code'];

  const getDisplayProperties = () => {
    if (!feature) return [];
    return Object.entries(feature.properties || {}).filter(([key, ]) => {
      return !blacklist.includes(key) && !blacklistSuffixes.some(suffix => key.endsWith(suffix));
    }).map(([key, value]) => {
      let displayKey = key.endsWith('_value') ? key.slice(0, -6) : key;
      return { key: displayKey, value };
    });
  };

  const displayProperties = getDisplayProperties();

  const TitleText = () => {
    if (!feature) return "Informação da Feição";
    return `Atributos ${feature.source?.replace(
      /_10k|_25k|_50k|_100k|_250k/g,
      ""
    )}:`;
  };

  const FeatureList = () => {
    if (!feature) {
      return <Typography>Nenhuma feição encontrada neste local.</Typography>;
    }
    if (displayProperties.length > 0) {
      return (
        <List dense>
          {displayProperties.map(({ key, value }) => (
            <ListItem key={key}>
              <ListItemText primary={`${key}: ${value}`} />
            </ListItem>
          ))}
        </List>
      );
    }
    return <Typography>Feição sem atributos</Typography>;
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        width: 300,
        bgcolor: 'background.paper',
        border: '1px solid grey',
        borderRadius: 1,
        p: 2,
        zIndex: 1000,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {TitleText()}
      </Typography>
      {FeatureList()}
      <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
        Fechar
      </Button>
    </Box>
  );
};

export default VectorTileInfoPanel;