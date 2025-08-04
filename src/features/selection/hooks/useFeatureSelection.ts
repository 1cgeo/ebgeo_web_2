// Path: features\selection\hooks\useFeatureSelection.ts

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useMapInstance } from '../../core-map/hooks/useMapInstance';
import { useSelectionStore, useSelectionActions } from '../store/selection.store';
import {
  useDeleteManyFeatures,
  useMoveFeaturesToLayer,
  useDuplicateFeatures,
  useUpdateFeature,
} from '../../data-access/hooks/useMutateFeature';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';

// Tipos locais
type Position = [number, number] | [number, number, number];

interface DragResult {
  success: boolean;
  featureId: string;
  originalGeometry: GeoJSON.Geometry;
  finalGeometry: GeoJSON.Geometry;
  translation: { dx: number; dy: number };
  duration: number;
  error?: string;
}

interface SelectionStats {
  total: number;
  byType: Record<string, number>;
  byLayer: Record<string, number>;
}

// Placeholder para store de seleção até implementar
const useSelectionStore = () => ({
  selectedFeatureIds: [] as string[],
  hoveredFeatureId: null as string | null,
  isEditing: false,
  editingFeatureId: null as string | null,
});

const useSelectionActions = () => ({
  selectFeature: (id: string) => {},
  deselectFeature: (id: string) => {},
  clearSelection: () => {},
  setHovered: (id: string | null) => {},
  startEditing: (id: string) => {},
  stopEditing: () => {},
});

// Hook principal para seleção de features
export const useFeatureSelection = () => {
  const { map } = useMapInstance();
  const { selectedFeatureIds, hoveredFeatureId, isEditing, editingFeatureId } = useSelectionStore();
  const {
    selectFeature: selectFeatureAction,
    deselectFeature: deselectFeatureAction,
    clearSelection: clearSelectionAction,
    setHovered,
    startEditing: startEditingAction,
    stopEditing: stopEditingAction,
  } = useSelectionActions();

  // Hooks de mutations
  const deleteManyFeatures = useDeleteManyFeatures();
  const moveFeaturesToLayer = useMoveFeaturesToLayer();
  const duplicateFeatures = useDuplicateFeatures();
  const updateFeature = useUpdateFeature();

  // Estado local para features selecionadas (placeholder)
  const [selectedFeatures, setSelectedFeatures] = useState<ExtendedFeature[]>([]);

  // Estatísticas da seleção
  const selectionStats = useMemo((): SelectionStats => {
    const stats: SelectionStats = {
      total: selectedFeatures.length,
      byType: {},
      byLayer: {},
    };

    selectedFeatures.forEach((feature) => {
      // Por tipo de geometria
      const type = feature.geometry.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Por camada
      const layerId = feature.properties.layerId;
      stats.byLayer[layerId] = (stats.byLayer[layerId] || 0) + 1;
    });

    return stats;
  }, [selectedFeatures]);

  // Estados derivados
  const hasSelection = selectedFeatures.length > 0;
  const hasSingleSelection = selectedFeatures.length === 1;
  const hasMultipleSelection = selectedFeatures.length > 1;

  // Funções de seleção
  const selectFeature = useCallback((featureId: string, mode: 'single' | 'add' | 'toggle' = 'single') => {
    selectFeatureAction(featureId);
    // TODO: Implementar lógica real de seleção quando store estiver pronto
  }, [selectFeatureAction]);

  const deselectFeature = useCallback((featureId: string) => {
    deselectFeatureAction(featureId);
    // TODO: Implementar lógica real de deseleção
  }, [deselectFeatureAction]);

  const clearSelection = useCallback(() => {
    clearSelectionAction();
    setSelectedFeatures([]);
  }, [clearSelectionAction]);

  const selectFeatures = useCallback((featureIds: string[], mode: 'replace' | 'add' | 'toggle' = 'replace') => {
    if (mode === 'replace') {
      clearSelection();
    }
    
    featureIds.forEach(id => selectFeature(id, mode === 'replace' ? 'single' : 'add'));
  }, [selectFeature, clearSelection]);

  const toggleFeature = useCallback((featureId: string) => {
    if (selectedFeatureIds.includes(featureId)) {
      deselectFeature(featureId);
    } else {
      selectFeature(featureId, 'add');
    }
  }, [selectedFeatureIds, selectFeature, deselectFeature]);

  const selectAtPoint = useCallback((point: Position) => {
    if (!map) return;

    // TODO: Implementar query de features no ponto quando mapa estiver pronto
    console.log('Seleção no ponto:', point);
  }, [map]);

  const selectById = useCallback((featureId: string) => {
    selectFeature(featureId, 'single');
  }, [selectFeature]);

  // Funções de edição
  const startEditing = useCallback((featureId?: string) => {
    const targetId = featureId || selectedFeatureIds[0];
    if (targetId) {
      startEditingAction(targetId);
    }
  }, [selectedFeatureIds, startEditingAction]);

  const stopEditing = useCallback(() => {
    stopEditingAction();
  }, [stopEditingAction]);

  // Funções de hover
  const handleMouseEnter = useCallback((featureId: string) => {
    setHovered(featureId);
  }, [setHovered]);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, [setHovered]);

  // Operações em lote
  const deleteSelected = useCallback(async () => {
    if (selectedFeatureIds.length === 0) return;

    try {
      await deleteManyFeatures.mutateAsync(selectedFeatureIds);
      clearSelection();
    } catch (error) {
      console.error('Erro ao deletar features selecionadas:', error);
      throw error;
    }
  }, [selectedFeatureIds, deleteManyFeatures, clearSelection]);

  const duplicateSelected = useCallback(async (targetLayerId?: string) => {
    if (selectedFeatureIds.length === 0) return;

    try {
      const result = await duplicateFeatures.mutateAsync({
        featureIds: selectedFeatureIds,
        targetLayerId,
      });
      return result;
    } catch (error) {
      console.error('Erro ao duplicar features selecionadas:', error);
      throw error;
    }
  }, [selectedFeatureIds, duplicateFeatures]);

  const moveSelectedToLayer = useCallback(async (targetLayerId: string) => {
    if (selectedFeatureIds.length === 0) return;

    try {
      const result = await moveFeaturesToLayer.mutateAsync({
        featureIds: selectedFeatureIds,
        targetLayerId,
      });
      return result;
    } catch (error) {
      console.error('Erro ao mover features selecionadas:', error);
      throw error;
    }
  }, [selectedFeatureIds, moveFeaturesToLayer]);

  // Estados de loading
  const isDeleting = deleteManyFeatures.isPending;
  const isDuplicating = duplicateFeatures.isPending;
  const isMoving = moveFeaturesToLayer.isPending;

  return {
    // Estado
    selectedFeatures,
    selectedFeatureIds,
    hoveredFeatureId,
    isEditing,
    editingFeatureId,
    selectionStats,

    // Estados derivados
    hasSelection,
    hasSingleSelection,
    hasMultipleSelection,

    // Funções de seleção
    selectFeature,
    deselectFeature,
    clearSelection,
    selectFeatures,
    toggleFeature,
    selectAtPoint,
    selectById,

    // Funções de edição
    startEditing,
    stopEditing,

    // Funções de hover
    handleMouseEnter,
    handleMouseLeave,

    // Operações
    deleteSelected,
    duplicateSelected,
    moveSelectedToLayer,

    // Estados de loading
    isDeleting,
    isDuplicating,
    isMoving,
  };
};

