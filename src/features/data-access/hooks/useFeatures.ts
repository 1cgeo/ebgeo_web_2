// Path: features\data-access\hooks\useFeatures.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExtendedFeature } from '../schemas/feature.schema';
import { IndexedDBFeatureRepository } from '../repositories/implementations/IndexedDBFeatureRepository';

// Instância do repository
const featureRepository = new IndexedDBFeatureRepository();

// Chaves de query
export const FEATURE_QUERY_KEYS = {
  all: ['features'] as const,
  lists: () => [...FEATURE_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...FEATURE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...FEATURE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FEATURE_QUERY_KEYS.details(), id] as const,
  byLayer: (layerId: string) => [...FEATURE_QUERY_KEYS.all, 'byLayer', layerId] as const,
  byLayers: (layerIds: string[]) => [...FEATURE_QUERY_KEYS.all, 'byLayers', layerIds] as const,
  stats: (layerId: string) => [...FEATURE_QUERY_KEYS.all, 'stats', layerId] as const,
};

// Hook para buscar todas as features
export const useFeatures = () => {
  return useQuery({
    queryKey: FEATURE_QUERY_KEYS.lists(),
    queryFn: () => featureRepository.getAll(),
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });
};

// Hook para buscar feature por ID
export const useFeature = (id: string) => {
  return useQuery({
    queryKey: FEATURE_QUERY_KEYS.detail(id),
    queryFn: () => featureRepository.getById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minuto
  });
};

// Hook para buscar features por camada
export const useFeaturesByLayer = (layerId: string) => {
  return useQuery({
    queryKey: FEATURE_QUERY_KEYS.byLayer(layerId),
    queryFn: () => featureRepository.getByLayerId(layerId),
    enabled: !!layerId,
    staleTime: 30000,
  });
};

// Hook para buscar features por múltiplas camadas
export const useFeaturesByLayers = (layerIds: string[]) => {
  return useQuery({
    queryKey: FEATURE_QUERY_KEYS.byLayers(layerIds),
    queryFn: () => featureRepository.getByLayerIds(layerIds),
    enabled: layerIds.length > 0,
    staleTime: 30000,
  });
};

// Hook para estatísticas da camada
export const useLayerStats = (layerId: string) => {
  return useQuery({
    queryKey: FEATURE_QUERY_KEYS.stats(layerId),
    queryFn: () => featureRepository.getLayerStats(layerId),
    enabled: !!layerId,
    staleTime: 60000,
  });
};

// Hook para busca de features
export const useSearchFeatures = (query: string) => {
  return useQuery({
    queryKey: [...FEATURE_QUERY_KEYS.all, 'search', query],
    queryFn: () => featureRepository.search(query),
    enabled: query.length > 2, // Só buscar com mais de 2 caracteres
    staleTime: 30000,
  });
};

// Hook para contagem de features
export const useFeatureCount = () => {
  return useQuery({
    queryKey: [...FEATURE_QUERY_KEYS.all, 'count'],
    queryFn: () => featureRepository.count(),
    staleTime: 60000,
  });
};

// Hook para invalidar queries relacionadas
export const useInvalidateFeatures = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.lists() }),
    invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) }),
    invalidateByLayer: (layerId: string) => queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.byLayer(layerId) }),
    invalidateStats: (layerId: string) => queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.stats(layerId) }),
  };
};

// Hook para prefetch de dados
export const usePrefetchFeatures = () => {
  const queryClient = useQueryClient();

  return {
    prefetchAll: () => queryClient.prefetchQuery({
      queryKey: FEATURE_QUERY_KEYS.lists(),
      queryFn: () => featureRepository.getAll(),
      staleTime: 30000,
    }),
    prefetchByLayer: (layerId: string) => queryClient.prefetchQuery({
      queryKey: FEATURE_QUERY_KEYS.byLayer(layerId),
      queryFn: () => featureRepository.getByLayerId(layerId),
      staleTime: 30000,
    }),
  };
};