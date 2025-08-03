// Path: features\drawing\components\DrawingToolbar.tsx

import React, { useState } from 'react';
import {
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
  Divider,
  Box,
  Menu,
  MenuItem,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  PanTool as SelectIcon,
  Place as PointIcon,
  Timeline as LineIcon,
  Polygon as PolygonIcon,
  TextFields as TextIcon,
  Shield as MilitaryIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from '@mui/icons-material';

import { useDrawingStore, useDrawingActions } from '../store/drawing.store';
import { useFeatureSelection } from '../../selection/hooks/useFeatureSelection';
import { DrawingTool } from '../../../types/feature.types';

interface DrawingToolbarProps {
  className?: string;
  onLayerSelect?: () => void;
  activeLayerName?: string;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  className,
  onLayerSelect,
  activeLayerName,
}) => {
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);

  // Store state
  const {
    activeTool,
    isDrawing,
    snapSettings,
    temporaryStyle,
    activeLayerId,
  } = useDrawingStore();

  // Store actions
  const {
    setActiveTool,
    updateSnapSettings,
    toggleSnap,
    updateTemporaryStyle,
    reset,
  } = useDrawingActions();

  // Selection
  const {
    selectedFeatureIds,
    deleteSelected,
    duplicateSelected,
    clearSelection,
    isDeleting,
    isDuplicating,
  } = useFeatureSelection();

  // Definir ferramentas disponíveis
  const tools: Array<{
    id: DrawingTool;
    icon: React.ReactElement;
    label: string;
    description: string;
    shortcut?: string;
  }> = [
    {
      id: 'select',
      icon: <SelectIcon />,
      label: 'Selecionar',
      description: 'Selecionar e editar features',
      shortcut: 'S',
    },
    {
      id: 'point',
      icon: <PointIcon />,
      label: 'Ponto',
      description: 'Criar pontos no mapa',
      shortcut: 'P',
    },
    {
      id: 'line',
      icon: <LineIcon />,
      label: 'Linha',
      description: 'Desenhar linhas e polilinhas',
      shortcut: 'L',
    },
  ];

  // Handler para mudança de ferramenta
  const handleToolChange = (
    event: React.MouseEvent<HTMLElement>,
    newTool: DrawingTool | null,
  ) => {
    if (newTool !== null) {
      setActiveTool(newTool);
    }
  };

  // Handler para configurações
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  // Handler para deletar selecionadas
  const handleDeleteSelected = async () => {
    if (selectedFeatureIds.length > 0) {
      const confirmed = window.confirm(
        `Deletar ${selectedFeatureIds.length} feature(s) selecionada(s)?`
      );
      if (confirmed) {
        await deleteSelected();
      }
    }
  };

  // Handler para duplicar selecionadas
  const handleDuplicateSelected = async () => {
    if (selectedFeatureIds.length > 0) {
      await duplicateSelected();
    }
  };

  // Handler para limpar seleção
  const handleClearSelection = () => {
    clearSelection();
  };

  return (
    <Paper
      className={`drawing-toolbar ${className || ''}`}
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1,
        minWidth: 60,
        maxWidth: 300,
      }}
    >
      {/* Informações da camada ativa */}
      {activeLayerName && (
        <Box sx={{ px: 1, py: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Camada Ativa:
          </Typography>
          <Chip
            label={activeLayerName}
            size="small"
            variant="outlined"
            onClick={onLayerSelect}
            sx={{ ml: 0.5, fontSize: '0.7rem' }}
          />
        </Box>
      )}

      {/* Ferramentas principais */}
      <ToggleButtonGroup
        orientation="vertical"
        value={activeTool}
        exclusive
        onChange={handleToolChange}
        size="small"
        sx={{ '& .MuiToggleButton-root': { minWidth: 48, minHeight: 48 } }}
      >
        {tools.map((tool) => (
          <ToggleButton
            key={tool.id}
            value={tool.id}
            disabled={tool.id !== 'select' && !activeLayerId}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            }}
          >
            <Tooltip
              title={
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {tool.label}
                  </Typography>
                  <Typography variant="caption">{tool.description}</Typography>
                  {tool.shortcut && (
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                      Atalho: {tool.shortcut}
                    </Typography>
                  )}
                </Box>
              }
              placement="right"
              arrow
            >
              {tool.icon}
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Divider />

      {/* Ações de seleção */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {selectedFeatureIds.length > 0 && (
          <Typography variant="caption" color="primary" sx={{ px: 1 }}>
            {selectedFeatureIds.length} selecionada(s)
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Duplicar selecionadas">
            <span>
              <IconButton
                size="small"
                onClick={handleDuplicateSelected}
                disabled={selectedFeatureIds.length === 0 || isDuplicating}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Deletar selecionadas">
            <span>
              <IconButton
                size="small"
                onClick={handleDeleteSelected}
                disabled={selectedFeatureIds.length === 0 || isDeleting}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      {/* Configurações */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tooltip title="Configurações">
          <IconButton size="small" onClick={handleSettingsClick}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Menu de configurações */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={handleSettingsClose}
        PaperProps={{
          sx: { minWidth: 250 },
        }}
      >
        <MenuItem>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Configurações de Snap
          </Typography>
        </MenuItem>

        <MenuItem sx={{ py: 0 }}>
          <FormControlLabel
            control={
              <Switch
                checked={snapSettings.enabled}
                onChange={(e) => updateSnapSettings({ enabled: e.target.checked })}
                size="small"
              />
            }
            label="Ativar Snap"
            sx={{ width: '100%' }}
          />
        </MenuItem>

        <MenuItem sx={{ py: 0 }}>
          <FormControlLabel
            control={
              <Switch
                checked={snapSettings.snapToVertices}
                onChange={(e) => updateSnapSettings({ snapToVertices: e.target.checked })}
                disabled={!snapSettings.enabled}
                size="small"
              />
            }
            label="Snap em Vértices"
            sx={{ width: '100%' }}
          />
        </MenuItem>

        <MenuItem sx={{ py: 0 }}>
          <FormControlLabel
            control={
              <Switch
                checked={snapSettings.snapToEdges}
                onChange={(e) => updateSnapSettings({ snapToEdges: e.target.checked })}
                disabled={!snapSettings.enabled}
                size="small"
              />
            }
            label="Snap em Bordas"
            sx={{ width: '100%' }}
          />
        </MenuItem>

        <Divider />

        <MenuItem>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Estilo Temporário
          </Typography>
        </MenuItem>

        <MenuItem sx={{ py: 0 }}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="caption">Cor do Traço</Typography>
            <input
              type="color"
              value={temporaryStyle.strokeColor}
              onChange={(e) => updateTemporaryStyle({ strokeColor: e.target.value })}
              style={{ width: '100%', height: 30, border: 'none', borderRadius: 4 }}
            />
          </Box>
        </MenuItem>

        <MenuItem sx={{ py: 0 }}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="caption">Cor de Preenchimento</Typography>
            <input
              type="color"
              value={temporaryStyle.fillColor}
              onChange={(e) => updateTemporaryStyle({ fillColor: e.target.value })}
              style={{ width: '100%', height: 30, border: 'none', borderRadius: 4 }}
            />
          </Box>
        </MenuItem>
      </Menu>

      {/* Indicador de estado */}
      {isDrawing && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: 'success.main',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}
    </Paper>
  );
};