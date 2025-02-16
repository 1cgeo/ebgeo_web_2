// Path: map3d\hooks\useMap3D.ts
import { useCallback, useEffect, useState } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type Map3DConfig } from '../config';
import { type Camera3D, validateCamera } from '../types';

interface UseMap3DOptions {
  onViewerReady?: (viewer: any) => void;
  onError?: (error: Error) => void;
}

interface UseMap3DResult {
  isReady: boolean;
  error: Error | null;
  getCameraPosition: () => Camera3D | null;
  setCameraPosition: (position: Camera3D) => void;
  flyToPosition: (position: Camera3D, duration?: number) => void;
}

export function useMap3D(
  config: Map3DConfig,
  options?: UseMap3DOptions,
): UseMap3DResult {
  const { cesium, cesiumMap, setCesiumMap } = useMapsStore();

  const getCameraPosition = useCallback((): Camera3D | null => {
    if (!cesium || !cesiumMap) return null;

    const camera = cesiumMap.camera;
    const position = camera.positionCartographic;

    return validateCamera({
      latitude: cesium.Math.toDegrees(position.latitude),
      longitude: cesium.Math.toDegrees(position.longitude),
      height: position.height,
      heading: cesium.Math.toDegrees(camera.heading),
      pitch: cesium.Math.toDegrees(camera.pitch),
      roll: cesium.Math.toDegrees(camera.roll),
    });
  }, [cesium, cesiumMap]);

  const setCameraPosition = useCallback(
    (position: Camera3D) => {
      if (!cesium || !cesiumMap) return;

      const validPosition = validateCamera(position);

      const destination = cesium.Cartesian3.fromDegrees(
        validPosition.longitude,
        validPosition.latitude,
        validPosition.height,
      );

      cesiumMap.camera.setView({
        destination,
        orientation: {
          heading: cesium.Math.toRadians(validPosition.heading),
          pitch: cesium.Math.toRadians(validPosition.pitch),
          roll: cesium.Math.toRadians(validPosition.roll),
        },
      });
    },
    [cesium, cesiumMap],
  );

  const flyToPosition = useCallback(
    (position: Camera3D, duration: number = 2) => {
      if (!cesium || !cesiumMap) return;

      const validPosition = validateCamera(position);

      const destination = cesium.Cartesian3.fromDegrees(
        validPosition.longitude,
        validPosition.latitude,
        validPosition.height,
      );

      cesiumMap.camera.flyTo({
        destination,
        orientation: {
          heading: cesium.Math.toRadians(validPosition.heading),
          pitch: cesium.Math.toRadians(validPosition.pitch),
          roll: cesium.Math.toRadians(validPosition.roll),
        },
        duration,
      });
    },
    [cesium, cesiumMap],
  );

  // Estado local
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Setup do viewer
  useEffect(() => {
    if (!cesium) return;

    try {
      const viewer = new cesium.Viewer('map-3d', config.viewer.cesiumOptions);

      // Configura imagem base
      viewer.imageryLayers.addImageryProvider(
        new cesium.UrlTemplateImageryProvider(config.imagery),
      );

      // Configura terreno
      viewer.terrainProvider = new cesium.CesiumTerrainProvider(config.terrain);

      // Configura view inicial
      const { defaultView } = config.viewer;
      const rect = cesium.Rectangle.fromDegrees(
        defaultView.west,
        defaultView.south,
        defaultView.east,
        defaultView.north,
      );
      viewer.camera.setView({ destination: rect });

      // Salva referência
      setCesiumMap(viewer);
      setIsReady(true);
      options?.onViewerReady?.(viewer);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Erro ao inicializar Cesium');
      setError(error);
      options?.onError?.(error);
    }

    return () => {
      if (cesiumMap) {
        cesiumMap.destroy();
        setCesiumMap(null);
      }
    };
  }, [cesium, config]);

  return {
    isReady,
    error,
    getCameraPosition,
    setCameraPosition,
    flyToPosition,
  };
}
