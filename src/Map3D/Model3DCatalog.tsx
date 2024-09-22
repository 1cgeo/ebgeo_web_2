import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Grid, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import config from '../config';

interface Model3D {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  url: string;
  lon: number;
  lat: number;
  height: number;
  heightOffset: number;
  maximumScreenSpaceError: number;
}

interface Model3DCatalogProps {
  open: boolean;
  onClose: () => void;
  onAddModel: (model: Model3D) => void;
}

const Model3DCatalog: React.FC<Model3DCatalogProps> = ({ open, onClose, onAddModel }) => {
  const [models, setModels] = useState<Model3D[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchModels = async (search: string = '', pageNum: number = 1) => {
    setLoading(true);
    try {
      const searchParam = search ? `&q=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${config.endpoints.modelCatalog}?nr_records=10&page=${pageNum}${searchParam}`);
      const data = await response.json();
      if (pageNum === 1) {
        setModels(data);
      } else {
        setModels(prevModels => [...prevModels, ...data]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchModels();
    }
  }, [open]);

  const handleSearch = () => {
    setPage(1);
    fetchModels(searchTerm, 1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchModels(searchTerm, nextPage);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 900,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar modelos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="contained" onClick={handleSearch} sx={{ ml: 1 }}>
            Buscar
          </Button>
        </Box>
        <Grid container spacing={2}>
          {models.map((model) => (
            <Grid item xs={12} sm={6} md={4} key={model.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={model.thumbnail}
                  alt={model.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {model.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {model.description}
                  </Typography>
                  <Button size="small" onClick={() => { onAddModel(model); onClose(); }}>
                    Adicionar ao mapa
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {models.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default Model3DCatalog;

const tilesetSetups = [ //Dado inicial
  {
    url: "/3d/AMAN/tileset.json",

    heightOffset: 50, //-360 para elipsoide 40 para terreno,
    id: "AMAN",
    default: true,
    locate: {
      lat: -22.455921,
      lon: -44.449655,
      height: 2200,
    },
  },
  {
    url: "/3d/ESA/tileset.json",
    heightOffset: 75,
    id: "ESA",
    locate: {
      lon: -45.25666459926732,
      lat: -21.703613735103637,
      height: 1500,
    },
  },
  {
    url: "/3d/PCL/tileset.json",
    heightOffset: 35,
    id: "PCL",
    locate: {
      lon: -44.47332385414955,
      lat: -22.43976556982974,
      height: 1000,
    },
  },
]