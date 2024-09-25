import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Chip, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { CatalogItem } from './modelTypes';

interface ModelCardProps {
  model: CatalogItem;
  onAddModel: (model: CatalogItem) => void;
  onClose: () => void;
  isLoaded: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onAddModel, onClose, isLoaded }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('pt-BR', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <Card sx={{ 
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
        }
      },
    }}>
      <CardMedia
        component="img"
        image={model.thumbnail}
        alt={model.name}
        sx={{ flexGrow: 1, objectFit: 'cover' }}
      />
      <CardContent sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        transition: '0.3s',
        opacity: 0.7,
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
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
            WebkitBoxOrient: 'vertical' 
          }}
        >
          {model.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip 
            label={model.type} 
            size="small" 
            sx={{ bgcolor: model.type === 'Tiles 3D' ? '#315730' : '#508D4E', color: 'white' }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
            <Typography variant="caption">
              {formatDate(model.data_criacao)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <Button 
        className="model-button"
        startIcon={isLoaded ? <CheckIcon /> : <AddIcon />}
        onClick={() => { if (!isLoaded) { onAddModel(model); onClose(); } }}
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
            color: 'white' 
          },
          '&.Mui-disabled': {
            bgcolor: '#315730',
            color: 'white',
            opacity: 1,
          }
        }}
      >
        {isLoaded ? 'Carregado' : 'Adicionar ao mapa'}
      </Button>
    </Card>
  );
};

export default ModelCard;