// Path: features\data-access\hooks\useMutateFeature.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExtendedFeature } from '../schemas/feature.schema';
import { IndexedDBFeatureRepository } from '../repositories/implementations/IndexedDBFeatureRepository';
import { FEATURE_QUERY_KEYS, useInvalidateFeatures } from './useFeatures';

// Instância do repository
const featureRepository = new IndexedDBFeatureRepository();

// Hook para criar feature
export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();

  return useMutation({
    mutationFn: (feature: ExtendedFeature) => featureRepository.create(feature),
    onSuccess: (newFeature) => {
      // Atualizar cache otimisticamente
      queryClient.setQueryData(
        FEATURE_QUERY_KEYS.detail(newFeature.id),
        newFeature
      );

      // Invalidar queries relacionadas
      invalidateAll();
      invalidateByLayer(newFeature.properties.layerId);
      invalidateStats(newFeature.properties.layerId);
    },
    onError: (error) => {
      console.error('Erro ao criar feature:', error);
    },
  });
};

// Hook para atualizar feature
export const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateDetail, invalidateByLayer, invalidateStats } = useInvalidateFeatures();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ExtendedFeature> }) =>
      featureRepository.update(id, updates),
    onSuccess: (updatedFeature, { id }) => {
      // Atualizar cache
      queryClient.setQueryData(
        FEATURE_QUERY_KEYS.detail(id),
        updatedFeature
      );

      // Invalidar queries relacionadas
      invalidateDetail(id);
      invalidateByLayer(updatedFeature.properties.layerId);
      invalidateStats(updatedFeature.properties.layerId);
    },
    onError: (error) => {
      console.error('Erro ao atualizar feature:', error);
    },
  });
};

// Hook para deletar feature
export const useDeleteFeature = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();

  return useMutation({
    mutationFn: (id: string) => featureRepository.delete(id),
    onMutate: async (id) => {
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
    onError: (error, id, context) => {
      // Reverter em caso de erro
      if (context?.previousFeature) {
        queryClient.setQueryData(
          FEATURE_QUERY_KEYS.detail(id),
          context.previousFeature
        );
      }
      console.error('Erro ao deletar feature:', error);
    },
    onSettled: (data, error, id, context) => {
      // Invalidar queries relacionadas
      if (context?.previousFeature) {
        invalidateAll();
        invalidateByLayer(context.previousFeature.properties.layerId);
        invalidateStats(context.previousFeature.properties.layerId);
      }
    },
  });
};

// Hook para criar múltiplas features
export const useCreateManyFeatures = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateFeatures();

  return useMutation({
    mutationFn: (features: ExtendedFeature[]) => featureRepository.createMany(features),
    onSuccess: (newFeatures) => {
      // Atualizar cache para cada feature
      newFeatures.forEach(feature => {
        queryClient.setQueryData(
          FEATURE_QUERY_KEYS.detail(feature.id),
          feature
        );
      });

      // Invalidar todas as queries
      invalidateAll();
    },
    onError: (error) => {
      console.error('Erro ao criar múltiplas features:', error);
    },
  });
};

// Hook para deletar múltiplas features
export const useDeleteManyFeatures = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateFeatures();

  return useMutation({
    mutationFn: (ids: string[]) => featureRepository.deleteMany(ids),
    onMutate: async (ids) => {
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
    onError: (error, ids, context) => {
      // Reverter em caso de erro
      context?.previousFeatures.forEach(({ id, feature }) => {
        if (feature) {
          queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(id), feature);
        }
      });
      console.error('Erro ao deletar múltiplas features:', error);
    },
    onSettled: () => {
      // Invalidar todas as queries
      invalidateAll();
    },
  });
};

// Hook para mover features entre camadas
export const useMoveFeaturesToLayer = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();

  return useMutation({
    mutationFn: ({ featureIds, targetLayerId }: { featureIds: string[]; targetLayerId: string }) =>
      featureRepository.moveToLayer(featureIds, targetLayerId),
    onSuccess: (updatedFeatures, { targetLayerId }) => {
      // Atualizar cache para cada feature
      updatedFeatures.forEach(feature => {
        queryClient.setQueryData(
          FEATURE_QUERY_KEYS.detail(feature.id),
          feature
        );
      });

      // Invalidar queries relacionadas
      invalidateAll();
      invalidateByLayer(targetLayerId);
      invalidateStats(targetLayerId);

      // Invalidar estatísticas das camadas origem (se diferentes)
      const sourceLayerIds = new Set(
        updatedFeatures.map(f => f.properties.layerId).filter(id => id !== targetLayerId)
      );
      sourceLayerIds.forEach(layerId => {
        invalidateByLayer(layerId);
        invalidateStats(layerId);
      });
    },
    onError: (error) => {
      console.error('Erro ao mover features:', error);
    },
  });
};

// Hook para duplicar features
export const useDuplicateFeatures = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();

  return useMutation({
    mutationFn: ({ featureIds, targetLayerId }: { featureIds: string[]; targetLayerId?: string }) =>
      featureRepository.duplicate(featureIds, targetLayerId),
    onSuccess: (duplicatedFeatures) => {
      // Atualizar cache para cada feature duplicada
      duplicatedFeatures.forEach(feature => {
        queryClient.setQueryData(
          FEATURE_QUERY_KEYS.detail(feature.id),
          feature
        );
      });

      // Invalidar queries relacionadas
      invalidateAll();
      const layerIds = new Set(duplicatedFeatures.map(f => f.properties.layerId));
      layerIds.forEach(layerId => {
        invalidateByLayer(layerId);
        invalidateStats(layerId);
      });
    },
    onError: (error) => {
      console.error('Erro ao duplicar features:', error);
    },
  });
};

// Hook para validar feature
export const useValidateFeature = () => {
  return useMutation({
    mutationFn: (feature: ExtendedFeature) => featureRepository.validateFeature(feature),
    onError: (error) => {
      console.error('Erro ao validar feature:', error);
    },
  });
};

// Hook para limpar features órfãs
export const useCleanOrphanedFeatures = () => {
  const { invalidateAll } = useInvalidateFeatures();

  return useMutation({
    mutationFn: () => featureRepository.cleanOrphanedFeatures(),
    onSuccess: (orphanedIds) => {
      console.log(`${orphanedIds.length} features órfãs foram removidas`);
      invalidateAll();
    },
    onError: (error) => {
      console.error('Erro ao limpar features órfãs:', error);
    },
  });
};