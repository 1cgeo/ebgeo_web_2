// Path: pages\Main.page.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import {
  createDrawingManager,
  DrawingManagerCallbacks,
} from '../features/drawing/lib/DrawingManager';
import { HotSource, HotSourceCallbacks } from '../features/drawing/lib/HotSource';
import { ExtendedFeature } from '../features/data-access/schemas/feature.schema';
import { useMapInstance } from '../features/core-map/hooks/useMapInstance';
import { useFeatureSelection } from '../features/selection/hooks/useFeatureSelection';
import { useCreateFeature, useUpdateFeature } from '../features/data-access/hooks/useMutateFeature';
import { useDrawingStore } from '../features/drawing/store/drawing.store';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useFeatureTransfer } from '../features/layers/hooks/useFeatureTransfer';

// Interface para notificações
interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Interface para estado de drag
interface DragState {
  isDragging: boolean;
  featureId: string | null;
  startTime: number | null;
}

export const MainPage: React.FC = () => {
  const theme = useTheme();

  // Estados locais da UI
  const [layerManagerOpen, setLayerManagerOpen] = useState(false);
  const [mapSwitcherOpen, setMapSwitcherOpen] = useState(false);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false);
  const [attributeTableOpen, setAttributeTableOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedLayerForTable, setSelectedLayerForTable] = useState<string>('');
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Estados do context menu
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    anchorPosition: { top: number; left: number } | null;
    feature: ExtendedFeature | null;
  }>({
    open: false,
    anchorPosition: null,
    feature: null,
  });

  // Estado de drag global
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    featureId: null,
    startTime: null,
  });

  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Estados do sistema de desenho
  const [drawingManager, setDrawingManager] = useState<DrawingManager | null>(null);
  const [hotSource, setHotSource] = useState<HotSource | null>(null);

  // Hooks do mapa
  const { map, isMapLoaded } = useMapInstance();

  // Hooks de seleção
  const {
    selectedFeatures,
    hasSelection,
    hasSingleSelection,
    selectionStats,
    selectAtPoint,
    selectById,
    handleMouseEnter,
    handleMouseLeave,
    startEditing,
    stopEditing,
    clearSelection,
    selectFeature,
    deselectFeature,
    toggleFeature,
  } = useFeatureSelection();

  // Hook de transferência
  const featureTransfer = useFeatureTransfer();

  // Stores
  const { activeTool, setActiveTool } = useDrawingStore();

  // Mutations
  const createFeature = useCreateFeature();
  const updateFeature = useUpdateFeature();

  // Função para mostrar notificações
  const showNotification = useCallback(
    (message: string, severity: NotificationState['severity']) => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  // Callbacks do HotSource
  const hotSourceCallbacks: HotSourceCallbacks = {
    onFeatureUpdated: async (feature: ExtendedFeature) => {
      try {
        await updateFeature.mutateAsync({
          id: feature.id,
          updates: feature,
        });
        showNotification('Feature atualizada com sucesso', 'success');
      } catch (error) {
        showNotification('Erro ao atualizar feature', 'error');
        console.error('Erro ao atualizar feature:', error);
      }
    },
    onVertexMoved: (featureId: string, vertexIndex: number, newPosition: Position) => {
      // Vertex moved - pode ser usado para feedback em tempo real
      console.log(`Vértice ${vertexIndex} da feature ${featureId} movido para ${newPosition}`);
    },
    onVertexAdded: (featureId: string, vertexIndex: number, position: Position) => {
      console.log(`Vértice adicionado na posição ${vertexIndex} da feature ${featureId}`);
    },
    onVertexRemoved: (featureId: string, vertexIndex: number) => {
      console.log(`Vértice ${vertexIndex} removido da feature ${featureId}`);
    },
    onError: (error: string) => {
      showNotification(error, 'error');
    },
  };

  // Callbacks do DrawingManager
  const drawingManagerCallbacks: DrawingManagerCallbacks = {
    onFeatureCreated: async (feature: ExtendedFeature) => {
      try {
        await createFeature.mutateAsync(feature);
        showNotification('Feature criada com sucesso', 'success');
      } catch (error) {
        showNotification('Erro ao criar feature', 'error');
        console.error('Erro ao criar feature:', error);
      }
    },
    onFeatureUpdated: async (feature: ExtendedFeature) => {
      try {
        await updateFeature.mutateAsync({
          id: feature.id,
          updates: feature,
        });
        showNotification('Feature atualizada com sucesso', 'success');
      } catch (error) {
        showNotification('Erro ao atualizar feature', 'error');
        console.error('Erro ao atualizar feature:', error);
      }
    },
    onToolChanged: tool => {
      setActiveTool(tool);
      showNotification(`Ferramenta alterada para: ${tool}`, 'info');
    },
    onError: (error: string) => {
      showNotification(error, 'error');
    },
    onStatusChange: (status: string) => {
      console.log('Status:', status);
    },
    // Callbacks específicos para seleção e drag
    onFeatureSelected: (featureId: string, mode: 'single' | 'add' | 'toggle') => {
      switch (mode) {
        case 'single':
          selectFeature(featureId, 'single');
          break;
        case 'add':
          selectFeature(featureId, 'add');
          break;
        case 'toggle':
          toggleFeature(featureId);
          break;
      }
    },
    onFeaturesDeselected: () => {
      clearSelection();
    },
    onFeatureDragStart: (featureId: string) => {
      setDragState({
        isDragging: true,
        featureId,
        startTime: Date.now(),
      });
      showNotification('Iniciando arraste da feature...', 'info');
    },
    onFeatureDragEnd: async (featureId: string, finalGeometry: GeoJSON.Geometry) => {
      try {
        // Persistir a geometria final na ColdSource (IndexedDB)
        await updateFeature.mutateAsync({
          id: featureId,
          updates: { geometry: finalGeometry },
        });

        const duration = dragState.startTime ? Date.now() - dragState.startTime : 0;
        showNotification(`Feature movida com sucesso em ${duration}ms`, 'success');

        setDragState({
          isDragging: false,
          featureId: null,
          startTime: null,
        });
      } catch (error) {
        showNotification('Erro ao salvar posição da feature', 'error');
        console.error('Erro ao salvar drag:', error);
      }
    },
  };

  // Hook de shortcuts de teclado
  useKeyboardShortcuts({
    enabled: true,
    excludeInputs: true,
  });

  // Configuração do DrawingManager e HotSource
  useEffect(() => {
    if (isMapLoaded && map && !drawingManager && !hotSource) {
      // Criar HotSource primeiro
      const hotSourceInstance = new HotSource(map, hotSourceCallbacks);

      // Criar DrawingManager com o HotSource
      const manager = createDrawingManager(map, hotSourceInstance, drawingManagerCallbacks, {
        defaultTool: 'select', // Começar com ferramenta de seleção
        enableKeyboardShortcuts: true,
        toolConfig: {
          snapToVertices: true,
          snapToEdges: false,
          snapTolerance: 10,
          showCoordinates: true,
          allowUndo: true,
        },
      });

      // Habilitar o manager
      manager.enable();

      setDrawingManager(manager);
      setHotSource(hotSourceInstance);
    }

    // Cleanup
    return () => {
      if (drawingManager) {
        drawingManager.destroy();
      }
      if (hotSource) {
        hotSource.destroy();
      }
    };
  }, [isMapLoaded, map]);

  // Sincronizar ferramenta ativa com o store
  useEffect(() => {
    if (drawingManager && activeTool && drawingManager.activeToolType !== activeTool) {
      drawingManager.setActiveTool(activeTool);
    }
  }, [drawingManager, activeTool]);

  // Handlers para eventos
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleContextMenuClose = () => {
    setContextMenu({
      open: false,
      anchorPosition: null,
      feature: null,
    });
  };

  const handleFeatureRightClick = (event: React.MouseEvent, feature: ExtendedFeature) => {
    event.preventDefault();
    setContextMenu({
      open: true,
      anchorPosition: {
        top: event.clientY,
        left: event.clientX,
      },
      feature,
    });
  };

  // Render de loading
  if (!isMapLoaded) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <CircularProgress size={64} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Carregando aplicação...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          height: 64,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          zIndex: 1100,
        }}
      >
        <Typography variant="h6" component="h1">
          Sistema de Desenho Geoespacial
        </Typography>

        {/* Status de drag */}
        {dragState.isDragging && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} color="inherit" />
            <Typography variant="body2">Arrastando feature {dragState.featureId}...</Typography>
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 300,
            backgroundColor: theme.palette.background.paper,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Drawing Toolbar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" gutterBottom>
              Ferramentas de Desenho
            </Typography>

            {/* Tool selection buttons - implementar conforme necessário */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {/* Botões das ferramentas seriam renderizados aqui */}
            </Box>
          </Box>

          {/* Selection Info */}
          {hasSelection && (
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" gutterBottom>
                Seleção ({selectionStats.count} features)
              </Typography>

              {hasSingleSelection && (
                <Typography variant="body2" color="text.secondary">
                  1 feature selecionada
                </Typography>
              )}

              {selectionStats.count > 1 && (
                <Typography variant="body2" color="text.secondary">
                  {selectionStats.count} features selecionadas
                </Typography>
              )}
            </Box>
          )}

          {/* Layer Manager seria aqui */}
          <Box sx={{ flex: 1, p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Camadas
            </Typography>
            {/* LayerManager component */}
          </Box>
        </Box>

        {/* Map Container */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {/* MapView component seria renderizado aqui */}
          <div id="map-container" style={{ width: '100%', height: '100%' }} />

          {/* Status overlay */}
          {dragState.isDragging && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: theme.palette.background.paper,
                p: 2,
                borderRadius: 1,
                boxShadow: 3,
                zIndex: 1000,
              }}
            >
              <Typography variant="body2">Arrastando feature {dragState.featureId}</Typography>
              <Typography variant="caption" color="text.secondary">
                Pressione ESC para cancelar
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Context Menu */}
      {contextMenu.open && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.anchorPosition?.top,
            left: contextMenu.anchorPosition?.left,
            zIndex: 1300,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4,
            boxShadow: theme.shadows[8],
            minWidth: 200,
          }}
          onMouseLeave={handleContextMenuClose}
        >
          {/* Context menu items */}
          <Box sx={{ p: 1 }}>
            <Typography variant="body2">Feature: {contextMenu.feature?.id}</Typography>
          </Box>
        </div>
      )}

      {/* Notification Snackbar */}
      {notification.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            backgroundColor:
              notification.severity === 'error'
                ? theme.palette.error.main
                : notification.severity === 'warning'
                  ? theme.palette.warning.main
                  : notification.severity === 'success'
                    ? theme.palette.success.main
                    : theme.palette.info.main,
            color: 'white',
            p: 2,
            borderRadius: 1,
            zIndex: 1300,
            maxWidth: 400,
          }}
          onClick={handleCloseNotification}
        >
          <Typography variant="body2">{notification.message}</Typography>
        </Box>
      )}
    </Box>
  );
};
