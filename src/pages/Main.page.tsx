// Path: pages\Main.page.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Typography, useTheme, Snackbar, Alert } from '@mui/material';
import { ExtendedFeature } from '../features/data-access/schemas/feature.schema';
import { useMapInstance } from '../features/core-map/hooks/useMapInstance';
import { useCreateFeature, useUpdateFeature } from '../features/data-access/hooks/useMutateFeature';
import { useDrawingStore } from '../features/drawing/store/drawing.store';

// Tipos para Position e coordenadas
type Position = [number, number] | [number, number, number];

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

// Interface placeholder para DrawingManager
interface DrawingManager {
  destroy: () => void;
  enable: () => void;
  setActiveTool: (tool: string) => void;
  activeToolType: string;
  enabled: boolean;
}

// Interface placeholder para HotSource
interface HotSource {
  destroy: () => void;
}

// Callbacks para HotSource
interface HotSourceCallbacks {
  onFeatureUpdated: (feature: ExtendedFeature) => void;
  onVertexMoved: (featureId: string, vertexIndex: number, newPosition: Position) => void;
  onVertexAdded: (featureId: string, vertexIndex: number, position: Position) => void;
  onVertexRemoved: (featureId: string, vertexIndex: number) => void;
  onError: (error: string) => void;
}

// Callbacks para DrawingManager
interface DrawingManagerCallbacks {
  onFeatureCreated: (feature: ExtendedFeature) => void;
  onFeatureUpdated: (feature: ExtendedFeature) => void;
  onFeatureDeleted: (featureId: string) => void;
  onToolChanged: (tool: string) => void;
  onStatusChange: (status: string) => void;
}

// Placeholder para hooks não implementados
const useFeatureSelection = () => ({
  selectedFeatures: [],
  hasSelection: false,
  hasSingleSelection: false,
  selectionStats: { total: 0 },
  selectAtPoint: () => {},
  selectById: () => {},
  handleMouseEnter: () => {},
  handleMouseLeave: () => {},
  startEditing: () => {},
  stopEditing: () => {},
  clearSelection: () => {},
  selectFeature: () => {},
  deselectFeature: () => {},
  toggleFeature: () => {},
});

const useFeatureTransfer = () => ({
  transferFeatures: async () => {},
});

const useKeyboardShortcuts = (options: { enabled: boolean; excludeInputs: boolean }) => {
  // Placeholder para keyboard shortcuts
};

// Placeholder para criar DrawingManager
const createDrawingManager = (
  map: any,
  hotSource: HotSource,
  callbacks: DrawingManagerCallbacks,
  config: any
): DrawingManager => ({
  destroy: () => {},
  enable: () => {},
  setActiveTool: () => {},
  activeToolType: 'select',
  enabled: true,
});

// Placeholder para HotSource
class HotSourceImpl implements HotSource {
  constructor(map: any, callbacks: HotSourceCallbacks) {
    // Implementação placeholder
  }

  destroy(): void {
    // Cleanup
  }
}

export const MainPage: React.FC = () => {
  const theme = useTheme();

  // Estado de notificação
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Estado de drag global
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    featureId: null,
    startTime: null,
  });

  // Estados do sistema de desenho
  const [drawingManager, setDrawingManager] = useState<DrawingManager | null>(null);
  const [hotSource, setHotSource] = useState<HotSource | null>(null);

  // Hooks do mapa
  const { map, isMapLoaded } = useMapInstance();

  // Hooks de seleção (placeholder)
  const {
    selectedFeatures,
    hasSelection,
    hasSingleSelection,
    selectionStats,
    clearSelection,
    selectFeature,
    deselectFeature,
  } = useFeatureSelection();

  // Hook de transferência (placeholder)
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
      console.log(`Vértice ${vertexIndex} da feature ${featureId} movido para [${newPosition[0]}, ${newPosition[1]}]`);
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
        showNotification('Feature atualizada', 'success');
      } catch (error) {
        showNotification('Erro ao atualizar feature', 'error');
        console.error('Erro ao atualizar feature:', error);
      }
    },
    onFeatureDeleted: (featureId: string) => {
      showNotification('Feature deletada', 'info');
      console.log(`Feature ${featureId} deletada`);
    },
    onToolChanged: (tool: string) => {
      setActiveTool(tool as any);
      console.log(`Ferramenta alterada para: ${tool}`);
    },
    onStatusChange: (status: string) => {
      // Pode ser usado para mostrar status na UI
      console.log(`Status: ${status}`);
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
      try {
        // Criar HotSource primeiro
        const hotSourceInstance = new HotSourceImpl(map, hotSourceCallbacks);

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

        console.log('Sistema de desenho inicializado');
      } catch (error) {
        console.error('Erro ao inicializar sistema de desenho:', error);
        showNotification('Erro ao inicializar sistema de desenho', 'error');
      }
    }

    // Cleanup
    return () => {
      if (drawingManager) {
        try {
          drawingManager.destroy();
        } catch (error) {
          console.error('Erro ao destruir DrawingManager:', error);
        }
      }
      if (hotSource) {
        try {
          hotSource.destroy();
        } catch (error) {
          console.error('Erro ao destruir HotSource:', error);
        }
      }
    };
  }, [isMapLoaded, map]); // Removido dependências desnecessárias

  // Sincronizar ferramenta ativa com o store
  useEffect(() => {
    if (drawingManager && activeTool && drawingManager.activeToolType !== activeTool) {
      try {
        drawingManager.setActiveTool(activeTool);
      } catch (error) {
        console.error('Erro ao alterar ferramenta ativa:', error);
      }
    }
  }, [drawingManager, activeTool]);

  // Handler para fechar notificação
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handler para iniciar drag
  const handleDragStart = useCallback((featureId: string) => {
    setDragState({
      isDragging: true,
      featureId,
      startTime: Date.now(),
    });
  }, []);

  // Handler para finalizar drag
  const handleDragEnd = useCallback(async (featureId: string, feature: ExtendedFeature) => {
    try {
      await updateFeature.mutateAsync({
        id: featureId,
        updates: feature,
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
  }, [dragState.startTime, updateFeature, showNotification]);

  // Renderização condicional para estado de carregamento
  if (!isMapLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" color="text.secondary">
          Carregando mapa...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Container principal do mapa */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Área do mapa */}
        <Box
          id="map-container"
          sx={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#f5f5f5',
          }}
        />

        {/* Indicador de drag ativo */}
        {dragState.isDragging && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: theme.palette.info.main,
              color: 'white',
              padding: 1,
              borderRadius: 1,
              zIndex: 1000,
            }}
          >
            <Typography variant="caption">
              Movendo feature: {dragState.featureId}
            </Typography>
          </Box>
        )}

        {/* Informações de seleção */}
        {hasSelection && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: 2,
              borderRadius: 1,
              zIndex: 1000,
            }}
          >
            <Typography variant="caption">
              Selecionadas: {selectionStats.total} feature(s)
            </Typography>
          </Box>
        )}
      </Box>

      {/* Sistema de notificações */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};