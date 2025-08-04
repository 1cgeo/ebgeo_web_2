// Path: features\layers\hooks\useFeatureTransfer.ts

import { useState, useCallback, useMemo } from 'react';
import { useFeatureSelection } from '../../selection/hooks/useFeatureSelection';
import { useLayers } from '../../data-access/hooks/useLayers';
import { useMapsStore } from '../../maps-contexts/store/maps.store';
import { useMoveFeaturesToLayer } from '../../data-access/hooks/useMutateFeature';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { LayerConfig } from '../../data-access/schemas/layer.schema';

// Interface para configuração da transferência
export interface FeatureTransferConfig {
  featureIds: string[];
  targetLayerId: string;
  sourceLayerId?: string;
  showConfirmation?: boolean;
}

// Interface para resultado da transferência
export interface FeatureTransferResult {
  success: boolean;
  transferredCount: number;
  targetLayerName: string;
  error?: string;
}

// Interface para estatísticas de transferência
export interface FeatureTransferStats {
  totalFeatures: number;
  byGeometryType: Record<string, number>;
  bySourceLayer: Record<string, number>;
  targetLayer?: LayerConfig;
  conflictingFeatures: string[]; // Features que já estão na camada destino
}

export const useFeatureTransfer = () => {
  // Estados locais
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [preSelectedFeatureIds, setPreSelectedFeatureIds] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Hooks
  const { selectedFeatures, selectFeatures, clearSelection } = useFeatureSelection();
  const { data: allLayers = [] } = useLayers();
  const moveFeaturesToLayer = useMoveFeaturesToLayer();
  const activeMapId = useMapsStore(state => state.activeMapId);

  // Camadas do mapa ativo
  const availableLayers = useMemo(() => {
    if (!activeMapId) return [];
    const mapData = useMapsStore.getState().loadedMaps.get(activeMapId);
    if (!mapData) return allLayers;

    return allLayers.filter(layer => mapData.layerIds.includes(layer.id));
  }, [allLayers, activeMapId]);

  // Abrir diálogo com features pré-selecionadas
  const openTransferDialog = useCallback(
    (featureIds?: string[]) => {
      if (featureIds && featureIds.length > 0) {
        setPreSelectedFeatureIds(featureIds);
        // Selecionar as features no sistema de seleção
        selectFeatures(featureIds, 'replace');
      } else {
        setPreSelectedFeatureIds([]);
      }
      setIsDialogOpen(true);
    },
    [selectFeatures]
  );

  // Fechar diálogo
  const closeTransferDialog = useCallback(() => {
    setIsDialogOpen(false);
    setPreSelectedFeatureIds([]);
    setValidationErrors([]);
  }, []);

  // Transferir features selecionadas para uma camada específica
  const transferSelectedFeatures = useCallback(
    async (targetLayerId: string): Promise<FeatureTransferResult> => {
      if (selectedFeatures.length === 0) {
        return {
          success: false,
          transferredCount: 0,
          targetLayerName: '',
          error: 'Nenhuma feature selecionada',
        };
      }

      const targetLayer = availableLayers.find(l => l.id === targetLayerId);
      if (!targetLayer) {
        return {
          success: false,
          transferredCount: 0,
          targetLayerName: '',
          error: 'Camada de destino não encontrada',
        };
      }

      try {
        const featureIds = selectedFeatures.map(f => f.id);
        await moveFeaturesToLayer.mutateAsync({
          featureIds,
          targetLayerId,
        });

        return {
          success: true,
          transferredCount: featureIds.length,
          targetLayerName: targetLayer.name,
        };
      } catch (error) {
        return {
          success: false,
          transferredCount: 0,
          targetLayerName: targetLayer.name,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    },
    [selectedFeatures, availableLayers, moveFeaturesToLayer]
  );

  // Transferir features específicas
  const transferFeatures = useCallback(
    async (config: FeatureTransferConfig): Promise<FeatureTransferResult> => {
      const { featureIds, targetLayerId } = config;

      if (featureIds.length === 0) {
        return {
          success: false,
          transferredCount: 0,
          targetLayerName: '',
          error: 'Nenhuma feature especificada',
        };
      }

      const targetLayer = availableLayers.find(l => l.id === targetLayerId);
      if (!targetLayer) {
        return {
          success: false,
          transferredCount: 0,
          targetLayerName: '',
          error: 'Camada de destino não encontrada',
        };
      }

      try {
        await moveFeaturesToLayer.mutateAsync({
          featureIds,
          targetLayerId,
        });

        return {
          success: true,
          transferredCount: featureIds.length,
          targetLayerName: targetLayer.name,
        };
      } catch (error) {
        return {
          success: false,
          transferredCount: 0,
          targetLayerName: targetLayer.name,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
      }
    },
    [availableLayers, moveFeaturesToLayer]
  );

  // Calcular estatísticas de transferência
  const getTransferStats = useCallback(
    (featureIds: string[], targetLayerId: string): FeatureTransferStats => {
      const features = selectedFeatures.filter(f => featureIds.includes(f.id));
      const targetLayer = availableLayers.find(l => l.id === targetLayerId);

      // Estatísticas por tipo de geometria
      const byGeometryType = features.reduce(
        (acc, feature) => {
          const type = feature.geometry.type;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Estatísticas por camada de origem
      const bySourceLayer = features.reduce(
        (acc, feature) => {
          const sourceLayerId = feature.properties.layerId;
          const sourceLayer = availableLayers.find(l => l.id === sourceLayerId);
          const layerName = sourceLayer?.name || 'Camada desconhecida';
          acc[layerName] = (acc[layerName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Features que já estão na camada destino
      const conflictingFeatures = features
        .filter(f => f.properties.layerId === targetLayerId)
        .map(f => f.id);

      return {
        totalFeatures: features.length,
        byGeometryType,
        bySourceLayer,
        targetLayer,
        conflictingFeatures,
      };
    },
    [selectedFeatures, availableLayers]
  );

  // Validar transferência
  const validateTransfer = useCallback(
    async (featureIds: string[], targetLayerId: string) => {
      setIsValidating(true);
      setValidationErrors([]);

      const errors: string[] = [];

      try {
        // Verificar se há features
        if (featureIds.length === 0) {
          errors.push('Nenhuma feature selecionada para transferência');
        }

        // Verificar se a camada destino existe
        const targetLayer = availableLayers.find(l => l.id === targetLayerId);
        if (!targetLayer) {
          errors.push('Camada de destino não encontrada');
        }

        // Verificar se a camada destino está visível (opcional)
        if (targetLayer && !targetLayer.visible) {
          errors.push('Camada de destino está oculta');
        }

        // Verificar features duplicadas na camada destino
        const stats = getTransferStats(featureIds, targetLayerId);
        if (stats.conflictingFeatures.length > 0) {
          errors.push(
            `${stats.conflictingFeatures.length} feature(s) já estão na camada de destino`
          );
        }

        setValidationErrors(errors);
        return { valid: errors.length === 0, errors };
      } finally {
        setIsValidating(false);
      }
    },
    [availableLayers, getTransferStats]
  );

  // Transferir todas as features de uma camada para outra
  const transferLayerFeatures = useCallback(
    async (sourceLayerId: string, targetLayerId: string): Promise<FeatureTransferResult> => {
      const sourceFeatures = selectedFeatures.filter(f => f.properties.layerId === sourceLayerId);
      const featureIds = sourceFeatures.map(f => f.id);

      return await transferFeatures({
        featureIds,
        targetLayerId,
        sourceLayerId,
      });
    },
    [selectedFeatures, transferFeatures]
  );

  // Utilitários para seleção rápida
  const quickActions = useMemo(
    () => ({
      // Abrir diálogo com features selecionadas
      transferSelected: () => openTransferDialog(),

      // Abrir diálogo com features específicas
      transferSpecific: (featureIds: string[]) => openTransferDialog(featureIds),

      // Transferir para camada específica sem diálogo
      transferToLayer: (targetLayerId: string) => transferSelectedFeatures(targetLayerId),

      // Transferir features específicas para camada específica
      transferSpecificToLayer: (featureIds: string[], targetLayerId: string) =>
        transferFeatures({ featureIds, targetLayerId }),
    }),
    [openTransferDialog, transferSelectedFeatures, transferFeatures]
  );

  return {
    // Estado
    isDialogOpen,
    preSelectedFeatureIds,
    isValidating,
    validationErrors,
    isTransferring: moveFeaturesToLayer.isPending,

    // Camadas disponíveis
    availableLayers,

    // Ações principais
    openTransferDialog,
    closeTransferDialog,
    transferSelectedFeatures,
    transferFeatures,
    transferLayerFeatures,

    // Validação e estatísticas
    validateTransfer,
    getTransferStats,

    // Utilitários
    quickActions,

    // Estados de carregamento
    isLoading: moveFeaturesToLayer.isPending,
    error: moveFeaturesToLayer.error?.message,
  };
};
