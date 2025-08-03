// Path: pages\Main.page.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { MapView } from '../features/core-map/components/MapView';
import { DrawingToolbar } from '../features/drawing/components/DrawingToolbar';
import { PropertiesPanel } from '../features/drawing/components/PropertiesPanel';
import { useMapInstance } from '../features/core-map/hooks/useMapInstance';
import { useFeatureSelection } from '../features/selection/hooks/useFeatureSelection';
import { useDrawingStore } from '../features/drawing/store/drawing.store';
import { useCreateFeature, useUpdateFeature } from '../features/data-access/hooks/useMutateFeature';
import { DrawingManager, createDrawingManager } from '../features/drawing/lib/DrawingManager';
import { HotSource } from '../features/drawing/lib/HotSource';
import { ExtendedFeature } from '../features/data-access/schemas/feature.schema';

export const MainPage: React.FC = () => {
  const theme = useTheme();
  
  // Estados locais
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false);
  const [drawingManager, setDrawingManager] = useState<DrawingManager | null>(null);
  const [hotSource, setHotSource] = useState<HotSource | null>(null);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [activeLayerName, setActiveLayerName] = useState<string>('');

  // Hooks
  const { map, isMapLoaded } = useMapInstance();
  const { 
    selectedFeatures, 
    hasSelection, 
    selectAtPoint, 
    handleMouseEnter, 
    handleMouseLeave,
    startEditing,
    stopEditing,
  } = useFeatureSelection();
  
  const { activeTool, setActiveLayerId: setStoreActiveLayerId } = useDrawingStore();
  const createFeature = useCreateFeature();
  const updateFeature = useUpdateFeature();

  // Inicializar Drawing Manager
  useEffect(() => {
    if (!map || !isMapLoaded || drawingManager) return;

    const manager = createDrawingManager(
      map,
      {
        defaultTool: 'select',
        enableKeyboardShortcuts: true,
        toolConfig: {
          snapToVertices: true,
          snapToEdges: false,
          snapTolerance: 10,
          showCoordinates: true,
          allowUndo: true,
        },
      },
      {
        onFeatureCreated: handleFeatureCreated,
        onFeatureUpdated: handleFeatureUpdated,
        onToolChanged: handleToolChanged,
        onError: handleError,
        onStatusChange: handleStatusChange,
      }
    );

    manager.enable();
    setDrawingManager(manager);

    return () => {
      manager.destroy();
    };
  }, [map, isMapLoaded]);

  // Inicializar Hot Source
  useEffect(() => {
    if (!map || !isMapLoaded || hotSource) return;

    const hot = new HotSource(
      map,
      {
        onFeatureUpdated: handleHotFeatureUpdated,
        onVertexMoved: handleVertexMoved,
        onVertexAdded: handleVertexAdded,
        onVertexRemoved: handleVertexRemoved,
        onError: handleError,
      },
      {
        enableVertexEdit: true,
        enableVertexAdd: true,
        enableVertexRemove: true,
        vertexRadius: 6,
        midpointRadius: 4,
        snapTolerance: 10,
      }
    );

    setHotSource(hot);

    return () => {
      hot.destroy();
    };
  }, [map, isMapLoaded]);

  // Atualizar camada ativa no Drawing Manager
  useEffect(() => {
    if (drawingManager && activeLayerId) {
      drawingManager.setActiveLayer(activeLayerId);
    }
  }, [drawingManager, activeLayerId]);

  // Atualizar store com camada ativa
  useEffect(() => {
    setStoreActiveLayerId(activeLayerId);
  }, [activeLayerId, setStoreActiveLayerId]);

  // Event handlers para Drawing Manager
  const handleFeatureCreated = useCallback(async (feature: ExtendedFeature) => {
    try {
      await createFeature.mutateAsync(feature);
      console.log('Feature criada com sucesso:', feature.id);
    } catch (error) {
      console.error('Erro ao salvar feature:', error);
      handleError('Erro ao salvar feature no banco de dados');
    }
  }, [createFeature]);

  const handleFeatureUpdated = useCallback(async (feature: ExtendedFeature) => {
    try {
      await updateFeature.mutateAsync({
        id: feature.id,
        updates: feature,
      });
      console.log('Feature atualizada com sucesso:', feature.id);
    } catch (error) {
      console.error('Erro ao atualizar feature:', error);
      handleError('Erro ao atualizar feature no banco de dados');
    }
  }, [updateFeature]);

  const handleToolChanged = useCallback((tool: string) => {
    console.log('Ferramenta alterada para:', tool);
    
    // Abrir painel de propriedades automaticamente ao selecionar
    if (tool === 'select' && hasSelection) {
      setPropertiesPanelOpen(true);
    }
  }, [hasSelection]);

  // Event handlers para Hot Source
  const handleHotFeatureUpdated = useCallback((feature: ExtendedFeature) => {
    // Feature foi modificada no hot source, salvar quando sair do modo de edição
    console.log('Feature modificada no hot source:', feature.id);
  }, []);

  const handleVertexMoved = useCallback((featureId: string, vertexIndex: number, newPosition: [number, number]) => {
    console.log(`Vértice ${vertexIndex} da feature ${featureId} movido para:`, newPosition);
  }, []);

  const handleVertexAdded = useCallback((featureId: string, vertexIndex: number, position: [number, number]) => {
    console.log(`Vértice adicionado na posição ${vertexIndex} da feature ${featureId}:`, position);
  }, []);

  const handleVertexRemoved = useCallback((featureId: string, vertexIndex: number) => {
    console.log(`Vértice ${vertexIndex} removido da feature ${featureId}`);
  }, []);

  // Handlers gerais
  const handleError = useCallback((error: string) => {
    console.error('Erro na aplicação:', error);
    // Aqui você pode mostrar uma notificação de erro
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    console.log('Status:', status);
    // Aqui você pode atualizar uma barra de status
  }, []);

  // Handler para cliques no mapa
  const handleMapClick = useCallback((e: any) => {
    const point = { x: e.point.x, y: e.point.y };
    
    if (activeTool === 'select') {
      const featureId = selectAtPoint(point, { 
        mode: e.originalEvent.ctrlKey ? 'add' : 'single' 
      });
      
      if (featureId) {
        setPropertiesPanelOpen(true);
      }
    }
  }, [activeTool, selectAtPoint]);

  // Handler para double click
  const handleMapDoubleClick = useCallback((e: any) => {
    if (activeTool === 'select') {
      const point = { x: e.point.x, y: e.point.y };
      const featureId = selectAtPoint(point);
      
      if (featureId && hotSource) {
        // Iniciar edição de vértices
        startEditing(featureId);
        hotSource.startEditingVertices(featureId);
      }
    }
  }, [activeTool, selectAtPoint, startEditing, hotSource]);

  // Configurar event listeners do mapa
  useEffect(() => {
    if (!map || !isMapLoaded) return;

    map.on('click', handleMapClick);
    map.on('dblclick', handleMapDoubleClick);

    return () => {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDoubleClick);
    };
  }, [map, isMapLoaded, handleMapClick, handleMapDoubleClick]);

  // Handler para seleção de camada
  const handleLayerSelect = useCallback(() => {
    // Por enquanto, criar uma camada padrão
    // Em uma implementação completa, isso abriria um dialog de seleção de camada
    const defaultLayerId = crypto.randomUUID();
    setActiveLayerId(defaultLayerId);
    setActiveLayerName('Camada Padrão');
  }, []);

  // Criar camada padrão se não houver
  useEffect(() => {
    if (!activeLayerId) {
      handleLayerSelect();
    }
  }, [activeLayerId, handleLayerSelect]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Mapa principal */}
      <MapView
        style={{ width: '100%', height: '100%' }}
      />

      {/* Toolbar de desenho */}
      <DrawingToolbar
        onLayerSelect={handleLayerSelect}
        activeLayerName={activeLayerName}
      />

      {/* Painel de propriedades */}
      <PropertiesPanel
        open={propertiesPanelOpen}
        onClose={() => setPropertiesPanelOpen(false)}
      />

      {/* Indicadores de loading global */}
      {(createFeature.isPending || updateFeature.isPending) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: 'primary.main',
            zIndex: 2000,
            animation: 'progress 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Atalhos de teclado (invisível) */}
      <Box
        component="div"
        tabIndex={0}
        sx={{
          position: 'absolute',
          top: -1000,
          left: -1000,
          width: 1,
          height: 1,
          opacity: 0,
        }}
        onKeyDown={(e) => {
          // Atalhos globais
          if (e.key === 'Escape') {
            setPropertiesPanelOpen(false);
            if (hotSource?.isEditingVertices) {
              hotSource.stopEditingVertices();
              stopEditing();
            }
          } else if (e.key === 'Delete' && hasSelection) {
            // Handler para deletar features selecionadas
            const confirmed = window.confirm(`Deletar ${selectedFeatures.length} feature(s)?`);
            if (confirmed) {
              // deleteSelected() seria chamado aqui
            }
          } else if (e.key === 'F2' && hasSelection) {
            setPropertiesPanelOpen(true);
          }
        }}
      />
    </Box>
  );
};