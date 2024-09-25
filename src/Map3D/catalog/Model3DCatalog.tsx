import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Modal, Box, TextField, Typography, Button, CircularProgress, InputAdornment } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import config from '../../config';
import { CatalogItem } from './modelTypes';

const ModelCard = React.lazy(() => import('./ModelCard'));

interface Model3DCatalogProps {
  open: boolean;
  onClose: () => void;
  onAddModel: (model: CatalogItem) => void;
  loadedModels?: CatalogItem[];
}

const Model3DCatalog: React.FC<Model3DCatalogProps> = ({ open, onClose, onAddModel, loadedModels = [] }) => {
  const [models, setModels] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const searchTimeout = useRef<number | null>(null);

  const fetchModels = async (search: string = '', pageNum: number = 1) => {
    setLoading(true);
    setNoResults(false);
    try {
      const searchParam = search ? `&q=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${config.endpoints.modelCatalog}?nr_records=10&page=${pageNum}${searchParam}`);
      const data = await response.json();
      if (pageNum === 1) {
        setModels(data.data);
        setNoResults(data.data.length === 0);
      } else {
        setModels(prevModels => [...prevModels, ...data.data]);
      }
      setTotalCount(data.total);
    } catch (error) {
      console.error('Error fetching models:', error);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback((search: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = window.setTimeout(() => {
      setPage(1);
      fetchModels(search, 1);
    }, 300);
  }, []);

  useEffect(() => {
    if (open) {
      fetchModels();
    }
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [open]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      debouncedSearch(searchTerm);
    } else if (searchTerm.length === 0) {
      setPage(1);
      fetchModels();
    }
  }, [searchTerm, debouncedSearch]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchModels(searchTerm, nextPage);
  };

  const isModelLoaded = (model: CatalogItem) => {
    return loadedModels.some(loadedModel => loadedModel.id === model.id);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 1200,
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, color: '#315730' }}>
        Catálogo de modelos 3D
        </Typography>
        <Box sx={{ mb: 3, position: 'relative' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar modelos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#315730',
                },
              },
            }}
          />
        </Box>
        
        {!noResults && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mostrando {models.length > 0 ? ((page - 1) * 10 + 1) : 0}–{Math.min(page * 10, totalCount)} de {totalCount} resultados
          </Typography>
        )}
        
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
          <Grid container spacing={2}>
            <Suspense fallback={<CircularProgress />}>
              {models.map((model) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg:3 }} key={model.id}>
                  <ModelCard 
                    model={model} 
                    onAddModel={onAddModel} 
                    onClose={onClose}
                    isLoaded={isModelLoaded(model)}
                  />
                </Grid>
              ))}
            </Suspense>
          </Grid>
        )}
        
        {models.length > 0 && !noResults && models.length < totalCount && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="contained"
              onClick={handleLoadMore}
              disabled={loading}
              sx={{ 
                bgcolor: '#315730', 
                color: 'white', 
                '&:hover': { bgcolor: '#508D4E' },
                '&.Mui-disabled': { bgcolor: '#cccccc', color: '#666666' }
              }}
            >
              {loading ? 'Carregando...' : 'Mostrar mais'}
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default Model3DCatalog;