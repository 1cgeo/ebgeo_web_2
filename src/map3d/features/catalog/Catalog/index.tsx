// Path: map3d\features\catalog\Catalog\index.tsx
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  CircularProgress,
  Fade,
  InputAdornment,
  Modal,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import {
  type FC,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useCatalog } from '../useCatalog';

const ModelCard = lazy(() =>
  import('../ModelCard').then(module => ({ default: module.ModelCard })),
);

interface Model3DCatalogProps {
  open: boolean;
  onClose: () => void;
}

export const Model3DCatalog: FC<Model3DCatalogProps> = ({ open, onClose }) => {
  const {
    models,
    searchTerm,
    totalItems,
    hasMore,
    isLoading,

    handleSearchChange,
    handleResetSearch,
    loadNextPage,
    handleAddModelAndClose,
    isModelLoaded,
  } = useCatalog();

  const [resizeLoading, setResizeLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = useTheme();
  const prevColumnsCountRef = useRef<number | undefined>(undefined);

  // Determine number of columns based on breakpoint
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const columnsCount = useMemo(() => {
    if (isXs) return 1;
    if (isSm) return 2;
    if (isMd) return 3;
    return 4;
  }, [isXs, isSm, isMd]);

  // Update noResults based on data
  useEffect(() => {
    setNoResults(models.length === 0 && !isLoading);
  }, [models, isLoading]);

  // Effect to detect changes in column count and reload
  useEffect(() => {
    if (
      prevColumnsCountRef.current !== undefined &&
      prevColumnsCountRef.current !== columnsCount &&
      open
    ) {
      setResizeLoading(true);
      handleResetSearch();
      setTimeout(() => setResizeLoading(false), 500);
    }
    prevColumnsCountRef.current = columnsCount;
  }, [columnsCount, open, handleResetSearch]);

  // Handle search input with debounce
  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = null;
      }

      const cleanupFn = handleSearchChange(value);
      if (cleanupFn) {
        searchTimeout.current = setTimeout(() => {
          searchTimeout.current = null;
        }, 300);
      }
    },
    [handleSearchChange],
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        id="catalogContainer"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 1200,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ color: '#315730' }}
          >
            Catálogo de modelos 3D
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar modelos..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
              },
            }}
          />
        </Box>

        {!noResults && models.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mostrando {models.length} de {totalItems} resultados
          </Typography>
        )}

        <Box
          id="scrollableDiv"
          sx={{
            position: 'relative',
            minHeight: 200,
            overflow: 'auto',
            flex: 1,
            maxHeight: 'calc(90vh - 200px)',
          }}
        >
          <Fade in={resizeLoading}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: 2,
                borderRadius: 2,
              }}
            >
              <CircularProgress />
            </Box>
          </Fade>

          {noResults ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum resultado encontrado para sua busca.
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={2}>
                Tente ajustar seus termos de busca ou explorar outros modelos.
              </Typography>
            </Box>
          ) : (
            <InfiniteScroll
              dataLength={models.length}
              next={loadNextPage}
              hasMore={hasMore}
              loader={
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              }
              endMessage={
                models.length > 0 && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Você já viu todos os modelos disponíveis!
                    </Typography>
                  </Box>
                )
              }
              scrollableTarget="scrollableDiv"
            >
              <Grid container spacing={2}>
                <Suspense fallback={<CircularProgress />}>
                  {models.map(model => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={model.id}>
                      <ModelCard
                        model={model}
                        onAddModel={handleAddModelAndClose}
                        isLoaded={isModelLoaded(model.id)}
                      />
                    </Grid>
                  ))}
                </Suspense>
              </Grid>
            </InfiniteScroll>
          )}

          {hasMore && !isLoading && (
            <Button
              variant="contained"
              onClick={loadNextPage}
              disabled={isLoading}
              sx={{
                display: 'block',
                margin: '24px auto',
                minWidth: 200,
              }}
            >
              Carregar mais modelos
            </Button>
          )}
        </Box>
      </Paper>
    </Modal>
  );
};
