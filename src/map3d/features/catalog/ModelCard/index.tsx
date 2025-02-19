// Path: map3d\features\catalog\ModelCard\index.tsx
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckIcon from '@mui/icons-material/Check';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material';

import { type FC } from 'react';

import { getModelThumbnailUrl } from '../api';
import { type CatalogItem } from '../types';

interface ModelCardProps {
  model: CatalogItem;
  onAddModel: (model: CatalogItem) => void;
  isLoaded: boolean;
}

export const ModelCard: FC<ModelCardProps> = ({
  model,
  onAddModel,
  isLoaded,
}) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('pt-BR', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card
      sx={{
        height: 320,
        width: '100%',
        maxWidth: 250,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        transition: '0.3s',
        '&:hover': {
          transform: 'scale(1.03)',
          '& .MuiCardContent-root': {
            opacity: 1,
          },
          '& .model-button': {
            opacity: 1,
          },
        },
      }}
    >
      <CardMedia
        component="img"
        image={getModelThumbnailUrl(model)}
        alt={model.name}
        sx={{ flexGrow: 1, objectFit: 'cover' }}
      />
      <CardContent
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          transition: '0.3s',
          opacity: 0.8,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {model.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            height: '2.5em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {model.description}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Chip
            label={model.type}
            size="small"
            sx={{
              bgcolor: model.type === 'Tiles 3D' ? '#315730' : '#508D4E',
              color: 'white',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
            <Typography variant="caption">
              {formatDate(model.data_criacao)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {model.municipio}, {model.estado}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {model.palavras_chave.slice(0, 3).map((keyword, index) => (
            <Tooltip key={index} title={keyword} arrow>
              <Chip
                label={keyword}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                  maxWidth: 60,
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                }}
              />
            </Tooltip>
          ))}
          {model.palavras_chave.length > 3 && (
            <Tooltip title={model.palavras_chave.slice(3).join(', ')} arrow>
              <Chip
                label={`+${model.palavras_chave.length - 3}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            </Tooltip>
          )}
        </Box>
      </CardContent>
      <Button
        className="model-button"
        startIcon={isLoaded ? <CheckIcon /> : <AddIcon />}
        onClick={() => onAddModel(model)}
        disabled={isLoaded}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: isLoaded ? '#315730' : 'rgba(255, 255, 255, 0.8)',
          color: isLoaded ? 'white' : '#315730',
          opacity: 0,
          transition: '0.3s',
          '&:hover': {
            bgcolor: isLoaded ? '#315730' : '#315730',
            color: 'white',
          },
          '&.Mui-disabled': {
            bgcolor: '#315730',
            color: 'white',
            opacity: 1,
          },
        }}
      >
        {isLoaded ? 'Carregado' : 'Adicionar ao mapa'}
      </Button>
    </Card>
  );
};

export default ModelCard;
