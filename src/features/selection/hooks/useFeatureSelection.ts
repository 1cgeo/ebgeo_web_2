// Path: features\selection\hooks\useFeatureSelection.ts

import { useCallback, useMemo } from 'react';
import { Position } from 'geojson';
import { useMapInstance } from '../../core-map/hooks/useMapInstance';
import { useFeatures } from '../../data-access/hooks/useFeatures';
import { useSelectionStore, useSelectionActions } from '../store/selection.store';
import {
  useDeleteManyFeatures,
  useMoveFeaturesToLayer,
  useDuplicateFeatures,
  useUpdateFeature,
} from '../../data-access/hooks/useMutateFeature';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { DragResult } from '../../../types/feature.types';

// Novo hook específico para integração com drag
export const useFeatureSelectionWithDrag = () => {
  const baseSelection = useFeatureSelection();
  const updateFeature = useUpdateFeature();

  // Callback específico para drag end - integra com sistema de seleção
  const handleDragEnd = useCallback(
    async (featureId: string, finalGeometry: GeoJSON.Geometry): Promise<DragResult> => {
      const startTime = Date.now();

      try {
        // Obter feature original
        const originalFeature = baseSelection.selectedFeatures.find(f => f.id === featureId);

        if (!originalFeature) {
          throw new Error('Feature não encontrada na seleção');
        }

        // Persistir nova geometria
        await updateFeature.mutateAsync({
          id: featureId,
          updates: {
            geometry: finalGeometry,
            properties: {
              ...originalFeature.properties,
              updatedAt: new Date().toISOString(),
            },
          },
        });

        // Calcular resultado do drag
        const dragResult: DragResult = {
          success: true,
          featureId,
          originalGeometry: originalFeature.geometry,
          finalGeometry,
          translation: calculateTranslation(originalFeature.geometry, finalGeometry),
          duration: Date.now() - startTime,
        };

        return dragResult;
      } catch (error) {
        return {
          success: false,
          featureId,
          originalGeometry: {} as GeoJSON.Geometry,
          finalGeometry,
          translation: { dx: 0, dy: 0 },
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    },
    [baseSelection.selectedFeatures, updateFeature]
  );

  // Função para calcular translação aproximada
  const calculateTranslation = useCallback(
    (original: GeoJSON.Geometry, final: GeoJSON.Geometry) => {
      // Simplificado - calcular para pontos centrais
      if (original.type === 'Point' && final.type === 'Point') {
        const [origLng, origLat] = original.coordinates as Position;
        const [finalLng, finalLat] = final.coordinates as Position;
        return {
          dx: finalLng - origLng,
          dy: finalLat - origLat,
        };
      }

      // Para outras geometrias, retornar aproximação
      return { dx: 0, dy: 0 };
    },
    []
  );

  // Verificar se features selecionadas podem ser arrastadas
  const canDragSelected = useMemo(() => {
    return baseSelection.selectedFeatures.every(
      feature => feature.properties?.state !== 'locked' && feature.properties?.visible !== false
    );
  }, [baseSelection.selectedFeatures]);

  // Verificar se uma feature específica pode ser arrastada
  const canDragFeature = useCallback(
    (featureId: string) => {
      const feature = baseSelection.selectedFeatures.find(f => f.id === featureId);
      return (
        feature && feature.properties?.state !== 'locked' && feature.properties?.visible !== false
      );
    },
    [baseSelection.selectedFeatures]
  );

  return {
    ...baseSelection,
    // Novos métodos específicos para drag
    handleDragEnd,
    canDragSelected,
    canDragFeature,
    isDragInProgress: updateFeature.isPending,
  };
};

// Hook para integração completa com DrawingManager
export const useDrawingManagerIntegration = () => {
  const { map, isMapLoaded } = useMapInstance();
  const selectionWithDrag = useFeatureSelectionWithDrag();
  const [drawingManager, setDrawingManager] = useState<any>(null);
  const [hotSource, setHotSource] = useState<any>(null);
  const [isSystemReady, setIsSystemReady] = useState(false);

  // Configurar sistema quando mapa estiver pronto
  useEffect(() => {
    if (!isMapLoaded || !map || drawingManager) return;

    const initializeDrawingSystem = async () => {
      try {
        // Callbacks do HotSource
        const hotSourceCallbacks = {
          onFeatureUpdated: async (feature: ExtendedFeature) => {
            // Integrar com sistema de atualização existente
            console.log('Feature atualizada no HotSource:', feature.id);
          },
          onVertexMoved: (featureId: string, vertexIndex: number, newPosition: Position) => {
            console.log(`Vértice ${vertexIndex} movido na feature ${featureId}`);
          },
          onVertexAdded: (featureId: string, vertexIndex: number, position: Position) => {
            console.log(`Vértice adicionado na feature ${featureId}`);
          },
          onVertexRemoved: (featureId: string, vertexIndex: number) => {
            console.log(`Vértice removido na feature ${featureId}`);
          },
          onError: (error: string) => {
            console.error('HotSource Error:', error);
          },
        };

        // Callbacks do DrawingManager
        const drawingManagerCallbacks = {
          onFeatureCreated: async (feature: ExtendedFeature) => {
            // Integrar com sistema de criação existente
            console.log('Nova feature criada:', feature.id);
          },
          onFeatureUpdated: async (feature: ExtendedFeature) => {
            // Integrar com sistema de atualização existente
            console.log('Feature atualizada:', feature.id);
          },
          onToolChanged: (tool: string) => {
            console.log('Ferramenta alterada:', tool);
          },
          onError: (error: string) => {
            console.error('DrawingManager Error:', error);
          },
          onStatusChange: (status: string) => {
            console.log('Status:', status);
          },
          // Integração com sistema de seleção
          onFeatureSelected: (featureId: string, mode: 'single' | 'add' | 'toggle') => {
            selectionWithDrag.selectFeature(featureId, mode);
          },
          onFeaturesDeselected: () => {
            selectionWithDrag.clearSelection();
          },
          onFeatureDragStart: (featureId: string) => {
            console.log('Iniciando drag:', featureId);
          },
          onFeatureDragEnd: async (featureId: string, finalGeometry: GeoJSON.Geometry) => {
            // Usar handler integrado de drag
            const result = await selectionWithDrag.handleDragEnd(featureId, finalGeometry);
            console.log('Drag finalizado:', result);
          },
        };

        // Criar HotSource
        const { HotSource } = await import('../../drawing/lib/HotSource');
        const hotSourceInstance = new HotSource(map, hotSourceCallbacks);

        // Criar DrawingManager
        const { createDrawingManager } = await import('../../drawing/lib/DrawingManager');
        const manager = createDrawingManager(map, hotSourceInstance, drawingManagerCallbacks, {
          defaultTool: 'select',
          enableKeyboardShortcuts: true,
          toolConfig: {
            snapToVertices: true,
            snapToEdges: false,
            snapTolerance: 10,
            showCoordinates: true,
            allowUndo: true,
          },
        });

        // Habilitar sistema
        manager.enable();

        setDrawingManager(manager);
        setHotSource(hotSourceInstance);
        setIsSystemReady(true);

        console.log('Sistema de drag inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar sistema de drag:', error);
      }
    };

    initializeDrawingSystem();

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

  // Métodos para controle do sistema
  const setActiveTool = useCallback(
    (tool: string) => {
      if (drawingManager && isSystemReady) {
        drawingManager.setActiveTool(tool);
      }
    },
    [drawingManager, isSystemReady]
  );

  const setActiveLayer = useCallback(
    (layerId: string) => {
      if (drawingManager && isSystemReady) {
        drawingManager.setActiveLayer(layerId);
      }
    },
    [drawingManager, isSystemReady]
  );

  const canSwitchTool = useCallback(() => {
    return drawingManager ? drawingManager.canSwitchTool() : true;
  }, [drawingManager]);

  const isDragging = useCallback(() => {
    return drawingManager ? drawingManager.isDragging() : false;
  }, [drawingManager]);

  return {
    // Sistema
    isSystemReady,
    drawingManager,
    hotSource,

    // Controles
    setActiveTool,
    setActiveLayer,
    canSwitchTool,
    isDragging,

    // Integração com seleção
    ...selectionWithDrag,
  };
};

// Hook para shortcuts de teclado integrados com drag
export const useKeyboardShortcutsWithDrag = (
  drawingManagerIntegration: ReturnType<typeof useDrawingManagerIntegration>
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Não processar se estiver em input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Não processar durante drag
      if (drawingManagerIntegration.isDragging()) {
        return;
      }

      switch (e.key) {
        case '1':
          if (e.ctrlKey) {
            e.preventDefault();
            drawingManagerIntegration.setActiveTool('select');
          }
          break;
        case '2':
          if (e.ctrlKey) {
            e.preventDefault();
            drawingManagerIntegration.setActiveTool('point');
          }
          break;
        case '3':
          if (e.ctrlKey) {
            e.preventDefault();
            drawingManagerIntegration.setActiveTool('line');
          }
          break;
        case 'Delete':
          if (drawingManagerIntegration.hasSelection) {
            drawingManagerIntegration.deleteSelected();
          }
          break;
        case 'Escape':
          if (drawingManagerIntegration.hasSelection) {
            drawingManagerIntegration.clearSelection();
          }
          break;
        case 'a':
          if (e.ctrlKey) {
            e.preventDefault();
            drawingManagerIntegration.selectAll();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawingManagerIntegration]);
};

// Hook principal que combina tudo
export const useCompleteDrawingSystem = () => {
  const drawingIntegration = useDrawingManagerIntegration();

  // Configurar shortcuts
  useKeyboardShortcutsWithDrag(drawingIntegration);

  // Status do sistema
  const systemStatus = useMemo(
    () => ({
      isReady: drawingIntegration.isSystemReady,
      hasSelection: drawingIntegration.hasSelection,
      canDrag: drawingIntegration.canDragSelected,
      isDragging: drawingIntegration.isDragging(),
      canSwitchTool: drawingIntegration.canSwitchTool(),
      selectionCount: drawingIntegration.selectedFeatures.length,
    }),
    [drawingIntegration]
  );

  // Métodos principais
  const actions = useMemo(
    () => ({
      // Ferramentas
      selectTool: () => drawingIntegration.setActiveTool('select'),
      pointTool: () => drawingIntegration.setActiveTool('point'),
      lineTool: () => drawingIntegration.setActiveTool('line'),

      // Seleção
      selectAll: drawingIntegration.selectAll,
      clearSelection: drawingIntegration.clearSelection,
      invertSelection: drawingIntegration.invertSelection,

      // Operações
      deleteSelected: drawingIntegration.deleteSelected,
      duplicateSelected: drawingIntegration.duplicateSelected,
      moveSelectedToLayer: drawingIntegration.moveSelectedToLayer,
    }),
    [drawingIntegration]
  );

  return {
    ...drawingIntegration,
    systemStatus,
    actions,
  };
};
