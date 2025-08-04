// Path: features\data-access\hooks\useLayers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayerConfig } from '../schemas/layer.schema';
import { IndexedDBLayerRepository } from '../repositories/implementations/IndexedDBLayerRepository';

// Instância do repository
const layerRepository = new IndexedDBLayerRepository();

// Chaves de query
export const LAYER_QUERY_KEYS = {
  all: ['layers'] as const,
  lists: () => [...LAYER_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...LAYER_QUERY_KEYS.lists(), filters] as const,
  details: () => [...LAYER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...LAYER_QUERY_KEYS.details(), id] as const,
  visible: () => [...LAYER_QUERY_KEYS.all, 'visible'] as const,
  stats: (id: string) => [...LAYER_QUERY_KEYS.all, 'stats', id] as const,
};

// Hook para buscar todas as camadas
export const useLayers = () => {
  return useQuery({
    queryKey: LAYER_QUERY_KEYS.lists(),
    queryFn: () => layerRepository.getAll(),
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });
};

// Hook para buscar camada por ID
export const useLayer = (id: string) => {
  return useQuery({
    queryKey: LAYER_QUERY_KEYS.detail(id),
    queryFn: () => layerRepository.getById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minuto
  });
};

// Hook para buscar camadas visíveis
export const useVisibleLayers = () => {
  return useQuery({
    queryKey: LAYER_QUERY_KEYS.visible(),
    queryFn: () => layerRepository.getVisibleLayers(),
    staleTime: 30000,
  });
};

// Hook para estatísticas da camada
export const useLayerStats = (id: string) => {
  return useQuery({
    queryKey: LAYER_QUERY_KEYS.stats(id),
    queryFn: () => layerRepository.getLayerStats(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

// Hook para contagem de camadas
export const useLayerCount = () => {
  return useQuery({
    queryKey: [...LAYER_QUERY_KEYS.all, 'count'],
    queryFn: () => layerRepository.count(),
    staleTime: 60000,
  });
};

// Hook para invalidar queries relacionadas
export const useInvalidateLayers = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: LAYER_QUERY_KEYS.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: LAYER_QUERY_KEYS.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: LAYER_QUERY_KEYS.detail(id) }),
    invalidateVisible: () =>
      queryClient.invalidateQueries({ queryKey: LAYER_QUERY_KEYS.visible() }),
    invalidateStats: (id: string) =>
      queryClient.invalidateQueries({ queryKey: LAYER_QUERY_KEYS.stats(id) }),
  };
};

// Hook para criar camada
export const useCreateLayer = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateLayers();

  return useMutation({
    mutationFn: (layer: LayerConfig) => layerRepository.create(layer),
    onSuccess: newLayer => {
      // Atualizar cache otimisticamente
      queryClient.setQueryData(LAYER_QUERY_KEYS.detail(newLayer.id), newLayer);

      // Invalidar queries relacionadas
      invalidateAll();
    },
    onError: error => {
      console.error('Erro ao criar camada:', error);
    },
  });
};

// Hook para atualizar camada
export const useUpdateLayer = () => {
  const queryClient = useQueryClient();
  const { invalidateDetail, invalidateList, invalidateVisible } = useInvalidateLayers();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LayerConfig> }) =>
      layerRepository.update(id, updates),
    onSuccess: (updatedLayer, { id }) => {
      // Atualizar cache
      queryClient.setQueryData(LAYER_QUERY_KEYS.detail(id), updatedLayer);

      // Invalidar queries relacionadas
      invalidateDetail(id);
      invalidateList();
      invalidateVisible();
    },
    onError: error => {
      console.error('Erro ao atualizar camada:', error);
    },
  });
};

