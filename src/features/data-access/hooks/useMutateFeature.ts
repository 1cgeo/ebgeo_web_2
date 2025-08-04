// Path: features\data-access\hooks\useMutateFeature.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExtendedFeature } from '../schemas/feature.schema';
import { IndexedDBFeatureRepository } from '../repositories/implementations/IndexedDBFeatureRepository';
import { FEATURE_QUERY_KEYS, useInvalidateFeatures } from './useFeatures';
import { useUndoRedo } from '../../transaction-history/hooks/useUndoRedo';

// Instância do repository
const featureRepository = new IndexedDBFeatureRepository();

// Hook para criar feature
export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: (feature: ExtendedFeature) => featureRepository.create(feature),
    onSuccess: newFeature => {
      // Criar transação para undo/redo
      try {
        createTransaction({
          type: 'create',
          description: `Criar ${newFeature.geometry.type.toLowerCase()}: ${newFeature.properties.name || newFeature.id}`,
          after: newFeature,
        });
      } catch (error) {
        console.warn('Erro ao criar transação para feature criada:', error);
      }

      // Atualizar cache otimisticamente
      queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(newFeature.id), newFeature);

      // Invalidar queries relacionadas
      invalidateAll();
      invalidateByLayer(newFeature.properties.layerId);
      invalidateStats(newFeature.properties.layerId);
    },
    onError: error => {
      console.error('Erro ao criar feature:', error);
    },
  });
};

// Hook para atualizar feature
export const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateDetail, invalidateByLayer, invalidateStats } =
    useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ExtendedFeature> }) => {
      // Buscar estado anterior para a transação
      const previousFeature = await featureRepository.getById(id);
      if (!previousFeature) {
        throw new Error(`Feature com ID ${id} não encontrada`);
      }

      const updatedFeature = await featureRepository.update(id, updates);

      return {
        previous: previousFeature,
        updated: updatedFeature,
      };
    },
    onSuccess: ({ previous, updated }, { id }) => {
      // Criar transação para undo/redo
      try {
        createTransaction({
          type: 'update',
          description: `Editar ${updated.geometry.type.toLowerCase()}: ${updated.properties.name || updated.id}`,
          before: previous,
          after: updated,
        });
      } catch (error) {
        console.warn('Erro ao criar transação para feature atualizada:', error);
      }

      // Atualizar cache
      queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(id), updated);

      // Invalidar queries relacionadas
      invalidateDetail(id);
      invalidateByLayer(updated.properties.layerId);
      invalidateStats(updated.properties.layerId);

      // Se a camada mudou, invalidar a camada anterior também
      if (previous.properties.layerId !== updated.properties.layerId) {
        invalidateByLayer(previous.properties.layerId);
        invalidateStats(previous.properties.layerId);
      }
    },
    onError: error => {
      console.error('Erro ao atualizar feature:', error);
    },
  });
};

// Hook para deletar feature
export const useDeleteFeature = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: async (id: string) => {
      // Buscar feature antes de deletar para a transação
      const featureToDelete = await featureRepository.getById(id);
      if (!featureToDelete) {
        throw new Error(`Feature com ID ${id} não encontrada`);
      }

      await featureRepository.delete(id);
      return featureToDelete;
    },
    onMutate: async id => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) });

      // Snapshot do estado anterior
      const previousFeature = queryClient.getQueryData<ExtendedFeature>(
        FEATURE_QUERY_KEYS.detail(id)
      );

      // Atualizar cache otimisticamente
      queryClient.removeQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) });

      return { previousFeature };
    },
    onSuccess: deletedFeature => {
      // Criar transação para undo/redo
      try {
        createTransaction({
          type: 'delete',
          description: `Deletar ${deletedFeature.geometry.type.toLowerCase()}: ${deletedFeature.properties.name || deletedFeature.id}`,
          before: deletedFeature,
        });
      } catch (error) {
        console.warn('Erro ao criar transação para feature deletada:', error);
      }

      // Invalidar queries relacionadas
      invalidateAll();
      invalidateByLayer(deletedFeature.properties.layerId);
      invalidateStats(deletedFeature.properties.layerId);
    },
    onError: (error, id, context) => {
      // Reverter em caso de erro
      if (context?.previousFeature) {
        queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(id), context.previousFeature);
      }
      console.error('Erro ao deletar feature:', error);
    },
  });
};

