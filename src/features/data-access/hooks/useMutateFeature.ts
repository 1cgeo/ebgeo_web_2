// Path: features\data-access\hooks\useMutateFeature.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExtendedFeature } from '../schemas/feature.schema';
import { IndexedDBMapRepository } from '../repositories/implementations/IndexedDBMapRepository';
import { FEATURE_QUERY_KEYS } from './useFeatures';

// Instância do repository (usando o correto que existe)
const featureRepository = new IndexedDBMapRepository();

// Interface para invalidação de features
interface FeatureInvalidation {
  invalidateAll: () => void;
  invalidateByLayer: (layerId: string) => void;
  invalidateStats: (layerId: string) => void;
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
    invalidateStats: (layerId: string) => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.stats(layerId) });
    },
    invalidateDetail: (id: string) => {
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) });
    },
  };
};

// Interface para opções de transação (placeholder até corrigir transaction-history)
interface CreateTransactionOptions {
  type: 'create' | 'update' | 'delete' | 'batch';
  description: string;
  before?: ExtendedFeature | ExtendedFeature[];
  after?: ExtendedFeature | ExtendedFeature[];
}

// Placeholder para useUndoRedo até corrigir o arquivo
const useUndoRedo = () => ({
  createTransaction: (options: CreateTransactionOptions) => {
    console.log('Transaction placeholder:', options.description);
  },
});

// Hook para criar feature
export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: async (feature: ExtendedFeature): Promise<ExtendedFeature> => {
      // Simular criação até ter o repository correto
      const createdFeature: ExtendedFeature = {
        ...feature,
        id: feature.id || `feature-${Date.now()}`,
        properties: {
          ...feature.properties,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      return createdFeature;
    },
    onSuccess: (newFeature: ExtendedFeature) => {
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
    onError: (error: Error) => {
      console.error('Erro ao criar feature:', error);
    },
  });
};

// Hook para atualizar feature
export const useUpdateFeature = () => {
  const queryClient = useQueryClient();
  const { invalidateDetail, invalidateByLayer, invalidateStats } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<ExtendedFeature> 
    }): Promise<{ previous: ExtendedFeature; updated: ExtendedFeature }> => {
      // Buscar estado anterior para a transação
      const previousFeature = queryClient.getQueryData<ExtendedFeature>(
        FEATURE_QUERY_KEYS.detail(id)
      );
      
      if (!previousFeature) {
        throw new Error(`Feature com ID ${id} não encontrada`);
      }

      const updatedFeature: ExtendedFeature = {
        ...previousFeature,
        ...updates,
        properties: {
          ...previousFeature.properties,
          ...updates.properties,
          updatedAt: new Date().toISOString(),
        },
      };

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
    onError: (error: Error) => {
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
    mutationFn: async (id: string): Promise<ExtendedFeature> => {
      // Buscar feature antes de deletar para a transação
      const featureToDelete = queryClient.getQueryData<ExtendedFeature>(
        FEATURE_QUERY_KEYS.detail(id)
      );
      
      if (!featureToDelete) {
        throw new Error(`Feature com ID ${id} não encontrada`);
      }

      // Simular deleção
      return featureToDelete;
    },
    onMutate: async (id: string) => {
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
    onSuccess: (deletedFeature: ExtendedFeature) => {
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
    onError: (error: Error, id: string, context) => {
      console.error('Erro ao deletar feature:', error);
      
      // Reverter mudanças otimistas se houve erro
      if (context?.previousFeature) {
        queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(id), context.previousFeature);
      }
    },
  });
};

