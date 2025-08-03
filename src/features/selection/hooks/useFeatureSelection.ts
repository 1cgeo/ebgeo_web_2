// Path: features\selection\hooks\useFeatureSelection.ts

import { useCallback, useMemo } from 'react';
import { Position } from 'geojson';
import { useMapInstance } from '../../core-map/hooks/useMapInstance';
import { useFeatures } from '../../data-access/hooks/useFeatures';
import { useSelectionStore, useSelectionActions } from '../store/selection.store';
import { useDeleteManyFeatures, useMoveFeaturesToLayer, useDuplicateFeatures } from '../../data-access/hooks/useMutateFeature';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';

export const useFeatureSelection = () => {
  const { 
    queryRenderedFeatures, 
    unproject, 
    setCursor,
    isMapLoaded,
    map 
  } = useMapInstance();
  
  const { data: allFeatures = [] } = useFeatures();
  
  // Store state
  const {
    selectedFeatureIds,
    hoveredFeatureId,
    editingFeatureId,
    isMultiSelectMode,
    boxSelection,
    selectionMode,
  } = useSelectionStore();

  // Store actions
  const {
    selectFeature,
    selectFeatures,
    deselectFeature,
    clearSelection,
    toggleFeature,
    setHoveredFeature,
    setEditingFeature,
    setMultiSelectMode,
    toggleMultiSelectMode,
    isSelected,
    reset,
  } = useSelectionActions();

  // Mutations
  const deleteManyFeatures = useDeleteManyFeatures();
  const moveFeaturesToLayer = useMoveFeaturesToLayer();
  const duplicateFeatures = useDuplicateFeatures();

  // Features selecionadas
  const selectedFeatures = useMemo(() => {
    return allFeatures.filter(feature => selectedFeatureIds.includes(feature.id));
  }, [allFeatures, selectedFeatureIds]);

  // Feature sendo destacada
  const hoveredFeature = useMemo(() => {
    return hoveredFeatureId ? allFeatures.find(f => f.id === hoveredFeatureId) : null;
  }, [allFeatures, hoveredFeatureId]);

  // Feature sendo editada
  const editingFeature = useMemo(() => {
    return editingFeatureId ? allFeatures.find(f => f.id === editingFeatureId) : null;
  }, [allFeatures, editingFeatureId]);

  // Estatísticas de seleção
  const selectionStats = useMemo(() => {
    const features = selectedFeatures;
    const geometryTypes = features.reduce((acc, feature) => {
      const type = feature.geometry.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const layers = features.reduce((acc, feature) => {
      const layerId = feature.properties.layerId;
      acc.add(layerId);
      return acc;
    }, new Set<string>());

    return {
      count: features.length,
      geometryTypes,
      layerCount: layers.size,
      layers: Array.from(layers),
    };
  }, [selectedFeatures]);

  // Buscar features no ponto clicado
  const selectAtPoint = useCallback((
    point: { x: number; y: number },
    options: {
      mode?: 'single' | 'add' | 'toggle';
      radius?: number;
    } = {}
  ) => {
    if (!isMapLoaded) return;

    const { mode = 'single', radius = 5 } = options;
    
    try {
      const features = queryRenderedFeatures(
        { x: point.x, y: point.y },
        { radius }
      );

      if (features.length > 0) {
        const feature = features[0];
        const featureId = feature.id as string;

        if (featureId) {
          selectFeature(featureId, mode);
          return featureId;
        }
      } else if (mode === 'single') {
        // Limpar seleção se não encontrou nada e modo é single
        clearSelection();
      }

      return null;
    } catch (error) {
      console.error('Erro ao selecionar feature:', error);
      return null;
    }
  }, [isMapLoaded, queryRenderedFeatures, selectFeature, clearSelection]);

  // Seleção por região (box select)
  const selectInRegion = useCallback((
    startPoint: Position,
    endPoint: Position,
    mode: 'replace' | 'add' = 'replace'
  ) => {
    if (!isMapLoaded || !map) return [];

    try {
      // Converter para bounds
      const minLng = Math.min(startPoint[0], endPoint[0]);
      const maxLng = Math.max(startPoint[0], endPoint[0]);
      const minLat = Math.min(startPoint[1], endPoint[1]);
      const maxLat = Math.max(startPoint[1], endPoint[1]);

      // Buscar features na região
      const featuresInRegion = allFeatures.filter(feature => {
        try {
          // Verificação simples se a feature está na região
          if (feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates as Position;
            return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
          } else if (feature.geometry.type === 'LineString') {
            const coordinates = feature.geometry.coordinates as Position[];
            return coordinates.some(([lng, lat]) => 
              lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
            );
          }
          // Adicionar lógica para outros tipos de geometria conforme necessário
          return false;
        } catch {
          return false;
        }
      });

      const featureIds = featuresInRegion.map(f => f.id);
      
      if (featureIds.length > 0) {
        selectFeatures(featureIds, mode);
      } else if (mode === 'replace') {
        clearSelection();
      }

      return featureIds;
    } catch (error) {
      console.error('Erro na seleção por região:', error);
      return [];
    }
  }, [isMapLoaded, map, allFeatures, selectFeatures, clearSelection]);

  // Buscar feature por ID
  const selectById = useCallback((featureId: string, mode: 'single' | 'add' | 'toggle' = 'single') => {
    const feature = allFeatures.find(f => f.id === featureId);
    if (feature) {
      selectFeature(featureId, mode);
      return feature;
    }
    return null;
  }, [allFeatures, selectFeature]);

  // Seleção por critérios
  const selectByLayer = useCallback((layerId: string, mode: 'replace' | 'add' = 'replace') => {
    const featuresInLayer = allFeatures.filter(f => f.properties.layerId === layerId);
    const featureIds = featuresInLayer.map(f => f.id);
    
    if (featureIds.length > 0) {
      selectFeatures(featureIds, mode);
    }
    
    return featureIds;
  }, [allFeatures, selectFeatures]);

  const selectByGeometryType = useCallback((geometryType: string, mode: 'replace' | 'add' = 'replace') => {
    const featuresOfType = allFeatures.filter(f => f.geometry.type === geometryType);
    const featureIds = featuresOfType.map(f => f.id);
    
    if (featureIds.length > 0) {
      selectFeatures(featureIds, mode);
    }
    
    return featureIds;
  }, [allFeatures, selectFeatures]);

  const selectAll = useCallback(() => {
    const allIds = allFeatures.map(f => f.id);
    selectFeatures(allIds, 'replace');
    return allIds;
  }, [allFeatures, selectFeatures]);

  // Navegação entre seleções
  const selectNext = useCallback(() => {
    if (selectedFeatureIds.length !== 1) return null;
    
    const currentIndex = allFeatures.findIndex(f => f.id === selectedFeatureIds[0]);
    const nextIndex = (currentIndex + 1) % allFeatures.length;
    const nextFeature = allFeatures[nextIndex];
    
    if (nextFeature) {
      selectFeature(nextFeature.id, 'single');
      return nextFeature.id;
    }
    
    return null;
  }, [selectedFeatureIds, allFeatures, selectFeature]);

  const selectPrevious = useCallback(() => {
    if (selectedFeatureIds.length !== 1) return null;
    
    const currentIndex = allFeatures.findIndex(f => f.id === selectedFeatureIds[0]);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allFeatures.length - 1;
    const prevFeature = allFeatures[prevIndex];
    
    if (prevFeature) {
      selectFeature(prevFeature.id, 'single');
      return prevFeature.id;
    }
    
    return null;
  }, [selectedFeatureIds, allFeatures, selectFeature]);

  // Inverter seleção
  const invertSelection = useCallback(() => {
    const allIds = allFeatures.map(f => f.id);
    const unselectedIds = allIds.filter(id => !selectedFeatureIds.includes(id));
    selectFeatures(unselectedIds, 'replace');
    return unselectedIds;
  }, [allFeatures, selectedFeatureIds, selectFeatures]);

  // Operações em lote
  const deleteSelected = useCallback(async () => {
    if (selectedFeatureIds.length === 0) return false;

    try {
      await deleteManyFeatures.mutateAsync(selectedFeatureIds);
      clearSelection();
      return true;
    } catch (error) {
      console.error('Erro ao deletar features selecionadas:', error);
      return false;
    }
  }, [selectedFeatureIds, deleteManyFeatures, clearSelection]);

  const moveSelectedToLayer = useCallback(async (targetLayerId: string) => {
    if (selectedFeatureIds.length === 0) return false;

    try {
      await moveFeaturesToLayer.mutateAsync({
        featureIds: selectedFeatureIds,
        targetLayerId,
      });
      return true;
    } catch (error) {
      console.error('Erro ao mover features para camada:', error);
      return false;
    }
  }, [selectedFeatureIds, moveFeaturesToLayer]);

  const duplicateSelected = useCallback(async (targetLayerId?: string) => {
    if (selectedFeatureIds.length === 0) return [];

    try {
      const duplicated = await duplicateFeatures.mutateAsync({
        featureIds: selectedFeatureIds,
        targetLayerId,
      });
      
      // Selecionar features duplicadas
      const duplicatedIds = duplicated.map(f => f.id);
      selectFeatures(duplicatedIds, 'replace');
      
      return duplicated;
    } catch (error) {
      console.error('Erro ao duplicar features selecionadas:', error);
      return [];
    }
  }, [selectedFeatureIds, duplicateFeatures, selectFeatures]);

  // Hover management
  const handleMouseEnter = useCallback((featureId: string) => {
    setHoveredFeature(featureId);
    setCursor('pointer');
  }, [setHoveredFeature, setCursor]);

  const handleMouseLeave = useCallback(() => {
    setHoveredFeature(null);
    setCursor('');
  }, [setHoveredFeature, setCursor]);

  // Edição
  const startEditing = useCallback((featureId: string) => {
    setEditingFeature(featureId);
    selectFeature(featureId, 'single');
  }, [setEditingFeature, selectFeature]);

  const stopEditing = useCallback(() => {
    setEditingFeature(null);
  }, [setEditingFeature]);

  // Interface de retorno
  return {
    // Estado
    selectedFeatureIds,
    selectedFeatures,
    hoveredFeature,
    editingFeature,
    isMultiSelectMode,
    boxSelection,
    selectionMode,
    selectionStats,

    // Seleção básica
    selectAtPoint,
    selectById,
    clearSelection,
    toggleFeature,
    isSelected,

    // Seleção por região
    selectInRegion,

    // Seleção por critérios
    selectByLayer,
    selectByGeometryType,
    selectAll,
    invertSelection,

    // Navegação
    selectNext,
    selectPrevious,

    // Hover
    handleMouseEnter,
    handleMouseLeave,

    // Edição
    startEditing,
    stopEditing,

    // Operações em lote
    deleteSelected,
    moveSelectedToLayer,
    duplicateSelected,

    // Configurações
    setMultiSelectMode,
    toggleMultiSelectMode,

    // Loading states
    isDeleting: deleteManyFeatures.isPending,
    isMoving: moveFeaturesToLayer.isPending,
    isDuplicating: duplicateFeatures.isPending,

    // Reset
    reset,

    // Utilitários
    hasSelection: selectedFeatureIds.length > 0,
    hasSingleSelection: selectedFeatureIds.length === 1,
    hasMultipleSelection: selectedFeatureIds.length > 1,
  };
};