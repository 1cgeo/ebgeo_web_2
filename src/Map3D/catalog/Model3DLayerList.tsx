import React from 'react';
import { Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { ZoomIn, Delete } from '@mui/icons-material';
import { useMapTools } from '../contexts/Map3DTools';

const Model3DLayerList: React.FC = () => {
  const { models, zoomToModel, removeModel } = useMapTools();

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 10,
        top: 120,
        width: 250,
        maxHeight: 'calc(100vh - 140px)',
        overflowY: 'auto',
        backgroundColor: 'white',
        borderRadius: 1,
        boxShadow: 1,
        zIndex: 1000,
      }}
    >
      <List>
        {models.map((model) => (
          <ListItem
            key={model.id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="zoom" onClick={() => zoomToModel(model.id)}>
                  <ZoomIn />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => removeModel(model.id)}>
                  <Delete />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={model.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Model3DLayerList;