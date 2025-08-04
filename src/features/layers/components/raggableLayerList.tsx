// Path: features\layers\components\raggableLayerList.tsx

import React, { useState, useRef, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  IconButton,
  Box,
  Tooltip,
  Chip,
  Switch,
  Slider,
  Typography,
  FormControlLabel,
  Badge,
  Paper,
  Fade,
  Zoom,
} from '@mui/material';
import {
  DragHandle as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MoreVert as MoreIcon,
  TableChart as TableIcon,
  SwapHoriz as TransferIcon,
  Place as PointIcon,
  Timeline as LineIcon,
  Polygon as PolygonIcon,
  TextFields as TextIcon,
} from '@mui/icons-material';

import { LayerConfig } from '../../data-access/schemas/layer.schema';
import {
  useReorderLayers,
  useToggleLayerVisibility,
  useUpdateLayerOpacity,
} from '../../data-access/hooks/useLayers';

interface DragState {
  isDragging: boolean;
  draggedItemId: string | null;
  dragOverItemId: string | null;
  dropPosition: 'before' | 'after' | null;
}

interface LayerStats {
  layerId: string;
  featureCount: number;
  geometryTypes: Record<string, number>;
}

interface DraggableLayerListProps {
  layers: LayerConfig[];
  layerStats: LayerStats[];
  onLayerMenuOpen: (event: React.MouseEvent<HTMLElement>, layerId: string) => void;
  onTransferLayerFeatures: (layerId: string) => void;
  onOpenAttributeTable: (layerId: string) => void;
  className?: string;
}

