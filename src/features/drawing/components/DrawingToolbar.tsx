// Path: features\drawing\components\DrawingToolbar.tsx
import React from 'react';
import {
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
  Divider,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  PanTool as SelectIcon,
  Place as PointIcon,
  Timeline as LineIcon,
  Polygon as PolygonIcon,
  TextFields as TextIcon,
  Shield as MilitaryIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from '@mui/icons-material';

import { useDrawingStore, useDrawingActions } from '../store/drawing.store';
import { useFeatureSelection } from '../../selection/hooks/useFeatureSelection';
import { useUndoRedo } from '../../transaction-history/hooks/useUndoRedo';
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
  // Store state
  const { activeTool, isDrawing, activeLayerId } = useDrawingStore();

  // Store actions
  const { setActiveTool } = useDrawingActions();

  // Selection
  const {
    selectedFeatureIds,
    deleteSelected,
    duplicateSelected,
    clearSelection,
    isDeleting,
    isDuplicating,
  } = useFeatureSelection();

  // Undo/Redo
  const { canUndo, canRedo, undo, redo, isProcessing: isUndoRedoProcessing } = useUndoRedo();

  // Definir ferramentas básicas
  const tools: Array<{
    id: DrawingTool;
    icon: React.ReactElement;
    label: string;
    disabled?: boolean;
  }> = [
    {
      id: 'select',
      icon: <SelectIcon />,
      label: 'Selecionar',
    },
    {
      id: 'point',
      icon: <PointIcon />,
      label: 'Ponto',
      disabled: !activeLayerId,
    },
    {
      id: 'line',
      icon: <LineIcon />,
      label: 'Linha',
      disabled: !activeLayerId,
    },
    {
      id: 'polygon',
      icon: <PolygonIcon />,
      label: 'Polígono',
      disabled: !activeLayerId,
    },
    {
      id: 'text',
      icon: <TextIcon />,
      label: 'Texto',
      disabled: !activeLayerId,
    },
    {
      id: 'military-symbol',
      icon: <MilitaryIcon />,
      label: 'Símbolo Militar',
      disabled: !activeLayerId,
    },
  ];

  // Handlers
  const handleToolChange = (event: React.MouseEvent<HTMLElement>, newTool: DrawingTool | null) => {
    if (newTool !== null && !isDrawing) {
      setActiveTool(newTool);
    }
  };

  const handleUndo = async () => {
    if (canUndo && !isUndoRedoProcessing) {
      await undo();
    }
  };

  const handleRedo = async () => {
    if (canRedo && !isUndoRedoProcessing) {
      await redo();
    }
  };

  const handleDelete = async () => {
    if (selectedFeatureIds.length > 0 && !isDeleting) {
      await deleteSelected();
    }
  };

  const handleCopy = async () => {
    if (selectedFeatureIds.length > 0 && !isDuplicating) {
      await duplicateSelected();
    }
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  return (
    <Paper
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        flexWrap: 'wrap',
      }}
    >
      {/* Indicador de camada ativa */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          Camada:
        </Typography>
        {activeLayerName ? (
          <Tooltip title="Clique para trocar de camada">
            <Chip
              label={activeLayerName}
              size="small"
              clickable
              onClick={onLayerSelect}
              sx={{ maxWidth: 120 }}
            />
          </Tooltip>
        ) : (
          <Tooltip title="Selecione uma camada para desenhar">
            <Chip label="Nenhuma" size="small" color="warning" clickable onClick={onLayerSelect} />
          </Tooltip>
        )}
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Ferramentas de desenho */}
      <ToggleButtonGroup
        value={activeTool}
        exclusive
        onChange={handleToolChange}
        size="small"
        disabled={isDrawing}
      >
        {tools.map(tool => (
          <ToggleButton key={tool.id} value={tool.id} disabled={tool.disabled} sx={{ px: 2 }}>
            <Tooltip title={tool.label}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tool.icon}
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {tool.label}
                </Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      {/* Ações de seleção */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Desfazer">
          <span>
            <IconButton
              size="small"
              onClick={handleUndo}
              disabled={!canUndo || isUndoRedoProcessing}
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Refazer">
          <span>
            <IconButton
              size="small"
              onClick={handleRedo}
              disabled={!canRedo || isUndoRedoProcessing}
            >
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Deletar selecionados">
          <span>
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={selectedFeatureIds.length === 0 || isDeleting}
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Duplicar selecionados">
          <span>
            <IconButton
              size="small"
              onClick={handleCopy}
              disabled={selectedFeatureIds.length === 0 || isDuplicating}
            >
              <CopyIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Indicador de seleção */}
      {selectedFeatureIds.length > 0 && (
        <>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${selectedFeatureIds.length} selecionado${selectedFeatureIds.length > 1 ? 's' : ''}`}
              size="small"
              color="primary"
              onDelete={handleClearSelection}
            />
          </Box>
        </>
      )}

      {/* Indicador de modo de desenho */}
      {isDrawing && (
        <>
          <Divider orientation="vertical" flexItem />
          <Chip label="Desenhando..." size="small" color="success" variant="outlined" />
        </>
      )}
    </Paper>
  );
};
