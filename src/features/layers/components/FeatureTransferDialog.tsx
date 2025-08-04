// Path: features\layers\components\FeatureTransferDialog.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Close as CloseIcon,
  SwapHoriz as TransferIcon,
  Layers as LayersIcon,
  ExpandMore as ExpandMoreIcon,
  Place as PointIcon,
  Timeline as LineIcon,
  Polygon as PolygonIcon,
  TextFields as TextIcon,
  Shield as MilitaryIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { useFeatureSelection } from '../../selection/hooks/useFeatureSelection';
import { useLayers } from '../../data-access/hooks/useLayers';
import { useMapsStore } from '../../maps-contexts/store/maps.store';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { LayerConfig } from '../../data-access/schemas/layer.schema';

interface FeatureTransferDialogProps {
  open: boolean;
  onClose: () => void;
  preSelectedFeatureIds?: string[];
}

export const FeatureTransferDialog: React.FC<FeatureTransferDialogProps> = ({
  open,
  onClose,
  preSelectedFeatureIds = [],
}) => {
  // Estados locais
  const [targetLayerId, setTargetLayerId] = useState<string>('');
  const [selectedForTransfer, setSelectedForTransfer] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Hooks
  const { selectedFeatures, moveSelectedToLayer, clearSelection, selectFeatures, selectionStats } =
    useFeatureSelection();

  const { data: allLayers = [] } = useLayers();
  const activeMapId = useMapsStore(state => state.activeMapId);

  // Filtrar camadas do mapa ativo
  const mapLayers = useMemo(() => {
    if (!activeMapId) return [];
    const mapData = useMapsStore.getState().loadedMaps.get(activeMapId);
    if (!mapData) return allLayers;

    return allLayers.filter(layer => mapData.layerIds.includes(layer.id));
  }, [allLayers, activeMapId]);

  // Features disponíveis para transferência
  const availableFeatures = useMemo(() => {
    if (preSelectedFeatureIds.length > 0) {
      return selectedFeatures.filter(f => preSelectedFeatureIds.includes(f.id));
    }
    return selectedFeatures;
  }, [selectedFeatures, preSelectedFeatureIds]);

  // Estatísticas das features selecionadas para transferência
  const transferStats = useMemo(() => {
    const features = availableFeatures.filter(f => selectedForTransfer.has(f.id));

    const byGeometry = features.reduce(
      (acc, feature) => {
        const type = feature.geometry.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byLayer = features.reduce(
      (acc, feature) => {
        const layerId = feature.properties.layerId;
        const layer = mapLayers.find(l => l.id === layerId);
        const layerName = layer?.name || 'Camada desconhecida';
        acc[layerName] = (acc[layerName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: features.length,
      byGeometry,
      byLayer,
    };
  }, [availableFeatures, selectedForTransfer, mapLayers]);

  // Ícones por tipo de geometria
  const getGeometryIcon = (type: string) => {
    switch (type) {
      case 'Point':
        return <PointIcon fontSize="small" />;
      case 'LineString':
        return <LineIcon fontSize="small" />;
      case 'Polygon':
        return <PolygonIcon fontSize="small" />;
      default:
        return <TextIcon fontSize="small" />;
    }
  };

  // Reset ao abrir/fechar
  useEffect(() => {
    if (open) {
      setTargetLayerId('');
      setSelectedForTransfer(new Set(preSelectedFeatureIds));
      setShowPreview(false);
      setTransferError(null);
      setTransferSuccess(false);
      setIsTransferring(false);
    }
  }, [open, preSelectedFeatureIds]);

  // Seleção de todas as features
  const handleSelectAll = () => {
    if (selectedForTransfer.size === availableFeatures.length) {
      setSelectedForTransfer(new Set());
    } else {
      setSelectedForTransfer(new Set(availableFeatures.map(f => f.id)));
    }
  };

  // Toggle de feature individual
  const handleToggleFeature = (featureId: string) => {
    const newSelection = new Set(selectedForTransfer);
    if (newSelection.has(featureId)) {
      newSelection.delete(featureId);
    } else {
      newSelection.add(featureId);
    }
    setSelectedForTransfer(newSelection);
  };

  // Executar transferência
  const handleTransfer = async () => {
    if (!targetLayerId || selectedForTransfer.size === 0) return;

    setIsTransferring(true);
    setTransferError(null);

    try {
      // Selecionar apenas as features escolhidas
      const featureIds = Array.from(selectedForTransfer);
      selectFeatures(featureIds, 'replace');

      // Executar transferência
      await moveSelectedToLayer(targetLayerId);

      setTransferSuccess(true);

      // Fechar após sucesso
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : 'Erro na transferência');
    } finally {
      setIsTransferring(false);
    }
  };

  // Validações
  const canTransfer = targetLayerId && selectedForTransfer.size > 0 && !isTransferring;
  const targetLayer = mapLayers.find(l => l.id === targetLayerId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <TransferIcon color="primary" />
            <Typography variant="h6">Transferir Features entre Camadas</Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {transferSuccess ? (
          <Alert severity="success" icon={<SuccessIcon />}>
            <Typography variant="h6">Transferência Concluída!</Typography>
            <Typography>
              {selectedForTransfer.size} feature(s) transferida(s) com sucesso para "
              {targetLayer?.name}".
            </Typography>
          </Alert>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Erro */}
            {transferError && (
              <Alert severity="error" onClose={() => setTransferError(null)}>
                <Typography variant="subtitle2">Erro na Transferência</Typography>
                <Typography variant="body2">{transferError}</Typography>
              </Alert>
            )}

            {/* Seleção de Features */}
            <Accordion
              expanded={!showPreview}
              onChange={(_, expanded) => setShowPreview(!expanded)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Selecionar Features ({selectedForTransfer.size} de {availableFeatures.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Box mb={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedForTransfer.size === availableFeatures.length}
                          indeterminate={
                            selectedForTransfer.size > 0 &&
                            selectedForTransfer.size < availableFeatures.length
                          }
                          onChange={handleSelectAll}
                        />
                      }
                      label="Selecionar todas as features"
                    />
                  </Box>

                  <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List dense>
                      {availableFeatures.map(feature => {
                        const isSelected = selectedForTransfer.has(feature.id);
                        const layer = mapLayers.find(l => l.id === feature.properties.layerId);

                        return (
                          <ListItem
                            key={feature.id}
                            dense
                            sx={{
                              cursor: 'pointer',
                              bgcolor: isSelected ? 'action.selected' : 'inherit',
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                            onClick={() => handleToggleFeature(feature.id)}
                          >
                            <ListItemIcon>
                              <Checkbox checked={isSelected} />
                            </ListItemIcon>
                            <ListItemIcon>{getGeometryIcon(feature.geometry.type)}</ListItemIcon>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2">
                                    {feature.properties.name || `Feature ${feature.id.slice(0, 8)}`}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={layer?.name || 'Sem camada'}
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="textSecondary">
                                  {feature.geometry.type} • ID: {feature.id.slice(0, 8)}
                                </Typography>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Seleção da Camada Destino */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Camada de Destino
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Selecionar camada</InputLabel>
                <Select
                  value={targetLayerId}
                  onChange={e => setTargetLayerId(e.target.value)}
                  label="Selecionar camada"
                  disabled={isTransferring}
                >
                  {mapLayers.map(layer => (
                    <MenuItem key={layer.id} value={layer.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LayersIcon fontSize="small" />
                        <Typography>{layer.name}</Typography>
                        {!layer.visible && <Chip size="small" label="Oculta" variant="outlined" />}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Preview da Transferência */}
            {canTransfer && (
              <Accordion
                expanded={showPreview}
                onChange={(_, expanded) => setShowPreview(expanded)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Visualizar Transferência</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Alert severity="info" icon={<WarningIcon />}>
                      <Typography variant="subtitle2">Resumo da Operação</Typography>
                      <Typography variant="body2">
                        {transferStats.total} feature(s) serão transferidas para "
                        {targetLayer?.name}".
                      </Typography>
                    </Alert>

                    <Box display="flex" gap={4}>
                      {/* Por Geometria */}
                      <Box flex={1}>
                        <Typography variant="subtitle2" gutterBottom>
                          Por Tipo de Geometria
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {Object.entries(transferStats.byGeometry).map(([type, count]) => (
                            <Chip
                              key={type}
                              icon={getGeometryIcon(type)}
                              label={`${type}: ${count}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Por Camada Origem */}
                      <Box flex={1}>
                        <Typography variant="subtitle2" gutterBottom>
                          Camadas de Origem
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {Object.entries(transferStats.byLayer).map(([layerName, count]) => (
                            <Chip
                              key={layerName}
                              icon={<LayersIcon fontSize="small" />}
                              label={`${layerName}: ${count}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isTransferring}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleTransfer}
          disabled={!canTransfer}
          startIcon={isTransferring ? <CircularProgress size={20} /> : <TransferIcon />}
        >
          {isTransferring ? 'Transferindo...' : `Transferir ${selectedForTransfer.size} Feature(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
