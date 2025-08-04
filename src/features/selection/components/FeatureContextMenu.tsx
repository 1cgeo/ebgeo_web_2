// Path: features\selection\components\FeatureContextMenu.tsx

import React, { useState, useEffect } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  SwapHoriz as TransferIcon,
  Visibility as ViewIcon,
  ZoomIn as ZoomIcon,
  Info as InfoIcon,
  Place as PointIcon,
  Timeline as LineIcon,
  Polygon as PolygonIcon,
  TextFields as TextIcon,
  Shield as MilitaryIcon,
} from '@mui/icons-material';

import { useFeatureSelection } from '../hooks/useFeatureSelection';
import { useFeatureTransfer } from '../../layers/hooks/useFeatureTransfer';
import { useDeleteManyFeatures } from '../../data-access/hooks/useMutateFeature';
import { useLayers } from '../../data-access/hooks/useLayers';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';

interface FeatureContextMenuProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  feature: ExtendedFeature | null;
  onClose: () => void;
  onEdit?: (feature: ExtendedFeature) => void;
  onZoomTo?: (feature: ExtendedFeature) => void;
  onShowInfo?: (feature: ExtendedFeature) => void;
}

export const FeatureContextMenu: React.FC<FeatureContextMenuProps> = ({
  open,
  anchorPosition,
  feature,
  onClose,
  onEdit,
  onZoomTo,
  onShowInfo,
}) => {
  // Estados locais
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Hooks
  const { selectFeatures, duplicateSelected, isSelected, selectedFeatureIds } =
    useFeatureSelection();
  const featureTransfer = useFeatureTransfer();
  const deleteManyFeatures = useDeleteManyFeatures();
  const { data: allLayers = [] } = useLayers();

  // Informações da feature
  const layer = feature ? allLayers.find(l => l.id === feature.properties.layerId) : null;
  const isFeatureSelected = feature ? isSelected(feature.id) : false;
  const hasMultipleSelection = selectedFeatureIds.length > 1;

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      setIsDeleting(false);
      setIsDuplicating(false);
    }
  }, [open]);

  // Ícone por tipo de geometria
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

  // Handlers
  const handleSelect = () => {
    if (feature) {
      selectFeatures([feature.id], 'replace');
    }
    onClose();
  };

  const handleAddToSelection = () => {
    if (feature) {
      selectFeatures([feature.id], 'add');
    }
    onClose();
  };

  const handleEdit = () => {
    if (feature && onEdit) {
      // Selecionar a feature se não estiver selecionada
      if (!isFeatureSelected) {
        selectFeatures([feature.id], 'replace');
      }
      onEdit(feature);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!feature) return;

    setIsDeleting(true);
    try {
      await deleteManyFeatures.mutateAsync([feature.id]);
    } catch (error) {
      console.error('Erro ao deletar feature:', error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFeatureIds.length === 0) return;

    setIsDeleting(true);
    try {
      await deleteManyFeatures.mutateAsync(selectedFeatureIds);
    } catch (error) {
      console.error('Erro ao deletar features:', error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const handleDuplicate = async () => {
    if (!feature) return;

    setIsDuplicating(true);
    try {
      await duplicateSelected(feature.properties.layerId);
    } catch (error) {
      console.error('Erro ao duplicar feature:', error);
    } finally {
      setIsDuplicating(false);
      onClose();
    }
  };

  const handleTransfer = () => {
    if (feature) {
      // Selecionar a feature se não estiver selecionada
      if (!isFeatureSelected) {
        selectFeatures([feature.id], 'replace');
      }
      featureTransfer.openTransferDialog([feature.id]);
    }
    onClose();
  };

  const handleTransferSelected = () => {
    featureTransfer.openTransferDialog();
    onClose();
  };

  const handleZoomTo = () => {
    if (feature && onZoomTo) {
      onZoomTo(feature);
    }
    onClose();
  };

  const handleShowInfo = () => {
    if (feature && onShowInfo) {
      onShowInfo(feature);
    }
    onClose();
  };

  if (!feature) return null;

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          minWidth: 200,
          maxWidth: 280,
          '& .MuiMenuItem-root': {
            borderRadius: 1,
            my: 0.5,
            mx: 1,
          },
        },
      }}
    >
      {/* Cabeçalho com informações da feature */}
      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          {getGeometryIcon(feature.geometry.type)}
          <Typography variant="subtitle2" noWrap>
            {feature.properties.name || `Feature ${feature.id.slice(0, 8)}`}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            size="small"
            label={layer?.name || 'Sem camada'}
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label={feature.geometry.type}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

      {/* Seleção */}
      {!isFeatureSelected && (
        <MenuItem onClick={handleSelect}>
          <ListItemIcon>
            <ViewIcon />
          </ListItemIcon>
          <ListItemText primary="Selecionar" />
        </MenuItem>
      )}

      {!isFeatureSelected && hasMultipleSelection && (
        <MenuItem onClick={handleAddToSelection}>
          <ListItemIcon>
            <ViewIcon />
          </ListItemIcon>
          <ListItemText primary="Adicionar à Seleção" />
        </MenuItem>
      )}

      {/* Ações principais */}
      <MenuItem onClick={handleEdit} disabled={!onEdit}>
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary="Editar" secondary="E" />
      </MenuItem>

      <MenuItem onClick={handleZoomTo} disabled={!onZoomTo}>
        <ListItemIcon>
          <ZoomIcon />
        </ListItemIcon>
        <ListItemText primary="Zoom para Feature" secondary="Z" />
      </MenuItem>

      <MenuItem onClick={handleShowInfo} disabled={!onShowInfo}>
        <ListItemIcon>
          <InfoIcon />
        </ListItemIcon>
        <ListItemText primary="Informações" secondary="I" />
      </MenuItem>

      <Divider />

      {/* Operações */}
      <MenuItem onClick={handleDuplicate} disabled={isDuplicating}>
        <ListItemIcon>
          <CopyIcon />
        </ListItemIcon>
        <ListItemText primary={isDuplicating ? 'Duplicando...' : 'Duplicar'} secondary="Ctrl+D" />
      </MenuItem>

      <MenuItem onClick={handleTransfer}>
        <ListItemIcon>
          <TransferIcon />
        </ListItemIcon>
        <ListItemText primary="Transferir para Camada" secondary="T" />
      </MenuItem>

      {/* Ações em lote se há seleção múltipla */}
      {hasMultipleSelection && isFeatureSelected && (
        <>
          <Divider />
          <MenuItem onClick={handleTransferSelected}>
            <ListItemIcon>
              <TransferIcon />
            </ListItemIcon>
            <ListItemText
              primary={`Transferir ${selectedFeatureIds.length} Features`}
              secondary="Shift+T"
            />
          </MenuItem>
          <MenuItem
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary={
                isDeleting ? 'Deletando...' : `Deletar ${selectedFeatureIds.length} Features`
              }
              secondary="Shift+Del"
            />
          </MenuItem>
        </>
      )}

      {/* Deletar feature individual */}
      <Divider />
      <MenuItem onClick={handleDelete} disabled={isDeleting} sx={{ color: 'error.main' }}>
        <ListItemIcon>
          <DeleteIcon color="error" />
        </ListItemIcon>
        <ListItemText primary={isDeleting ? 'Deletando...' : 'Deletar'} secondary="Del" />
      </MenuItem>
    </Menu>
  );
};