export const DraggableLayerList: React.FC<DraggableLayerListProps> = ({
  layers,
  layerStats,
  onLayerMenuOpen,
  onTransferLayerFeatures,
  onOpenAttributeTable,
  className,
}) => {
  // Estados para drag & drop
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItemId: null,
    dragOverItemId: null,
    dropPosition: null,
  });

  // Hooks
  const reorderLayers = useReorderLayers();
  const toggleVisibility = useToggleLayerVisibility();
  const updateOpacity = useUpdateLayerOpacity();

  // Refs para elementos
  const dragItemRef = useRef<HTMLLIElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Obter estatísticas de uma camada
  const getLayerStats = useCallback(
    (layerId: string): LayerStats => {
      return (
        layerStats.find(s => s.layerId === layerId) || {
          layerId,
          featureCount: 0,
          geometryTypes: {},
        }
      );
    },
    [layerStats]
  );

  // Ícones por tipo de geometria
  const getGeometryIcon = useCallback((type: string) => {
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
  }, []);

  // Handlers para drag & drop
  const handleDragStart = useCallback((e: React.DragEvent<HTMLLIElement>, layerId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', layerId);

    // Criar imagem de drag customizada
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(2deg)';
    dragImage.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';

    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 20, 20);

    setTimeout(() => document.body.removeChild(dragImage), 0);

    setDragState({
      isDragging: true,
      draggedItemId: layerId,
      dragOverItemId: null,
      dropPosition: null,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItemId: null,
      dragOverItemId: null,
      dropPosition: null,
    });
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLLIElement>, layerId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (dragState.draggedItemId === layerId) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;
      const dropPosition = y < height / 2 ? 'before' : 'after';

      setDragState(prev => ({
        ...prev,
        dragOverItemId: layerId,
        dropPosition,
      }));
    },
    [dragState.draggedItemId]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLIElement>) => {
    // Verificar se realmente saiu do elemento
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dragOverItemId: null,
        dropPosition: null,
      }));
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLLIElement>, targetLayerId: string) => {
      e.preventDefault();

      const draggedLayerId = e.dataTransfer.getData('text/plain');
      if (!draggedLayerId || draggedLayerId === targetLayerId) {
        setDragState({
          isDragging: false,
          draggedItemId: null,
          dragOverItemId: null,
          dropPosition: null,
        });
        return;
      }

      try {
        // Calcular nova ordem
        const currentOrder = layers.map(l => l.id);
        const draggedIndex = currentOrder.indexOf(draggedLayerId);
        const targetIndex = currentOrder.indexOf(targetLayerId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Remover item da posição atual
        const newOrder = [...currentOrder];
        newOrder.splice(draggedIndex, 1);

        // Inserir na nova posição
        let insertIndex = targetIndex;
        if (draggedIndex < targetIndex) {
          insertIndex -= 1; // Ajustar devido à remoção
        }

        if (dragState.dropPosition === 'after') {
          insertIndex += 1;
        }

        newOrder.splice(insertIndex, 0, draggedLayerId);

        // Aplicar reordenação
        await reorderLayers.mutateAsync(newOrder);
      } catch (error) {
        console.error('Erro ao reordenar camadas:', error);
      } finally {
        setDragState({
          isDragging: false,
          draggedItemId: null,
          dragOverItemId: null,
          dropPosition: null,
        });
      }
    },
    [layers, dragState.dropPosition, reorderLayers]
  );

  // Handler para alternar visibilidade
  const handleToggleVisibility = useCallback(
    async (layerId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      try {
        await toggleVisibility.mutateAsync(layerId);
      } catch (error) {
        console.error('Erro ao alternar visibilidade:', error);
      }
    },
    [toggleVisibility]
  );

  // Handler para alterar opacidade
  const handleOpacityChange = useCallback(
    async (layerId: string, opacity: number) => {
      try {
        await updateOpacity.mutateAsync({ id: layerId, opacity });
      } catch (error) {
        console.error('Erro ao alterar opacidade:', error);
      }
    },
    [updateOpacity]
  );

  // Estilo do indicador de drop
  const getDropIndicatorStyle = (layerId: string) => {
    if (dragState.dragOverItemId !== layerId || !dragState.dropPosition) {
      return {};
    }

    const baseStyle = {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: '#1976d2',
      borderRadius: '1px',
      zIndex: 1000,
      boxShadow: '0 0 4px rgba(25, 118, 210, 0.5)',
    };

    return dragState.dropPosition === 'before'
      ? { ...baseStyle, top: -1 }
      : { ...baseStyle, bottom: -1 };
  };

  return (
    <List ref={listRef} dense className={className}>
      {layers.map((layer, index) => {
        const stats = getLayerStats(layer.id);
        const isDraggedItem = dragState.draggedItemId === layer.id;
        const isDropTarget = dragState.dragOverItemId === layer.id;

        return (
          <Fade key={layer.id} in={true} timeout={300 + index * 50}>
            <Paper
              elevation={isDraggedItem ? 8 : isDropTarget ? 4 : 1}
              sx={{
                mb: 1,
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
                opacity: isDraggedItem ? 0.5 : 1,
                transform: isDraggedItem ? 'rotate(2deg) scale(1.02)' : 'none',
                bgcolor: isDropTarget ? 'action.hover' : 'background.paper',
                '&:hover': {
                  elevation: 3,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {/* Indicador de drop */}
              {isDropTarget && <Box sx={getDropIndicatorStyle(layer.id)} />}

              <ListItem
                ref={isDraggedItem ? dragItemRef : null}
                draggable
                onDragStart={e => handleDragStart(e, layer.id)}
                onDragEnd={handleDragEnd}
                onDragOver={e => handleDragOver(e, layer.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, layer.id)}
                sx={{
                  cursor: dragState.isDragging ? 'grabbing' : 'grab',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.2s ease-in-out',
                }}
              >
                <ListItemIcon>
                  <Tooltip title="Arrastar para reordenar">
                    <DragIcon
                      sx={{
                        cursor: 'grab',
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' },
                        '&:active': { cursor: 'grabbing' },
                      }}
                    />
                  </Tooltip>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {layer.name}
                      </Typography>
                      <Zoom in={stats.featureCount > 0} timeout={200}>
                        <Badge badgeContent={stats.featureCount} color="primary" max={999}>
                          <Chip
                            size="small"
                            label="Features"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Badge>
                      </Zoom>
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      {/* Controles de visibilidade e opacidade */}
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={layer.visible}
                              onChange={e => handleToggleVisibility(layer.id, e)}
                              size="small"
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="caption">
                              {layer.visible ? 'Visível' : 'Oculta'}
                            </Typography>
                          }
                          sx={{ margin: 0, minWidth: 80 }}
                        />
                        <Box flex={1}>
                          <Typography variant="caption" color="textSecondary">
                            Opacidade: {Math.round(layer.opacity * 100)}%
                          </Typography>
                          <Slider
                            value={layer.opacity}
                            onChange={(_, value) => handleOpacityChange(layer.id, value as number)}
                            min={0}
                            max={1}
                            step={0.1}
                            size="small"
                            sx={{
                              mt: 0.5,
                              '& .MuiSlider-thumb': {
                                transition: 'box-shadow 0.2s ease-in-out',
                              },
                              '& .MuiSlider-thumb:hover': {
                                boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                              },
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Tipos de geometria */}
                      {Object.keys(stats.geometryTypes).length > 0 && (
                        <Fade in={true} timeout={400}>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {Object.entries(stats.geometryTypes).map(([type, count]) => (
                              <Chip
                                key={type}
                                icon={getGeometryIcon(type)}
                                label={`${count}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 20,
                                  '& .MuiChip-icon': { fontSize: '0.8rem' },
                                }}
                              />
                            ))}
                          </Box>
                        </Fade>
                      )}
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Tooltip title="Tabela de Atributos">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onOpenAttributeTable(layer.id)}
                          disabled={stats.featureCount === 0}
                          sx={{
                            transition: 'all 0.2s ease-in-out',
                            '&:hover:not(:disabled)': {
                              transform: 'scale(1.1)',
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                            },
                          }}
                        >
                          <TableIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Transferir Features">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onTransferLayerFeatures(layer.id)}
                          disabled={stats.featureCount === 0}
                          sx={{
                            transition: 'all 0.2s ease-in-out',
                            '&:hover:not(:disabled)': {
                              transform: 'scale(1.1)',
                              bgcolor: 'secondary.main',
                              color: 'secondary.contrastText',
                            },
                          }}
                        >
                          <TransferIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Mais opções">
                      <IconButton
                        size="small"
                        onClick={e => onLayerMenuOpen(e, layer.id)}
                        sx={{
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            bgcolor: 'action.selected',
                          },
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          </Fade>
        );
      })}

      {/* Overlay para feedback durante drag */}
      {dragState.isDragging && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            zIndex: 999,
            pointerEvents: 'none',
          }}
        />
      )}
    </List>
  );
};
