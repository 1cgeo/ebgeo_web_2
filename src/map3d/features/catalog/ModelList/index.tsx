// Path: map3d\features\catalog\ModelList\index.tsx
import { Close, Visibility, VisibilityOff, ZoomIn } from '@mui/icons-material';
import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';

import { type FC, useEffect } from 'react';

import { getModelThumbnailUrl } from '../api';
import { type CatalogItem } from '../types';
import { useCatalog } from '../useCatalog';
import { Controls, ListContainer } from './styles';

interface VisibilityButtonProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const VisibilityButton: FC<VisibilityButtonProps> = ({
  isVisible,
  onToggleVisibility,
}) => {
  return (
    <IconButton size="small" onClick={onToggleVisibility}>
      {isVisible ? (
        <Visibility fontSize="small" />
      ) : (
        <VisibilityOff fontSize="small" />
      )}
    </IconButton>
  );
};

interface ModelItemProps {
  model: CatalogItem;
}

const ModelItem: FC<ModelItemProps> = ({ model }) => {
  const { zoomToModel, removeModel, toggleModelVisibility, isModelVisible } =
    useCatalog();

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <ListItem disableGutters>
      <Avatar
        src={getModelThumbnailUrl(model)}
        variant="rounded"
        sx={{ width: 32, height: 32, mr: 1 }}
      />
      <Tooltip title={model.name}>
        <ListItemText
          primary={truncateText(model.name, 20)}
          primaryTypographyProps={{
            noWrap: true,
            fontSize: '0.875rem',
            fontWeight: 'medium',
          }}
        />
      </Tooltip>
      <Controls>
        <VisibilityButton
          isVisible={isModelVisible(model.id)}
          onToggleVisibility={() => toggleModelVisibility(model.id)}
        />
        <IconButton size="small" onClick={() => zoomToModel(model.id)}>
          <ZoomIn fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => removeModel(model.id)}>
          <Close fontSize="small" />
        </IconButton>
      </Controls>
    </ListItem>
  );
};

export const ModelList: FC = () => {
  const { loadedModels, removeModel } = useCatalog();

  // Clean up models on component unmount
  useEffect(() => {
    return () => {
      loadedModels.forEach(model => removeModel(model.id));
    };
  }, [loadedModels, removeModel]);

  if (loadedModels.length === 0) {
    return null;
  }

  return (
    <ListContainer>
      <Box sx={{ p: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="subtitle2">
          Modelos Carregados ({loadedModels.length})
        </Typography>
      </Box>
      <List
        disablePadding
        sx={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}
      >
        {loadedModels.map(model => (
          <ModelItem key={model.id} model={model} />
        ))}
      </List>
    </ListContainer>
  );
};
