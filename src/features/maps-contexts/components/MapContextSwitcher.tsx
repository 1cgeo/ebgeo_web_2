// Path: features\maps-contexts\components\MapContextSwitcher.tsx

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Map as MapIcon,
  MoreVert as MoreIcon,
  Layers as LayersIcon,
  Schedule as TimeIcon,
  CheckCircle as ActiveIcon,
} from '@mui/icons-material';

import { useMapsStore, useMapsActions, useMapsSelectors } from '../store/maps.store';
import { useLayersActions } from '../../layers/store/layers.store';
import { 
  useMaps, 
  useCreateMap, 
  useUpdateMap, 
  useDeleteMap, 
  useDuplicateMap,
  useCanDeleteMap,
  useMapStats 
} from '../../data-access/hooks/useMaps';
import { MapConfig, createDefaultMap } from '../../data-access/schemas/map.schema';
import { formatDate } from '../../../utils/format.utils';

interface MapContextSwitcherProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export const MapContextSwitcher: React.FC<MapContextSwitcherProps> = ({
  open,
  onClose,
  className,
}) => {
  // Estados locais
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedMap, setSelectedMap] = useState<MapConfig | null>(null);
  const [newMapName, setNewMapName] = useState('');
  const [newMapDescription, setNewMapDescription] = useState('');
  const [editMapName, setEditMapName] = useState('');
  const [editMapDescription, setEditMapDescription] = useState('');
  const [duplicateName, setDuplicateName] = useState('');
  const [includeFeatures, setIncludeFeatures] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuMapId, setMenuMapId] = useState<string | null>(null);

  // Stores
  const mapsSelectors = useMapsSelectors();
  const mapsActions = useMapsActions();
  const layersActions = useLayersActions();

  // Queries e mutations
  const { data: allMaps = [], isLoading: isLoadingMaps, error: mapsError } = useMaps();
  const createMap = useCreateMap();
  const updateMap = useUpdateMap();
  const deleteMap = useDeleteMap();
  const duplicateMap = useDuplicateMap();

  // Mapa ativo
  const activeMapId = useMapsStore(state => state.activeMapId);

  // Resetar estado ao abrir/fechar
  useEffect(() => {
    if (!open) {
      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      setDeleteDialogOpen(false);
      setDuplicateDialogOpen(false);
      setSelectedMap(null);
      setNewMapName('');
      setNewMapDescription('');
      setEditMapName('');
      setEditMapDescription('');
      setDuplicateName('');
      setIncludeFeatures(false);
      handleMenuClose();
    }
  }, [open]);

  // Handlers para menu de contexto
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, mapId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuMapId(mapId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuMapId(null);
  };

  // Handler para trocar de mapa
  const handleSwitchToMap = async (map: MapConfig) => {
    try {
      mapsActions.setLoadingMap(true);
      
      // Salvar viewport atual se houver mapa ativo
      if (mapsSelectors.hasActiveMap && mapsSelectors.activeMapName) {
        // Este seria integrado com o MapView para obter viewport atual
        mapsActions.saveViewport(activeMapId!, mapsSelectors.currentCenter, mapsSelectors.currentZoom);
      }

      // Limpar estado das camadas
      layersActions.clearForMap();

      // Definir novo mapa ativo
      mapsActions.setActiveMapData(map);

      // Carregar viewport salvo se houver
      const lastViewport = mapsActions.getLastViewport(map.id);
      if (lastViewport) {
        // Aplicar viewport salvo
        console.log('Restaurando viewport salvo:', lastViewport);
      }

      mapsActions.setLoadingMap(false);
      onClose();
    } catch (error) {
      mapsActions.setError('Erro ao trocar de mapa');
      mapsActions.setLoadingMap(false);
      console.error('Erro ao trocar de mapa:', error);
    }
  };

  // Handler para criar novo mapa
  const handleCreateMap = async () => {
    if (!newMapName.trim()) return;

    try {
      const newMap = createDefaultMap(newMapName.trim(), {
        description: newMapDescription.trim() || undefined,
      });

      await createMap.mutateAsync(newMap);
      
      setCreateDialogOpen(false);
      setNewMapName('');
      setNewMapDescription('');
    } catch (error) {
      mapsActions.setError('Erro ao criar mapa');
      console.error('Erro ao criar mapa:', error);
    }
  };

  // Handler para editar mapa
  const handleEditMap = async () => {
    if (!selectedMap || !editMapName.trim()) return;

    try {
      await updateMap.mutateAsync({
        id: selectedMap.id,
        updates: { 
          name: editMapName.trim(),
          description: editMapDescription.trim() || undefined,
        },
      });

      setEditDialogOpen(false);
      setSelectedMap(null);
      setEditMapName('');
      setEditMapDescription('');
      handleMenuClose();
    } catch (error) {
      mapsActions.setError('Erro ao editar mapa');
      console.error('Erro ao editar mapa:', error);
    }
  };

  // Handler para duplicar mapa
  const handleDuplicateMap = async () => {
    if (!selectedMap || !duplicateName.trim()) return;

    try {
      await duplicateMap.mutateAsync({
        id: selectedMap.id,
        newName: duplicateName.trim(),
        includeFeatures,
      });

      setDuplicateDialogOpen(false);
      setSelectedMap(null);
      setDuplicateName('');
      setIncludeFeatures(false);
      handleMenuClose();
    } catch (error) {
      mapsActions.setError('Erro ao duplicar mapa');
      console.error('Erro ao duplicar mapa:', error);
    }
  };

  // Handler para deletar mapa
  const handleDeleteMap = async () => {
    if (!selectedMap) return;

    try {
      await deleteMap.mutateAsync(selectedMap.id);
      
      // Se era o mapa ativo, limpar
      if (activeMapId === selectedMap.id) {
        layersActions.clearForMap();
        mapsActions.setActiveMapData(null);
      }

      setDeleteDialogOpen(false);
      setSelectedMap(null);
      handleMenuClose();
    } catch (error) {
      mapsActions.setError('Erro ao deletar mapa');
      console.error('Erro ao deletar mapa:', error);
    }
  };

  // Abrir diálogos
  const openEditDialog = (map: MapConfig) => {
    setSelectedMap(map);
    setEditMapName(map.name);
    setEditMapDescription(map.description || '');
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const openDuplicateDialog = (map: MapConfig) => {
    setSelectedMap(map);
    setDuplicateName(`${map.name} (Cópia)`);
    setIncludeFeatures(false);
    setDuplicateDialogOpen(true);
    handleMenuClose();
  };

  const openDeleteDialog = (map: MapConfig) => {
    setSelectedMap(map);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Component para card de mapa
  const MapCard: React.FC<{ map: MapConfig }> = ({ map }) => {
    const isActive = activeMapId === map.id;
    const { data: mapStats } = useMapStats(map.id);
    const { data: canDeleteInfo } = useCanDeleteMap(map.id);

    return (
      <Card
        variant={isActive ? 'elevation' : 'outlined'}
        sx={{
          mb: 2,
          cursor: 'pointer',
          backgroundColor: isActive ? 'action.selected' : 'transparent',
          border: isActive ? 2 : 1,
          borderColor: isActive ? 'primary.main' : 'divider',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        onClick={() => !isActive && handleSwitchToMap(map)}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MapIcon color={isActive ? 'primary' : 'inherit'} />
                <Typography variant="h6" component="h3">
                  {map.name}
                </Typography>
                {isActive && (
                  <Chip
                    icon={<ActiveIcon />}
                    label="Ativo"
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: '0.6rem' }}
                  />
                )}
              </Box>

              {map.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {map.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LayersIcon fontSize="small" color="action" />
                  <Typography variant="caption">
                    {mapStats?.layerCount || 0} camada(s)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption">
                    {mapStats?.totalFeatures || 0} feature(s)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="caption">
                    {formatDate.relative(map.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, map.id);
              }}
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </CardContent>

        {isActive && (
          <CardActions sx={{ pt: 0 }}>
            <Typography variant="caption" color="primary">
              Mapa ativo - Clique em outro mapa para alternar
            </Typography>
          </CardActions>
        )}
      </Card>
    );
  };

  if (!open) return null;

  return (
    <>
      <Paper
        className={`map-context-switcher ${className || ''}`}
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 400,
          maxHeight: 'calc(100vh - 32px)',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Cabeçalho */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="h6">
              Mapas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Gerenciar e alternar entre mapas
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Botão de criar mapa */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            fullWidth
            disabled={allMaps.length >= 10}
          >
            Novo Mapa
          </Button>
          {allMaps.length >= 10 && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              Limite máximo de 10 mapas atingido
            </Typography>
          )}
        </Box>

        {/* Lista de mapas */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {isLoadingMaps ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : mapsError ? (
            <Alert severity="error">
              Erro ao carregar mapas
            </Alert>
          ) : allMaps.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum mapa encontrado
              </Typography>
            </Box>
          ) : (
            allMaps.map((map) => (
              <MapCard key={map.id} map={map} />
            ))
          )}
        </Box>

        {/* Status */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            {allMaps.length} / 10 mapas
          </Typography>
          {mapsSelectors.hasError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {mapsSelectors.error}
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Menu de contexto */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {menuMapId && (
          <>
            <MenuItem onClick={() => {
              const map = allMaps.find(m => m.id === menuMapId);
              if (map) openEditDialog(map);
            }}>
              <EditIcon sx={{ mr: 1 }} />
              Editar
            </MenuItem>
            <MenuItem onClick={() => {
              const map = allMaps.find(m => m.id === menuMapId);
              if (map) openDuplicateDialog(map);
            }}>
              <CopyIcon sx={{ mr: 1 }} />
              Duplicar
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={() => {
                const map = allMaps.find(m => m.id === menuMapId);
                if (map) openDeleteDialog(map);
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon sx={{ mr: 1 }} />
              Deletar
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Diálogo de criar mapa */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Mapa</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Mapa"
            fullWidth
            variant="outlined"
            value={newMapName}
            onChange={(e) => setNewMapName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descrição (opcional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newMapDescription}
            onChange={(e) => setNewMapDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleCreateMap} 
            variant="contained"
            disabled={!newMapName.trim() || createMap.isPending}
          >
            {createMap.isPending ? 'Criando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de editar mapa */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Mapa</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Mapa"
            fullWidth
            variant="outlined"
            value={editMapName}
            onChange={(e) => setEditMapName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descrição (opcional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editMapDescription}
            onChange={(e) => setEditMapDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleEditMap} 
            variant="contained"
            disabled={!editMapName.trim() || updateMap.isPending}
          >
            {updateMap.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de duplicar mapa */}
      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Duplicar Mapa</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Novo Mapa"
            fullWidth
            variant="outlined"
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeFeatures}
                onChange={(e) => setIncludeFeatures(e.target.checked)}
              />
            }
            label="Duplicar também as features (senão apenas as camadas serão referenciadas)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleDuplicateMap} 
            variant="contained"
            disabled={!duplicateName.trim() || duplicateMap.isPending}
          >
            {duplicateMap.isPending ? 'Duplicando...' : 'Duplicar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de deletar mapa */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deletar Mapa</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Tem certeza que deseja deletar o mapa "{selectedMap?.name}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação irá deletar o mapa e todas as suas camadas e features. Esta ação não pode ser desfeita.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleDeleteMap} 
            variant="contained"
            color="error"
            disabled={deleteMap.isPending}
          >
            {deleteMap.isPending ? 'Deletando...' : 'Deletar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};