// Hook para deletar camada
export const useDeleteLayer = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateLayers();

  return useMutation({
    mutationFn: (id: string) => layerRepository.delete(id),
    onMutate: async id => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: LAYER_QUERY_KEYS.detail(id) });

      // Snapshot do estado anterior
      const previousLayer = queryClient.getQueryData<LayerConfig>(LAYER_QUERY_KEYS.detail(id));

      // Atualizar cache otimisticamente
      queryClient.removeQueries({ queryKey: LAYER_QUERY_KEYS.detail(id) });

      return { previousLayer };
    },
    onError: (error, id, context) => {
      // Reverter em caso de erro
      if (context?.previousLayer) {
        queryClient.setQueryData(LAYER_QUERY_KEYS.detail(id), context.previousLayer);
      }
      console.error('Erro ao deletar camada:', error);
    },
    onSettled: () => {
      // Invalidar queries relacionadas
      invalidateAll();
    },
  });
};

// Hook para deletar camada com features
export const useDeleteLayerWithFeatures = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateLayers();

  return useMutation({
    mutationFn: (id: string) => layerRepository.deleteWithFeatures(id),
    onSuccess: () => {
      // Invalidar todas as queries (camadas e features)
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
    onError: error => {
      console.error('Erro ao deletar camada com features:', error);
    },
  });
};

// Hook para alternar visibilidade da camada
export const useToggleLayerVisibility = () => {
  const queryClient = useQueryClient();
  const { invalidateDetail, invalidateVisible } = useInvalidateLayers();

  return useMutation({
    mutationFn: (id: string) => layerRepository.toggleVisibility(id),
    onSuccess: updatedLayer => {
      // Atualizar cache
      queryClient.setQueryData(LAYER_QUERY_KEYS.detail(updatedLayer.id), updatedLayer);

      // Invalidar queries relacionadas
      invalidateDetail(updatedLayer.id);
      invalidateVisible();
    },
    onError: error => {
      console.error('Erro ao alternar visibilidade da camada:', error);
    },
  });
};

// Hook para atualizar opacidade da camada
export const useUpdateLayerOpacity = () => {
  const queryClient = useQueryClient();
  const { invalidateDetail } = useInvalidateLayers();

  return useMutation({
    mutationFn: ({ id, opacity }: { id: string; opacity: number }) =>
      layerRepository.updateOpacity(id, opacity),
    onSuccess: updatedLayer => {
      // Atualizar cache
      queryClient.setQueryData(LAYER_QUERY_KEYS.detail(updatedLayer.id), updatedLayer);

      // Invalidar query específica
      invalidateDetail(updatedLayer.id);
    },
    onError: error => {
      console.error('Erro ao atualizar opacidade da camada:', error);
    },
  });
};

// Hook para reordenar camadas
export const useReorderLayers = () => {
  const { invalidateAll } = useInvalidateLayers();

  return useMutation({
    mutationFn: (layerIds: string[]) => layerRepository.reorder(layerIds),
    onSuccess: () => {
      // Invalidar todas as queries de camadas
      invalidateAll();
    },
    onError: error => {
      console.error('Erro ao reordenar camadas:', error);
    },
  });
};

// Hook para duplicar camada
export const useDuplicateLayer = () => {
  const { invalidateAll } = useInvalidateLayers();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      layerRepository.duplicate(id, newName),
    onSuccess: () => {
      // Invalidar todas as queries
      invalidateAll();
    },
    onError: error => {
      console.error('Erro ao duplicar camada:', error);
    },
  });
};

// Hook para verificar se pode deletar camada
export const useCanDeleteLayer = (id: string) => {
  return useQuery({
    queryKey: [...LAYER_QUERY_KEYS.all, 'canDelete', id],
    queryFn: () => layerRepository.canDelete(id),
    enabled: !!id,
    staleTime: 10000, // 10 segundos
  });
};

// Hook para obter próximo zIndex
export const useNextZIndex = () => {
  return useQuery({
    queryKey: [...LAYER_QUERY_KEYS.all, 'nextZIndex'],
    queryFn: () => layerRepository.getNextZIndex(),
    staleTime: 30000,
  });
};
