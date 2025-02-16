import { type FC } from 'react';
import {
  Typography,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { type CatalogItem } from '../../types';
import { getModelUrl } from '../../api';
import {
  CardContainer,
  CardContent,
  CardMedia,
  ActionButton,
  InfoContainer,
  KeywordChip,
  MetaInfo
} from './styles';

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
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('pt-BR', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <CardContainer>
      <CardMedia
        component="img"
        image={getModelUrl(model.type, model.thumbnail)}
        alt={model.name}
      />
      <CardContent>
        <Typography variant="h6" component="div">
          {model.name}
        </Typography>
        <Typography variant="body2">
          {model.description}
        </Typography>
        
        <InfoContainer>
          <Chip
            label={model.type}
            size="small"
            color={model.type === 'Tiles 3D' ? 'primary' : 'secondary'}
          />
          <MetaInfo>
            <CalendarTodayIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              {formatDate(model.data_criacao)}
            </Typography>
          </MetaInfo>
        </InfoContainer>

        <MetaInfo>
          <LocationOnIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption">
            {model.municipio}, {model.estado}
          </Typography>
        </MetaInfo>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {model.palavras_chave.slice(0, 3).map((keyword, index) => (
            <KeywordChip key={index} label={keyword} />
          ))}
          {model.palavras_chave.length > 3 && (
            <Tooltip title={model.palavras_chave.slice(3).join(', ')}>
              <KeywordChip label={`+${model.palavras_chave.length - 3}`} />
            </Tooltip>
          )}
        </Box>
      </CardContent>

      <ActionButton
        startIcon={isLoaded ? <CheckIcon /> : <AddIcon />}
        onClick={() => onAddModel(model)}
        disabled={isLoaded}
        variant="contained"
      >
        {isLoaded ? 'Carregado' : 'Adicionar ao mapa'}
      </ActionButton>
    </CardContainer>
  );
};