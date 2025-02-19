// Path: map3d\features\catalog\ModelCard\index.tsx
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckIcon from '@mui/icons-material/Check';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Tooltip } from '@mui/material';

import { type FC } from 'react';

import { getModelThumbnailUrl } from '../api';
import { type CatalogItem } from '../types';
import {
  ActionButton,
  CardContainer,
  CardContent,
  CardMedia,
  InfoContainer,
  KeywordChip,
  MetaInfo,
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
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('pt-BR', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <CardContainer>
      <CardMedia src={getModelThumbnailUrl(model)} alt={model.name} />
      <CardContent>
        <h3>{model.name}</h3>
        <p>{model.description}</p>

        <InfoContainer>
          <KeywordChip label={model.type} />
          <MetaInfo>
            <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
            <span>{formatDate(model.data_criacao)}</span>
          </MetaInfo>
        </InfoContainer>

        <MetaInfo>
          <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
          <span>
            {model.municipio}, {model.estado}
          </span>
        </MetaInfo>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginTop: '8px',
          }}
        >
          {model.palavras_chave.slice(0, 3).map((keyword, index) => (
            <Tooltip key={index} title={keyword} arrow>
              <KeywordChip label={keyword} />
            </Tooltip>
          ))}
          {model.palavras_chave.length > 3 && (
            <Tooltip title={model.palavras_chave.slice(3).join(', ')} arrow>
              <KeywordChip label={`+${model.palavras_chave.length - 3}`} />
            </Tooltip>
          )}
        </div>
      </CardContent>

      <ActionButton
        className="model-button"
        startIcon={isLoaded ? <CheckIcon /> : <AddIcon />}
        onClick={() => onAddModel(model)}
        disabled={isLoaded}
      >
        {isLoaded ? 'Carregado' : 'Adicionar ao mapa'}
      </ActionButton>
    </CardContainer>
  );
};
