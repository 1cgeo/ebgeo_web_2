// Path: features/layers/components/LayerManager.tsx

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
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
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  ContentCopy as CopyIcon,
  SwapHoriz as TransferIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';

import { useLayersStore, useLayersActions, useLayersSelectors, useLayerVisibility } from '../store/layers.store';
import { useMapsStore, useMapsSelectors } from '../../maps-contexts/store/maps.store';
import { 
  useLayers, 
  useCreateLayer, 
  useUpdateLayer, 
  useDeleteLayer, 
  useDuplicateLayer,
} from '../../data-access/hooks/useLayers';
import { useFeatures } from '../../data-access/hooks/useFeatures';
import { useFeatureTransfer } from '../hooks/useFeatureTransfer';
import { LayerConfig, createDefaultLayer } from '../../data-access/schemas/layer.schema';
import { FeatureTransferDialog } from './FeatureTransferDialog';
import { AttributeTable } from './AttributeTable';
import { DraggableLayerList } from './DraggableLayerList';

interface LayerManagerProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export const LayerManager: React.FC<LayerManagerProps> = ({
  open,
  onClose,
  className,
}) => {
  // Estados locais
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [attributeTableOpen, setAttributeTableOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<LayerConfig | null>(null);
  const [newLayerName, setNewLayerName] = useState('');
  const [editLayerName, setEditLayerName] = useState('');
  const [duplicateName, setDuplicateName] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuLayerId, setMenuLayerId] = useState<string | null>(null);

  // Stores
  const layersSelectors = useLayersSelectors();
  const layersActions = useLayersActions();
  const mapsSelectors = useMapsSelectors();
  const layerVisibility = useLayerVisibility();

  // Queries e mutations
  const { data: allLayers = [], isLoading: isLoadingLayers, error: layersError } = useLayers();
  const { data: allFeatures = [] } = useFeatures();
  const createLayer = useCreateLayer();
  const updateLayer = useUpdateLayer();
  const deleteLayer = useDeleteLayer();
  const duplicateLayer = useDuplicateLayer();

  // Hook de transferência
  const featureTransfer = useFeatureTransfer();

  // Layers do mapa ativo
  const activeMapId = useMapsStore(state => state.activeMapId);
  const activeMapLayers = useMapsStore(state => 
    activeMapId ? 
      state.mapLayers.get(activeMapId) || [] :
      []
  ).sort((a, b) => b.zIndex - a.zIndex); // Ordenar por zIndex (maior no topo)

  // Calcular estatísticas das camadas
  const layerStats = React.useMemo(() => {
    return activeMapLayers.map(layer => {
      const features = allFeatures.filter(f => f.properties.layerId === layer.id);
      return {
        layerId: layer.id,
        featureCount: features.length,
        geometryTypes: features.reduce((acc, f) => {
          acc[f.geometry.type] = (acc[f.geometry.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    });
  }, [activeMapLayers, allFeatures]);

  // Resetar estados ao fechar
  useEffect(() => {
    if (!open) {
      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      setDeleteDialogOpen(false);
      setDuplicateDialogOpen(false);
      setAttributeTableOpen(false);
      setSelectedLayer(null);
      setNewLayerName('');
      setEditLayerName('');
      setDuplicateName('');
      handleMenuClose();
    }
  }, [open]);

  // Handlers para menu de contexto
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, layerId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuLayerId(layerId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuLayerId(null);
  };

  // Handler para criar camada
  const handleCreateLayer = async () => {
    if (!newLayerName.trim() || !activeMapId) return;

    try {
      const newLayer = createDefaultLayer(newLayerName.trim());
      await createLayer.mutateAsync(newLayer);
      
      // Adicionar ao mapa ativo
      // TODO: Implementar addLayerToMap
      
      setCreateDialogOpen(false);
      setNewLayerName('');
    } catch (error) {
      console.error('Erro ao criar camada:', error);
    }
  };

  // Handler para editar camada
  const handleEditLayer = async () => {
    if (!selectedLayer || !editLayerName.trim()) return;

    try {
      await updateLayer.mutateAsync({
        id: selectedLayer.id,
        updates: { name: editLayerName.trim() }
      });
      
      setEditDialogOpen(false);
      setSelectedLayer(null);
      setEditLayerName('');
    } catch (error) {
      console.error('Erro ao editar camada:', error);
    }
  };

  // Handler para deletar camada
  const handleDeleteLayer = async () => {
    if (!selectedLayer) return;

    try {
      await deleteLayer.mutateAsync(selectedLayer.id);
      setDeleteDialogOpen(false);
      setSelectedLayer(null);
    } catch (error) {
      console.error('Erro ao deletar camada:', error);
    }
  };

  // Handler para duplicar camada
  const handleDuplicateLayer = async () => {
    if (!selectedLayer || !duplicateName.trim()) return;

    try {
      await duplicateLayer.mutateAsync({
        id: selectedLayer.id,
        newName: duplicateName.trim()
      });
      
      setDuplicateDialogOpen(false);
      setSelectedLayer(null);
      setDuplicateName('');
    } catch (error) {
      console.error('Erro ao duplicar camada:', error);
    }
  };

  // Handler para transferir features da camada
  const handleTransferLayerFeatures = (layerId: string) => {
    const layerFeatures = allFeatures.filter(f => f.properties.layerId === layerId);
    const featureIds = layerFeatures.map(f => f.id);
    
    if (featureIds.length > 0) {
      featureTransfer.openTransferDialog(featureIds);
    }
    
    handleMenuClose();
  };

  // Obter estatísticas de uma camada
  const getLayerStats = (layerId: string) => {
    return layerStats.find(s => s.layerId === layerId) || { 
      layerId, 
      featureCount: 0, 
      geometryTypes: {} 
    };
  };

  if (!open) return null;

  return (
    <>
      <Paper
        className={`layer-manager ${className || ''}`}
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          left: 200,
          width: 380,
          maxHeight: 'calc(100vh - 32px)',
          zIndex: 1200,
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
              Gerenciar Camadas
            </Typography>
            {mapsSelectors.activeMapName && (
              <Typography variant="caption" color="text.secondary">
                Mapa: {mapsSelectors.activeMapName}
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Transferir Features">
              <IconButton 
                size="small" 
                onClick={() => featureTransfer.openTransferDialog()}
                disabled={allFeatures.length === 0}
              >
                <TransferIcon />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Botão de criar camada */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            fullWidth
            disabled={!activeMapId || activeMapLayers.length >= 10}
          >
            Nova Camada
          </Button>
          {activeMapLayers.length >= 10 && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              Limite máximo de 10 camadas atingido
            </Typography>
          )}
        </Box>

        {/* Lista de camadas */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {isLoadingLayers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : layersError ? (
            <Alert severity="error" sx={{ m: 2 }}>
              Erro ao carregar camadas
            </Alert>
          ) : activeMapLayers.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <LayersIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Nenhuma camada no mapa
              </Typography>
            </Box>
          ) : (
            <DraggableLayerList
              layers={activeMapLayers}
              layerStats={layerStats}
              onLayerMenuOpen={handleMenuOpen}
              onTransferLayerFeatures={handleTransferLayerFeatures}
              onOpenAttributeTable={(layerId) => {
                const layer = activeMapLayers.find(l => l.id === layerId);
                if (layer) {
                  setSelectedLayer(layer);
                  setAttributeTableOpen(true);
                }
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Menu de contexto */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const layer = activeMapLayers.find(l => l.id === menuLayerId);
            if (layer) {
              setSelectedLayer(layer);
              setEditLayerName(layer.name);
              setEditDialogOpen(true);
            }
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            const layer = activeMapLayers.find(l => l.id === menuLayerId);
            if (layer) {
              setSelectedLayer(layer);
              setDuplicateName(`${layer.name} (Cópia)`);
              setDuplicateDialogOpen(true);
            }
            handleMenuClose();
          }}
        >
          <CopyIcon sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            const layer = activeMapLayers.find(l => l.id === menuLayerId);
            if (layer) {
              setSelectedLayer(layer);
              setDeleteDialogOpen(true);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Deletar
        </MenuItem>
      </Menu>

      {/* Diálogo de criar camada */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Nova Camada</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Camada"
            fullWidth
            variant="outlined"
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateLayer()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateLayer}
            variant="contained"
            disabled={!newLayerName.trim() || createLayer.isPending}
          >
            {createLayer.isPending ? 'Criando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de editar camada */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Editar Camada</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Camada"
            fullWidth
            variant="outlined"
            value={editLayerName}
            onChange={(e) => setEditLayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEditLayer()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleEditLayer}
            variant="contained"
            disabled={!editLayerName.trim() || updateLayer.isPending}
          >
            {updateLayer.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de deletar camada */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Deletar Camada</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja deletar a camada "{selectedLayer?.name}"?
          </Typography>
          {selectedLayer && getLayerStats(selectedLayer.id).featureCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Esta camada contém {getLayerStats(selectedLayer.id).featureCount} feature(s) que também serão deletadas.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleDeleteLayer}
            color="error"
            variant="contained"
            disabled={deleteLayer.isPending}
          >
            {deleteLayer.isPending ? 'Deletando...' : 'Deletar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de duplicar camada */}
      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)}>
        <DialogTitle>Duplicar Camada</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Nova Camada"
            fullWidth
            variant="outlined"
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDuplicateLayer()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleDuplicateLayer}
            variant="contained"
            disabled={!duplicateName.trim() || duplicateLayer.isPending}
          >
            {duplicateLayer.isPending ? 'Duplicando...' : 'Duplicar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de transferência de features */}
      <FeatureTransferDialog
        open={featureTransfer.isDialogOpen}
        onClose={featureTransfer.closeTransferDialog}
        preSelectedFeatureIds={featureTransfer.preSelectedFeatureIds}
      />

      {/* Tabela de atributos */}
      {selectedLayer && (
        <AttributeTable
          open={attributeTableOpen}
          layerId={selectedLayer.id}
          onClose={() => setAttributeTableOpen(false)}
        />
      )}
    </>
  );
};