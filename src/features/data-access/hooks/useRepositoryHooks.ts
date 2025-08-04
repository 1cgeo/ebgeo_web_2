// Path: features\data-access\hooks\useRepositoryHooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '../repositories/RepositoryFactory';
import { ExtendedFeature } from '../schemas/feature.schema';
import { LayerConfig } from '../schemas/layer.schema';
import { MapConfig } from '../schemas/map.schema';

export const QUERY_KEYS = {
  features: {
    all: ['features'] as const,
    byLayer: (layerId: string) => ['features', 'layer', layerId] as const,
    byId: (id: string) => ['features', id] as const,
  },
  layers: {
    all: ['layers'] as const,
    byId: (id: string) => ['layers', id] as const,
  },
  maps: {
    all: ['maps'] as const,
    byId: (id: string) => ['maps', id] as const,
  },
} as const;

// Feature hooks
export const useFeatures = () => {
  return useQuery({
    queryKey: QUERY_KEYS.features.all,
    queryFn: () => repositories.feature().getAll(),
    staleTime: 30000,
  });
};

export const useFeaturesByLayer = (layerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.features.byLayer(layerId),
    queryFn: () => repositories.feature().getByLayerId(layerId),
    enabled: !!layerId,
    staleTime: 30000,
  });
};

export const useFeature = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.features.byId(id),
    queryFn: () => repositories.feature().getById(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feature: ExtendedFeature) => repositories.feature().create(feature),
    onSuccess: newFeature => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.features.byLayer(newFeature.properties.layerId),
      });
    },
  });
};

export const useUpdateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ExtendedFeature> }) =>
      repositories.feature().update(id, updates),
    onSuccess: updatedFeature => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.features.byLayer(updatedFeature.properties.layerId),
      });
      queryClient.setQueryData(QUERY_KEYS.features.byId(updatedFeature.id), updatedFeature);
    },
  });
};

export const useDeleteFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.feature().delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features.all });
    },
  });
};

// Layer hooks
export const useLayers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.layers.all,
    queryFn: () => repositories.layer().getAll(),
    staleTime: 60000,
  });
};

export const useLayer = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.layers.byId(id),
    queryFn: () => repositories.layer().getById(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateLayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (layer: LayerConfig) => repositories.layer().create(layer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.layers.all });
    },
  });
};

export const useUpdateLayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LayerConfig> }) =>
      repositories.layer().update(id, updates),
    onSuccess: updatedLayer => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.layers.all });
      queryClient.setQueryData(QUERY_KEYS.layers.byId(updatedLayer.id), updatedLayer);
    },
  });
};

export const useDeleteLayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.layer().delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.layers.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features.all });
    },
  });
};

// Map hooks
export const useMaps = () => {
  return useQuery({
    queryKey: QUERY_KEYS.maps.all,
    queryFn: () => repositories.map().getAll(),
    staleTime: 60000,
  });
};

export const useMap = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.maps.byId(id),
    queryFn: () => repositories.map().getById(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useCreateMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (map: MapConfig) => repositories.map().create(map),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.maps.all });
    },
  });
};

export const useUpdateMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MapConfig> }) =>
      repositories.map().update(id, updates),
    onSuccess: updatedMap => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.maps.all });
      queryClient.setQueryData(QUERY_KEYS.maps.byId(updatedMap.id), updatedMap);
    },
  });
};

export const useDeleteMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.map().delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.maps.all });
    },
  });
};
