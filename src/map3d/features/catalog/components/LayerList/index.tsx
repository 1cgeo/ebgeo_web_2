import { type FC } from 'react';
import { 
  List,
  ListItemText,
  IconButton,
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  ZoomIn, 
  Close 
} from '@mui/icons-material';
import { useMap3DStore } from '@/map3d/store';
import { getModelUrl } from '../../api';
import { 
  LayerListContainer,
  LayerItem,
  ControlsContainer 
} from './styles';

export const Model3DLayerList: FC = () => {
  const { 
    models,
    removeModel,
    setModelVisibility,
    flyToModel
  } = useMap3DStore();

  if (models.length === 0) return null;

  return (
    <LayerListContainer>
      <List disablePadding>
        {models.map(model => (
          <LayerItem key={model.id}>
            <Avatar
              src={getModelUrl(model.type, model.thumbnail)}
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

            <ControlsContainer>
              <IconButton
                size="small"
                onClick={() => setModelVisibility(model.id, !model.visible)}
              >
                {model.visible ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </IconButton>

              <IconButton
                size="small"
                onClick={() => flyToModel(model.id)}
              >
                <ZoomIn fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => removeModel(model.id)}
              >
                <Close fontSize="small" />
              </IconButton>
            </ControlsContainer>
          </LayerItem>
        ))}
      </List>
    </LayerListContainer>
  );
};