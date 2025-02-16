// Path: mapSig\features\featureSearch\SearchInput\index.tsx
import { Box, ListItemText, TextField, Typography } from '@mui/material';
import debounce from 'lodash/debounce';

import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useQuery } from '@tanstack/react-query';

import { searchFeatures } from '../api';
import { useFeatureSearchStore } from '../store';
import { type SearchFeature } from '../types';
import { useFeatureMarker } from '../useFeatureMarker';
import { SearchContainer, StyledListItem, SuggestionsList } from './styles';

export const SearchInput: FC = () => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimeoutRef = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { selectFeature } = useFeatureSearchStore();
  const { setMarker } = useFeatureMarker();

  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setQuery(value), 300),
    [],
  );

  useEffect(() => {
    // Auto-focus quando o componente montar
    inputRef.current?.focus();
  }, []);

  const { data } = useQuery({
    queryKey: ['featureSearch', query],
    queryFn: () =>
      searchFeatures({
        query,
        page: 1,
        pageSize: 10,
      }),
    enabled: query.length >= 3,
  });

  const handleSuggestionClick = useCallback(
    (feature: SearchFeature) => {
      setMarker(feature);
      selectFeature(feature);
      setQuery('');
      setShowSuggestions(false);
    },
    [selectFeature, setMarker],
  );

  const handleBlur = () => {
    suggestionTimeoutRef.current = window.setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    if (data?.features.length) {
      setShowSuggestions(true);
    }
  };

  return (
    <SearchContainer>
      <TextField
        fullWidth
        inputRef={inputRef}
        placeholder="Busque por nome geográfico"
        value={query}
        onChange={e => debouncedSetQuery(e.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus}
        size="small"
      />

      {showSuggestions && data?.features.length ? (
        <SuggestionsList>
          {data.features.map(feature => (
            <StyledListItem
              key={feature.id}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSuggestionClick(feature)}
            >
              <ListItemText
                primary={
                  <Box component="span" sx={{ fontWeight: 'bold' }}>
                    {feature.tipo}:
                  </Box>
                }
                secondary={
                  <Typography variant="body2">
                    {feature.nome} ({feature.municipio}, {feature.estado})
                  </Typography>
                }
              />
            </StyledListItem>
          ))}
        </SuggestionsList>
      ) : null}
    </SearchContainer>
  );
};
