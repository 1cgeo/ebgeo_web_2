import { FC } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import {
  FeatureSearchPanelProps
} from "../../../ts/interfaces/mapSig.interfaces";


const FeatureSearchPanel: FC<FeatureSearchPanelProps> = ({ feature, onClose }) => {
  const displayProperties = [
    { key: 'Nome', value: feature.nome },
    { key: 'Latitude', value: feature.latitude },
    { key: 'Longitude', value: feature.longitude },
    { key: 'Classe', value: feature.tipo },
    { key: 'Município', value: feature.municipio },
    { key: 'Estado', value: feature.estado },
  ];

  return (
    <Box
      sx={{
        position: 'fixed', // Mudado de 'absolute' para 'fixed'
        bottom: 10,
        right: 10,
        width: 300,
        bgcolor: 'background.paper',
        border: '1px solid grey',
        borderRadius: 1,
        p: 2,
        zIndex: 1002, // Aumentado para garantir que fique acima de outros elementos
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', // Adicionado para melhor visibilidade
      }}
    >
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
      <Button variant="contained" onClick={onClose} sx={{ mt: 2 }}>
        Fechar
      </Button>
    </Box>
  );
};

export default FeatureSearchPanel;