// Hook para criar múltiplas features
export const useCreateManyFeatures = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: (features: ExtendedFeature[]) => featureRepository.createMany(features),
    onSuccess: newFeatures => {
      // Criar transação para undo/redo
      try {
        const description =
          newFeatures.length === 1
            ? `Criar ${newFeatures[0].geometry.type.toLowerCase()}: ${newFeatures[0].properties.name || newFeatures[0].id}`
            : `Criar ${newFeatures.length} features`;

        createTransaction({
          type: 'batch',
          description,
          after: newFeatures,
        });
      } catch (error) {
        console.warn('Erro ao criar transação para features criadas:', error);
      }

      // Atualizar cache para cada feature
      newFeatures.forEach(feature => {
        queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(feature.id), feature);
      });

      // Invalidar todas as queries
      invalidateAll();
    },
    onError: error => {
      console.error('Erro ao criar múltiplas features:', error);
    },
  });
};

// Hook para deletar múltiplas features
export const useDeleteManyFeatures = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      // Buscar features antes de deletar para a transação
      const featuresToDelete = await Promise.all(ids.map(id => featureRepository.getById(id)));

      // Filtrar features que existem
      const existingFeatures = featuresToDelete.filter(Boolean) as ExtendedFeature[];

      if (existingFeatures.length === 0) {
        throw new Error('Nenhuma feature encontrada para deletar');
      }

      await featureRepository.deleteMany(ids);
      return existingFeatures;
    },
    onMutate: async ids => {
      // Cancelar queries em andamento
      await Promise.all(
        ids.map(id => queryClient.cancelQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) }))
      );

      // Snapshot do estado anterior
      const previousFeatures = ids.map(id => ({
        id,
        feature: queryClient.getQueryData<ExtendedFeature>(FEATURE_QUERY_KEYS.detail(id)),
      }));

      // Atualizar cache otimisticamente
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) });
      });

      return { previousFeatures };
    },
    onSuccess: deletedFeatures => {
      // Criar transação para undo/redo
      try {
        const description =
          deletedFeatures.length === 1
            ? `Deletar ${deletedFeatures[0].geometry.type.toLowerCase()}: ${deletedFeatures[0].properties.name || deletedFeatures[0].id}`
            : `Deletar ${deletedFeatures.length} features`;

        createTransaction({
          type: 'batch',
          description,
          before: deletedFeatures,
        });
      } catch (error) {
        console.warn('Erro ao criar transação para features deletadas:', error);
      }

      // Invalidar todas as queries
      invalidateAll();
    },
    onError: (error, ids, context) => {
      // Reverter em caso de erro
      context?.previousFeatures.forEach(({ id, feature }) => {
        if (feature) {
          queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(id), feature);
        }
      });
      console.error('Erro ao deletar múltiplas features:', error);
    },
  });
};

