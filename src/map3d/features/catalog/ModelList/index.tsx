// Path: map3d\features\catalog\ModelList\index.tsx
import { Close, Visibility, VisibilityOff, ZoomIn } from '@mui/icons-material';
import { Avatar, IconButton, List, ListItemText, Tooltip } from '@mui/material';

import { type FC } from 'react';

import { useMap3DStore } from '@/map3d/store';
import { getModelThumbnailUrl } from '@/map3d/utils/modelUtils';

import { Controls, ListContainer, ListItem } from './styles';

export const ModelList: FC = () => {
  const { models, removeModel, updateModel, activeTool } = useMap3DStore();

  if (models.length === 0 || activeTool === 'catalog') return null;

  return (
    <ListContainer>
      <List disablePadding>
        {models.map(model => (
          <ListItem key={model.id}>
            <Avatar
              src={getModelThumbnailUrl(model)}
              variant="rounded"
              sx={{ width: 32, height: 32, mr: 1 }}
            />

            <Tooltip title={model.name}>
              <ListItemText
                primary={model.name}
                primaryTypographyProps={{
                  noWrap: true,
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                }}
              />
            </Tooltip>

            <Controls>
              <IconButton
                size="small"
                onClick={() =>
                  updateModel(model.id, { visible: !model.visible })
                }
              >
                {model.visible ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </IconButton>

              <IconButton
                size="small"
                onClick={() => {
                  // Zoom para o modelo
                  // Implementação depende da integração com Cesium
                }}
              >
                <ZoomIn fontSize="small" />
              </IconButton>

              <IconButton size="small" onClick={() => removeModel(model.id)}>
                <Close fontSize="small" />
              </IconButton>
            </Controls>
          </ListItem>
        ))}
      </List>
    </ListContainer>
  );
};
