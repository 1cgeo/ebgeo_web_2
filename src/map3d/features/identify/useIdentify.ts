// Path: map3d\features\identify\useIdentify.ts
import { useCallback, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useMapsStore } from '@/shared/store/mapsStore';

import { useMap3DStore } from '@/map3d/store';

import { fetchFeatureInfo } from '../api';
import { useIdentifyStore } from '../store';

export function useIdentify() {
  const { cesium, cesiumMap } = useMapsStore();
  const { activeTool } = useMap3DStore();
  const {
    selectedCoordinates,
    setSelectedCoordinates,
    setFeatureInfo,
    setError,
    openPanel,
    closePanel,
  } = useIdentifyStore();

  const isActive = activeTool === 'identify';

  // Query para buscar informações da feição
  const { isLoading } = useQuery({
    queryKey: ['featureInfo', selectedCoordinates],
    queryFn: () =>
      selectedCoordinates ? fetchFeatureInfo(selectedCoordinates) : null,
    enabled: !!selectedCoordinates,
    onSuccess: data => {
      if (data) {
        setFeatureInfo(data);
        openPanel();
      }
    },
    onError: error => {
      setError(
        error instanceof Error ? error.message : 'Erro ao buscar informações',
      );
      openPanel();
    },
  });

  // Handler para clique no mapa
  const handleMapClick = useCallback(
    (event: any) => {
      if (!isActive || !cesium || !cesiumMap) return;

      const canvas = cesiumMap.scene.canvas;
      const rect = canvas.getBoundingClientRect();
      const position = new cesium.Cartesian2(
        event.clientX - rect.left,
        event.clientY - rect.top,
      );

      const pickedFeature = cesiumMap.scene.pick(position);
      if (cesium.defined(pickedFeature)) {
        const cartesian = cesiumMap.scene.pickPosition(position);
        if (cesium.defined(cartesian)) {
          const cartographic = cesium.Cartographic.fromCartesian(cartesian);
          const longitude = cesium.Math.toDegrees(cartographic.longitude);
          const latitude = cesium.Math.toDegrees(cartographic.latitude);
          const height = cartographic.height;

          setSelectedCoordinates({
            lat: latitude,
            lon: longitude,
            height,
          });
        }
      } else {
        closePanel();
      }
    },
    [isActive, cesium, cesiumMap, setSelectedCoordinates, closePanel],
  );

  // Setup dos event listeners
  useEffect(() => {
    if (!cesiumMap) return;

    if (isActive) {
      cesiumMap.canvas.addEventListener('click', handleMapClick);
    }

    return () => {
      cesiumMap.canvas.removeEventListener('click', handleMapClick);
    };
  }, [cesiumMap, isActive, handleMapClick]);

  return {
    isLoading,
  };
}
