// Path: features\data-access\hooks\useMutateFeature.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExtendedFeature } from '../schemas/feature.schema';
import { IndexedDBFeatureRepository } from '../repositories/implementations/IndexedDBFeatureRepository';
import { FEATURE_QUERY_KEYS } from './useFeatures';
import { useUndoRedo } from '../../transaction-history/hooks/useUndoRedo';

// Instância do repository correto
const featureRepository = new IndexedDBFeatureRepository();

// Interface para invalidação de features
interface FeatureInvalidation {
  invalidateAll: () => void;
  invalidateByLayer: (layerId: string) => void;
  invalidateDetail: (id: string) => void;
}

// Hook para invalidar queries de features
export const useInvalidateFeatures = (): FeatureInvalidation => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.all });
    },
    invalidateByLayer: (layerId: string) => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.byLayer(layerId) });
    },
    invalidateDetail: (id: string) => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) });
    },
  };
};

// Hook para criar feature
export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  const { addTransaction } = useUndoRedo();
  const invalidateFeatures = useInvalidateFeatures();

  return useMutation({
    mutationFn: async (feature: ExtendedFeature) => {
      const createdFeature = await featureRepository.create(feature);

      // Adicionar transação para undo/redo
      addTransaction({
        type: 'create',
        description: `Criar feature`,
        after: createdFeature,
      });

      return createdFeature;
    },
    onSuccess: feature => {
      invalidateFeatures.invalidateAll();
      invalidateFeatures.invalidateByLayer(feature.properties.layerId);
    },
  });
};

// Hook para criar múltiplas features
export const useCreateManyFeatures = () => {
  const queryClient = useQueryClient();
  const { addTransaction } = useUndoRedo();
  const invalidateFeatures = useInvalidateFeatures();

  return useMutation({
    mutationFn: async (features: ExtendedFeature[]) => {
      const createdFeatures = await featureRepository.createMany(features);

      // Adicionar transação para undo/redo
      addTransaction({
        type: 'create',
        description: `Criar ${features.length} features`,
        after: createdFeatures,
      });

      return createdFeatures;
    },
    onSuccess: features => {
      invalidateFeatures.invalidateAll();
      const layerIds = new Set(features.map(f => f.properties.layerId));
      layerIds.forEach(layerId => invalidateFeatures.invalidateByLayer(layerId));
    },
  });
};

// Hook para atualizar feature
export const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  const { addTransaction } = useUndoRedo();
  const invalidateFeatures = useInvalidateFeatures();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ExtendedFeature> }) => {
      // Buscar estado anterior para undo
      const beforeFeature = await featureRepository.getById(id);

      const updatedFeature = await featureRepository.update(id, updates);

      // Adicionar transação para undo/redo
      if (beforeFeature) {
        addTransaction({
          type: 'update',
          description: `Atualizar feature`,
          before: beforeFeature,
          after: updatedFeature,
        });
      }

      return updatedFeature;
    },
    onSuccess: feature => {
      invalidateFeatures.invalidateAll();
      invalidateFeatures.invalidateByLayer(feature.properties.layerId);
      invalidateFeatures.invalidateDetail(feature.id);
    },
  });
};

// Hook para atualizar múltiplas features
export const useUpdateManyFeatures = () => {
  const queryClient = useQueryClient();
  const { addTransaction } = useUndoRedo();
  const invalidateFeatures = useInvalidateFeatures();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: Partial<ExtendedFeature> }>) => {
      // Buscar estados anteriores para undo
      const beforeFeatures: ExtendedFeature[] = [];
      for (const { id } of updates) {
        const feature = await featureRepository.getById(id);
        if (feature) beforeFeatures.push(feature);
      }

      const updatedFeatures = await featureRepository.updateMany(updates);

      // Adicionar transação para undo/redo
      if (beforeFeatures.length > 0) {
        addTransaction({
          type: 'update',
          description: `Atualizar ${updates.length} features`,
          before: beforeFeatures,
          after: updatedFeatures,
        });
      }

      return updatedFeatures;
    },
    onSuccess: features => {
      invalidateFeatures.invalidateAll();
      const layerIds = new Set(features.map(f => f.properties.layerId));
      layerIds.forEach(layerId => invalidateFeatures.invalidateByLayer(layerId));
      features.forEach(f => invalidateFeatures.invalidateDetail(f.id));
    },
  });
};

// Hook para deletar feature
export const useDeleteFeature = () => {
  const queryClient = useQueryClient();
  const { addTransaction } = useUndoRedo();
  const invalidateFeatures = useInvalidateFeatures();

  return useMutation({
    mutationFn: async (id: string) => {
      // Buscar feature antes de deletar para undo
      const beforeFeature = await featureRepository.getById(id);

      await featureRepository.delete(id);

      // Adicionar transação para undo/redo
      if (beforeFeature) {
        addTransaction({
          type: 'delete',
          description: `Deletar feature`,
          before: beforeFeature,
        });
      }

      return id;
    },
    onSuccess: (id, variables) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) });
      invalidateFeatures.invalidateAll();
    },
  });
};

// Hook para deletar múltiplas features
export const useDeleteManyFeatures = () => {
  const queryClient = useQueryClient();
  const { addTransaction } = useUndoRedo();
  const invalidateFeatures = useInvalidateFeatures();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      // Buscar features antes de deletar para undo
      const beforeFeatures: ExtendedFeature[] = [];
      for (const id of ids) {
        const feature = await featureRepository.getById(id);
        if (feature) beforeFeatures.push(feature);
      }

      await featureRepository.deleteMany(ids);

      // Adicionar transação para undo/redo
      if (beforeFeatures.length > 0) {
        addTransaction({
          type: 'delete',
          description: `Deletar ${ids.length} features`,
          before: beforeFeatures,
        });
      }

      return ids;
    },
    onSuccess: ids => {
      // Remover do cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) });
      });
      invalidateFeatures.invalidateAll();
    },
  });
};

// Hook para mover features para outra camada
export const useMoveFeaturesToLayer = () => {
  const queryClient = useQueryClient();
  const { addTransaction } = useUndoRedo();
  const invalidateFeatures = useInvalidateFeatures();

  return useMutation({
    mutationFn: async ({
      featureIds,
      targetLayerId,
    }: {
      featureIds: string[];
      targetLayerId: string;
    }) => {
      // Buscar estados anteriores para undo
      const beforeFeatures: ExtendedFeature[] = [];
      for (const id of featureIds) {
        const feature = await featureRepository.getById(id);
        if (feature) beforeFeatures.push(feature);
      }

      const movedFeatures = await featureRepository.moveToLayer(featureIds, targetLayerId);

      // Adicionar transação para undo/redo
      if (beforeFeatures.length > 0) {
        addTransaction({
          type: 'update',
          description: `Mover ${featureIds.length} features para camada`,
          before: beforeFeatures,
          after: movedFeatures,
        });
      }

      return movedFeatures;
    },
    onSuccess: features => {
      invalidateFeatures.invalidateAll();
      const layerIds = new Set(features.map(f => f.properties.layerId));
      layerIds.forEach(layerId => invalidateFeatures.invalidateByLayer(layerId));
      features.forEach(f => invalidateFeatures.invalidateDetail(f.id));
    },
  });
};
