// Path: mapSig\features\featureSearch\FeatureSearchPanel\index.tsx
import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';

import { type FC, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { searchFeatures } from '../api';
import { useFeatureSearchStore } from '../store';
import {
  LoadingWrapper,
  NoResultsMessage,
  ResultsList,
  SearchBox,
  StyledPanel,
} from './styles';

interface FeatureSearchPanelProps {
  open: boolean;
  onClose: () => void;
}

export const FeatureSearchPanel: FC<FeatureSearchPanelProps> = ({
  open,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { selectFeature } = useFeatureSearchStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['featureSearch', searchTerm],
    queryFn: () =>
      searchFeatures({
        query: searchTerm,
        page: 1,
        pageSize: 10,
      }),
    enabled: searchTerm.length >= 3,
  });

  if (!open) return null;

  return (
    <StyledPanel>
      <SearchBox>
        <TextField
          fullWidth
          placeholder="Buscar feições..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
        />
      </SearchBox>

      <ResultsList>
        {isLoading && (
          <LoadingWrapper>
            <CircularProgress size={24} />
          </LoadingWrapper>
        )}

        {error && <NoResultsMessage>Erro ao buscar feições</NoResultsMessage>}

        {!isLoading && !error && data?.features.length === 0 && (
          <NoResultsMessage>Nenhuma feição encontrada</NoResultsMessage>
        )}

        {data?.features.map(feature => (
          <ListItem
            key={feature.id}
            button
            onClick={() => selectFeature(feature)}
          >
            <ListItemText
              primary={feature.nome}
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {feature.tipo} - {feature.municipio}, {feature.estado}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </ResultsList>
    </StyledPanel>
  );
};
