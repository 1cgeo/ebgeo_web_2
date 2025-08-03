// Path: features\data-access\hooks\useMaps.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapConfig } from '../schemas/map.schema';
import { IndexedDBMapRepository } from '../repositories/implementations/IndexedDBMapRepository';

// Instância do repository
const mapRepository = new IndexedDBMapRepository();

// Chaves de query
export const MAP_QUERY_KEYS = {
  all: ['maps'] as const,
  lists: () => [...MAP_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...MAP_QUERY_KEYS.lists(), filters] as const,
  details: () => [...MAP_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MAP_QUERY_KEYS.details(), id] as const,
  withLayers: (id: string) => [...MAP_QUERY_KEYS.all, 'withLayers', id] as const,
  stats: (id: string) => [...MAP_QUERY_KEYS.all, 'stats', id] as const,
  validation: (id: string) => [...MAP_QUERY_KEYS.all, 'validation', id] as const,
};

// Hook para buscar todos os mapas
export const useMaps = () => {
  return useQuery({
    queryKey: MAP_QUERY_KEYS.lists(),
    queryFn: () => mapRepository.getAll(),
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });
};

// Hook para buscar mapa por ID
export const useMap = (id: string) => {
  return useQuery({
    queryKey: MAP_QUERY_KEYS.detail(id),
    queryFn: () => mapRepository.getById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minuto
  });
};

// Hook para buscar mapa com suas camadas
export const useMapWithLayers = (id: string) => {
  return useQuery({
    queryKey: MAP_QUERY_KEYS.withLayers(id),
    queryFn: () => mapRepository.getWithLayers(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook para estatísticas do mapa
export const useMapStats = (id: string) => {
  return useQuery({
    queryKey: MAP_QUERY_KEYS.stats(id),
    queryFn: () => mapRepository.getMapStats(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

// Hook para validação do mapa
export const useMapValidation = (id: string) => {
  return useQuery({
    queryKey: MAP_QUERY_KEYS.validation(id),
    queryFn: () => mapRepository.validateMap(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook para contagem de mapas
export const useMapCount = () => {
  return useQuery({
    queryKey: [...MAP_QUERY_KEYS.all, 'count'],
    queryFn: () => mapRepository.count(),
    staleTime: 60000,
  });
};

// Hook para verificar se pode deletar mapa
export const useCanDeleteMap = (id: string) => {
  return useQuery({
    queryKey: [...MAP_QUERY_KEYS.all, 'canDelete', id],
    queryFn: () => mapRepository.canDelete(id),
    enabled: !!id,
    staleTime: 10000, // 10 segundos
  });
};

// Hook para garantir mapa padrão
export const useEnsureDefaultMap = () => {
  return useQuery({
    queryKey: [...MAP_QUERY_KEYS.all, 'ensureDefault'],
    queryFn: () => mapRepository.ensureDefaultMap(),
    staleTime: 300000, // 5 minutos
  });
};

// Hook para invalidar queries relacionadas
export const useInvalidateMaps = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEYS.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEYS.lists() }),
    invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEYS.detail(id) }),
    invalidateWithLayers: (id: string) => queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEYS.withLayers(id) }),
    invalidateStats: (id: string) => queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEYS.stats(id) }),
    invalidateValidation: (id: string) => queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEYS.validation(id) }),
  };
};

// Hook para prefetch de dados
export const usePrefetchMaps = () => {
  const queryClient = useQueryClient();

  return {
    prefetchAll: () => queryClient.prefetchQuery({
      queryKey: MAP_QUERY_KEYS.lists(),
      queryFn: () => mapRepository.getAll(),
      staleTime: 30000,
    }),
    prefetchWithLayers: (id: string) => queryClient.prefetchQuery({
      queryKey: MAP_QUERY_KEYS.withLayers(id),
      queryFn: () => mapRepository.getWithLayers(id),
      staleTime: 30000,
    }),
  };
};

// Hook para criar mapa
export const useCreateMap = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateMaps();

  return useMutation({
    mutationFn: (map: MapConfig) => mapRepository.create(map),
    onSuccess: (newMap) => {
      // Atualizar cache otimisticamente
      queryClient.setQueryData(
        MAP_QUERY_KEYS.detail(newMap.id),
        newMap
      );

      // Invalidar queries relacionadas
      invalidateAll();
    },
    onError: (error) => {
      console.error('Erro ao criar mapa:', error);
    },
  });
};

// Hook para atualizar mapa
export const useUpdateMap = () => {
  const queryClient = useQueryClient();
  const { invalidateDetail, invalidateList, invalidateWithLayers, invalidateStats } = useInvalidateMaps();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MapConfig> }) =>
      mapRepository.update(id, updates),
    onSuccess: (updatedMap, { id }) => {
      // Atualizar cache
      queryClient.setQueryData(
        MAP_QUERY_KEYS.detail(id),
        updatedMap
      );

      // Invalidar queries relacionadas
      invalidateDetail(id);
      invalidateList();
      invalidateWithLayers(id);
      invalidateStats(id);
    },
    onError: (error) => {
      console.error('Erro ao atualizar mapa:', error);
    },
  });
};

