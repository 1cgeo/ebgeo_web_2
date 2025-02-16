// Path: map3d\features\catalog\Catalog\index.tsx
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Modal,
  TextField,
  Typography,
} from '@mui/material';

import { type FC, Suspense } from 'react';

import { useMap3DStore } from '@/map3d/store';

import { ModelCard } from '../ModelCard';
import { useCatalogStore } from '../store';
import { usePaginatedCatalog } from '../useQueries';
import {
  HeaderContainer,
  LoadMoreButton,
  LoadingWrapper,
  NoResultsMessage,
  PanelContainer,
  ResultsContainer,
  SearchBox,
} from './styles';

export const CatalogPanel: FC = () => {
  const {
    isPanelOpen,
    closePanel,
    searchParams,
    setSearchTerm,
    addModelToScene,
  } = useCatalogStore();

  const { models } = useMap3DStore();

  const { data, isLoading, error, hasNextPage, page, setPage, totalPages } =
    usePaginatedCatalog();

  const isModelLoaded = (modelId: string) => {
    return models.some(m => m.id === modelId);
  };

  if (!isPanelOpen) return null;

  return (
    <Modal
      open={isPanelOpen}
      onClose={closePanel}
      aria-labelledby="catalog-title"
    >
      <PanelContainer>
        <HeaderContainer>
          <Typography
            id="catalog-title"
            variant="h5"
            component="h2"
            color="primary"
          >
            Catálogo de modelos 3D
          </Typography>
          <IconButton
            onClick={closePanel}
            size="small"
            aria-label="fechar catálogo"
          >
            <CloseIcon />
          </IconButton>
        </HeaderContainer>

        <SearchBox>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar modelos..."
            value={searchParams.query || ''}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </SearchBox>

        {data && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mostrando{' '}
            {data.data.length > 0
              ? (page - 1) * searchParams.por_pagina + 1
              : 0}
            –{Math.min(page * searchParams.por_pagina, data.total)} de{' '}
            {data.total} resultados
          </Typography>
        )}

        <ResultsContainer>
          {error ? (
            <NoResultsMessage>
              <Typography variant="h6" color="error">
                Erro ao carregar os modelos. Tente novamente.
              </Typography>
            </NoResultsMessage>
          ) : isLoading ? (
            <LoadingWrapper>
              <CircularProgress />
            </LoadingWrapper>
          ) : data?.data.length === 0 ? (
            <NoResultsMessage>
              <Typography variant="h6" color="text.secondary">
                Nenhum resultado encontrado
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tente ajustar seus termos de busca
              </Typography>
            </NoResultsMessage>
          ) : (
            <Grid container spacing={2}>
              <Suspense fallback={<CircularProgress />}>
                {data?.data.map(model => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={model.id}>
                    <ModelCard
                      model={model}
                      onAddModel={addModelToScene}
                      isLoaded={isModelLoaded(model.id)}
                    />
                  </Grid>
                ))}
              </Suspense>
            </Grid>
          )}

          {hasNextPage && (
            <LoadMoreButton
              variant="contained"
              onClick={() => setPage(page + 1)}
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Carregar mais'}
            </LoadMoreButton>
          )}
        </ResultsContainer>
      </PanelContainer>
    </Modal>
  );
};