// Hook para mover features entre camadas
export const useMoveFeaturesToLayer = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: async ({
      featureIds,
      targetLayerId,
    }: {
      featureIds: string[];
      targetLayerId: string;
    }) => {
      // Buscar features antes da movimentação
      const features = await Promise.all(featureIds.map(id => featureRepository.getById(id)));

      const existingFeatures = features.filter(Boolean) as ExtendedFeature[];

      if (existingFeatures.length === 0) {
        throw new Error('Nenhuma feature encontrada para mover');
      }

      // Criar versões atualizadas
      const updatedFeatures = existingFeatures.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          layerId: targetLayerId,
          updatedAt: new Date().toISOString(),
        },
      }));

      // Atualizar no repositório
      await Promise.all(
        updatedFeatures.map(feature => featureRepository.update(feature.id, feature))
      );

      return {
        previous: existingFeatures,
        updated: updatedFeatures,
      };
    },
    onSuccess: ({ previous, updated }, { targetLayerId }) => {
      // Criar transação para undo/redo
      try {
        const description =
          updated.length === 1
            ? `Mover ${updated[0].geometry.type.toLowerCase()}: ${updated[0].properties.name || updated[0].id}`
            : `Mover ${updated.length} features para nova camada`;

        createTransaction({
          type: 'batch',
          description,
          before: previous,
          after: updated,
        });
      } catch (error) {
        console.warn('Erro ao criar transação para features movidas:', error);
      }

      // Atualizar cache
      updated.forEach(feature => {
        queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(feature.id), feature);
      });

      // Invalidar queries das camadas afetadas
      const affectedLayers = new Set([targetLayerId, ...previous.map(f => f.properties.layerId)]);

      affectedLayers.forEach(layerId => {
        invalidateByLayer(layerId);
        invalidateStats(layerId);
      });

      invalidateAll();
    },
    onError: error => {
      console.error('Erro ao mover features:', error);
    },
  });
};

// Hook para duplicar features
export const useDuplicateFeatures = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: ({ featureIds, targetLayerId }: { featureIds: string[]; targetLayerId?: string }) =>
      featureRepository.duplicate(featureIds, targetLayerId),
    onSuccess: duplicatedFeatures => {
      // Criar transação para undo/redo
      try {
        const description =
          duplicatedFeatures.length === 1
            ? `Duplicar ${duplicatedFeatures[0].geometry.type.toLowerCase()}: ${duplicatedFeatures[0].properties.name || duplicatedFeatures[0].id}`
            : `Duplicar ${duplicatedFeatures.length} features`;

        createTransaction({
          type: 'batch',
          description,
          after: duplicatedFeatures,
        });
      } catch (error) {
        console.warn('Erro ao criar transação para features duplicadas:', error);
      }

      // Atualizar cache para cada feature duplicada
      duplicatedFeatures.forEach(feature => {
        queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(feature.id), feature);
      });

      // Invalidar queries relacionadas
      invalidateAll();
      const layerIds = new Set(duplicatedFeatures.map(f => f.properties.layerId));
      layerIds.forEach(layerId => {
        invalidateByLayer(layerId);
        invalidateStats(layerId);
      });
    },
    onError: error => {
      console.error('Erro ao duplicar features:', error);
    },
  });
};

// Hook para validar feature
export const useValidateFeature = () => {
  return useMutation({
    mutationFn: (feature: ExtendedFeature) => featureRepository.validateFeature(feature),
    onError: error => {
      console.error('Erro ao validar feature:', error);
    },
  });
};

// Hook para limpar features órfãs
export const useCleanOrphanedFeatures = () => {
  const { invalidateAll } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: async () => {
      // Buscar features órfãs antes de deletar
      const orphanedFeatures = await featureRepository.getOrphanedFeatures();
      const orphanedIds = await featureRepository.cleanOrphanedFeatures();

      return {
        deletedFeatures: orphanedFeatures,
        deletedIds: orphanedIds,
      };
    },
    onSuccess: ({ deletedFeatures, deletedIds }) => {
      // Criar transação se houver features deletadas
      if (deletedFeatures.length > 0) {
        try {
          createTransaction({
            type: 'batch',
            description: `Limpar ${deletedFeatures.length} features órfãs`,
            before: deletedFeatures,
          });
        } catch (error) {
          console.warn('Erro ao criar transação para limpeza de órfãs:', error);
        }
      }

      console.log(`${deletedIds.length} features órfãs foram removidas`);
      invalidateAll();
    },
    onError: error => {
      console.error('Erro ao limpar features órfãs:', error);
    },
  });
};

// Hook para invalidar queries (utilitário)
export const useInvalidateFeatures = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.all });
    },

    invalidateDetail: (id: string) => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) });
    },

    invalidateByLayer: (layerId: string) => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.byLayer(layerId) });
    },

    invalidateStats: (layerId: string) => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.stats(layerId) });
    },
  };
};
