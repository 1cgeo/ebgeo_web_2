// Path: map3d\features\catalog\ModelList\index.tsx
import { Close, Visibility, VisibilityOff, ZoomIn } from '@mui/icons-material';
import { Avatar, IconButton, List, ListItemText, Tooltip } from '@mui/material';

import { type FC } from 'react';

import { useMap3DStore } from '@/map3d/store';

import { getModelThumbnailUrl } from '../api';
import { useModels } from '../useModels';
import { Controls, ListContainer, ListItem } from './styles';

export const ModelList: FC = () => {
  const { models, activeTool } = useMap3DStore();

  const { setModelVisibility, removeModel } = useModels();

  // Não mostra a lista se não houver modelos ou se estiver no catálogo
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

            <Tooltip title={model.nome}>
              <ListItemText
                primary={model.nome}
                primaryTypographyProps={{
                  noWrap: true,
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                }}
                secondary={model.tipo}
                secondaryTypographyProps={{
                  noWrap: true,
                  fontSize: '0.75rem',
                }}
              />
            </Tooltip>

            <Controls>
              <IconButton
                size="small"
                onClick={() => setModelVisibility(model.id, !model.visivel)}
                title={model.visivel ? 'Ocultar modelo' : 'Mostrar modelo'}
              >
                {model.visivel ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </IconButton>

              <IconButton
                size="small"
                onClick={() => {
                  // TODO: Implementar zoom para o modelo
                  console.log('Zoom para', model.nome);
                }}
                title="Zoom para o modelo"
              >
                <ZoomIn fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => removeModel(model.id)}
                title="Remover modelo"
              >
                <Close fontSize="small" />
              </IconButton>
            </Controls>
          </ListItem>
        ))}
      </List>
    </ListContainer>
  );
};