// Hook específico para integração com drag
export const useFeatureSelectionWithDrag = () => {
  const baseSelection = useFeatureSelection();
  const updateFeature = useUpdateFeature();

  // Callback específico para drag end
  const handleDragEnd = useCallback(
    async (featureId: string, finalGeometry: GeoJSON.Geometry): Promise<DragResult> => {
      const startTime = Date.now();

      try {
        // Obter feature original
        const originalFeature = baseSelection.selectedFeatures.find((f) => f.id === featureId);

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

  return {
    ...baseSelection,
    handleDragEnd,
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
        console.log('Inicializando sistema de desenho e seleção');
        setIsSystemReady(true);
      } catch (error) {
        console.error('Erro ao inicializar sistema:', error);
        setIsSystemReady(false);
      }
    };

    initializeDrawingSystem();
  }, [isMapLoaded, map, drawingManager]);

  return {
    ...selectionWithDrag,
    drawingManager,
    hotSource,
    isSystemReady,
    setActiveTool: (tool: string) => {
      console.log('Ferramenta ativa:', tool);
    },
    selectAll: () => {
      console.log('Selecionar todos');
    },
    invertSelection: () => {
      console.log('Inverter seleção');
    },
    canDragSelected: selectionWithDrag.hasSelection,
    isDragging: () => false,
    canSwitchTool: () => true,
  };
};

// Hook para shortcuts de teclado com drag
export const useKeyboardShortcutsWithDrag = (drawingManagerIntegration: any) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        default:
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

// Função auxiliar para calcular translação
function calculateTranslation(
  originalGeometry: GeoJSON.Geometry,
  finalGeometry: GeoJSON.Geometry
): { dx: number; dy: number } {
  // Implementação simplificada - calcular diferença entre centroids
  const originalCoords = getGeometryCoordinates(originalGeometry);
  const finalCoords = getGeometryCoordinates(finalGeometry);

  if (originalCoords.length >= 2 && finalCoords.length >= 2) {
    return {
      dx: finalCoords[0] - originalCoords[0],
      dy: finalCoords[1] - originalCoords[1],
    };
  }

  return { dx: 0, dy: 0 };
}

// Função auxiliar para extrair coordenadas de geometria
function getGeometryCoordinates(geometry: GeoJSON.Geometry): number[] {
  switch (geometry.type) {
    case 'Point':
      return geometry.coordinates as number[];
    case 'LineString':
      const lineCoords = geometry.coordinates as number[][];
      return lineCoords[0] || [];
    case 'Polygon':
      const polyCoords = geometry.coordinates as number[][][];
      return polyCoords[0]?.[0] || [];
    default:
      return [];
  }
}