// Hook para deletar múltiplas features
export const useDeleteManyFeatures = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: async (featureIds: string[]): Promise<ExtendedFeature[]> => {
      const featuresToDelete: ExtendedFeature[] = [];
      
      for (const id of featureIds) {
        const feature = queryClient.getQueryData<ExtendedFeature>(
          FEATURE_QUERY_KEYS.detail(id)
        );
        if (feature) {
          featuresToDelete.push(feature);
        }
      }

      if (featuresToDelete.length === 0) {
        throw new Error('Nenhuma feature encontrada para deletar');
      }

      return featuresToDelete;
    },
    onSuccess: (deletedFeatures: ExtendedFeature[]) => {
      // Criar transação para undo/redo
      try {
        const description = deletedFeatures.length === 1
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

      // Remover do cache
      deletedFeatures.forEach(feature => {
        queryClient.removeQueries({ queryKey: FEATURE_QUERY_KEYS.detail(feature.id) });
      });

      // Invalidar queries das camadas afetadas
      const affectedLayers = new Set(deletedFeatures.map(f => f.properties.layerId));
      
      affectedLayers.forEach(layerId => {
        invalidateByLayer(layerId);
        invalidateStats(layerId);
      });

      invalidateAll();
    },
    onError: (error: Error) => {
      console.error('Erro ao deletar features:', error);
    },
  });
};

// Hook para mover features para outra camada
export const useMoveFeaturesToLayer = () => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateByLayer, invalidateStats } = useInvalidateFeatures();
  const { createTransaction } = useUndoRedo();

  return useMutation({
    mutationFn: async ({ 
      featureIds, 
      targetLayerId 
    }: { 
      featureIds: string[]; 
      targetLayerId: string 
    }): Promise<{ previous: ExtendedFeature[]; updated: ExtendedFeature[] }> => {
      const previousFeatures: ExtendedFeature[] = [];
      const updatedFeatures: ExtendedFeature[] = [];

      for (const id of featureIds) {
        const feature = queryClient.getQueryData<ExtendedFeature>(
          FEATURE_QUERY_KEYS.detail(id)
        );
        
        if (feature) {
          previousFeatures.push(feature);
          updatedFeatures.push({
            ...feature,
            properties: {
              ...feature.properties,
              layerId: targetLayerId,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      }

      return { previous: previousFeatures, updated: updatedFeatures };
    },
    onSuccess: ({ previous, updated }, { targetLayerId }) => {
      // Criar transação para undo/redo
      try {
        const description = updated.length === 1
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
    onError: (error: Error) => {
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
    mutationFn: async ({ 
      featureIds, 
      targetLayerId 
    }: { 
      featureIds: string[]; 
      targetLayerId?: string 
    }): Promise<ExtendedFeature[]> => {
      const duplicatedFeatures: ExtendedFeature[] = [];

      for (const id of featureIds) {
        const originalFeature = queryClient.getQueryData<ExtendedFeature>(
          FEATURE_QUERY_KEYS.detail(id)
        );
        
        if (originalFeature) {
          const duplicatedFeature: ExtendedFeature = {
            ...originalFeature,
            id: `${originalFeature.id}-copy-${Date.now()}`,
            properties: {
              ...originalFeature.properties,
              layerId: targetLayerId || originalFeature.properties.layerId,
              name: originalFeature.properties.name 
                ? `${originalFeature.properties.name} (Cópia)`
                : undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          };
          duplicatedFeatures.push(duplicatedFeature);
        }
      }

      return duplicatedFeatures;
    },
    onSuccess: (duplicatedFeatures: ExtendedFeature[]) => {
      // Criar transação para undo/redo
      try {
        const description = duplicatedFeatures.length === 1
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
    onError: (error: Error) => {
      console.error('Erro ao duplicar features:', error);
    },
  });
};

// Hook para validar feature (placeholder)
export const useValidateFeature = () => {
  return useMutation({
    mutationFn: async (feature: ExtendedFeature): Promise<{ valid: boolean; errors: string[] }> => {
      // Validação básica
      const errors: string[] = [];
      
      if (!feature.id) {
        errors.push('Feature deve ter um ID');
      }
      
      if (!feature.properties.layerId) {
        errors.push('Feature deve ter um layerId');
      }
      
      if (!feature.geometry) {
        errors.push('Feature deve ter geometria');
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    onError: (error: Error) => {
      console.error('Erro ao validar feature:', error);
    },
  });
};