// Hook para deletar mapa
export const useDeleteMap = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateMaps();

  return useMutation({
    mutationFn: (id: string) => mapRepository.delete(id),
    onMutate: async (id) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: MAP_QUERY_KEYS.detail(id) });

      // Snapshot do estado anterior
      const previousMap = queryClient.getQueryData<MapConfig>(
        MAP_QUERY_KEYS.detail(id)
      );

      // Atualizar cache otimisticamente
      queryClient.removeQueries({ queryKey: MAP_QUERY_KEYS.detail(id) });

      return { previousMap };
    },
    onError: (error, id, context) => {
      // Reverter em caso de erro
      if (context?.previousMap) {
        queryClient.setQueryData(
          MAP_QUERY_KEYS.detail(id),
          context.previousMap
        );
      }
      console.error('Erro ao deletar mapa:', error);
    },
    onSettled: () => {
      // Invalidar queries relacionadas
      invalidateAll();
    },
  });
};

// Hook para duplicar mapa
export const useDuplicateMap = () => {
  const { invalidateAll } = useInvalidateMaps();

  return useMutation({
    mutationFn: ({ id, newName, includeFeatures = false }: { 
      id: string; 
      newName: string; 
      includeFeatures?: boolean; 
    }) => mapRepository.duplicate(id, newName, includeFeatures),
    onSuccess: () => {
      // Invalidar todas as queries
      invalidateAll();
      // Também invalidar layers e features se includeFeatures = true
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
    onError: (error) => {
      console.error('Erro ao duplicar mapa:', error);
    },
  });
};

// Hook para adicionar camada ao mapa
export const useAddLayerToMap = () => {
  const queryClient = useQueryClient();
  const { invalidateDetail, invalidateWithLayers, invalidateStats } = useInvalidateMaps();

  return useMutation({
    mutationFn: ({ mapId, layerId }: { mapId: string; layerId: string }) =>
      mapRepository.addLayer(mapId, layerId),
    onSuccess: (updatedMap) => {
      // Atualizar cache
      queryClient.setQueryData(
        MAP_QUERY_KEYS.detail(updatedMap.id),
        updatedMap
      );

      // Invalidar queries relacionadas
      invalidateDetail(updatedMap.id);
      invalidateWithLayers(updatedMap.id);
      invalidateStats(updatedMap.id);
    },
    onError: (error) => {
      console.error('Erro ao adicionar camada ao mapa:', error);
    },
  });
};

// Hook para remover camada do mapa
export const useRemoveLayerFromMap = () => {
  const queryClient = useQueryClient();
  const { invalidateDetail, invalidateWithLayers, invalidateStats } = useInvalidateMaps();

  return useMutation({
    mutationFn: ({ mapId, layerId }: { mapId: string; layerId: string }) =>
      mapRepository.removeLayer(mapId, layerId),
    onSuccess: (updatedMap) => {
      // Atualizar cache
      queryClient.setQueryData(
        MAP_QUERY_KEYS.detail(updatedMap.id),
        updatedMap
      );

      // Invalidar queries relacionadas
      invalidateDetail(updatedMap.id);
      invalidateWithLayers(updatedMap.id);
      invalidateStats(updatedMap.id);
    },
    onError: (error) => {
      console.error('Erro ao remover camada do mapa:', error);
    },
  });
};

// Hook para reordenar camadas no mapa
export const useReorderMapLayers = () => {
  const queryClient = useQueryClient();
  const { invalidateDetail, invalidateWithLayers } = useInvalidateMaps();

  return useMutation({
    mutationFn: ({ mapId, layerIds }: { mapId: string; layerIds: string[] }) =>
      mapRepository.reorderLayers(mapId, layerIds),
    onSuccess: (updatedMap) => {
      // Atualizar cache
      queryClient.setQueryData(
        MAP_QUERY_KEYS.detail(updatedMap.id),
        updatedMap
      );

      // Invalidar queries relacionadas
      invalidateDetail(updatedMap.id);
      invalidateWithLayers(updatedMap.id);
    },
    onError: (error) => {
      console.error('Erro ao reordenar camadas:', error);
    },
  });
};

// Hook para atualizar viewport do mapa
export const useUpdateMapViewport = () => {
  const queryClient = useQueryClient();
  const { invalidateDetail } = useInvalidateMaps();

  return useMutation({
    mutationFn: ({ id, center, zoom }: { 
      id: string; 
      center: [number, number]; 
      zoom: number; 
    }) => mapRepository.updateViewport(id, center, zoom),
    onSuccess: (updatedMap) => {
      // Atualizar cache
      queryClient.setQueryData(
        MAP_QUERY_KEYS.detail(updatedMap.id),
        updatedMap
      );

      // Invalidar query específica
      invalidateDetail(updatedMap.id);
    },
    onError: (error) => {
      console.error('Erro ao atualizar viewport:', error);
    },
  });
};

// Hook para limpar referências de camadas deletadas
export const useCleanupLayerReferences = () => {
  const { invalidateAll } = useInvalidateMaps();

  return useMutation({
    mutationFn: (deletedLayerId: string) => mapRepository.cleanupLayerReferences(deletedLayerId),
    onSuccess: () => {
      // Invalidar todas as queries de mapas
      invalidateAll();
    },
    onError: (error) => {
      console.error('Erro ao limpar referências de camadas:', error);
    },
  });
};

// Hook para exportar dados do mapa
export const useExportMapData = () => {
  return useMutation({
    mutationFn: (id: string) => mapRepository.exportMapData(id),
    onError: (error) => {
      console.error('Erro ao exportar dados do mapa:', error);
    },
  });
};