// Path: map3d\hooks\useMap3D.ts
import { useCallback, useEffect, useState } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { config } from '@/map3d/config';
import {
  type Camera3D,
  type ViewRectangle,
  validateCamera,
} from '@/map3d/types';

import { useMap3DSetup } from './useMap3DSetup';

interface UseMap3DOptions {
  containerId?: string;
  initialView?: Partial<ViewRectangle>;
  initialCamera?: Partial<Camera3D>;
  onViewerReady?: (viewer: any) => void;
  onError?: (error: Error) => void;
}

interface UseMap3DResult {
  isReady: boolean;
  error: Error | null;
  getCameraPosition: () => Camera3D | null;
  setCameraPosition: (position: Camera3D) => void;
  flyToPosition: (position: Camera3D, duration?: number) => void;
  flyToView: (rectangle: ViewRectangle, duration?: number) => void;
}

export function useMap3D({
  containerId = 'map-3d',
  initialView,
  initialCamera,
  onViewerReady,
  onError,
}: UseMap3DOptions = {}): UseMap3DResult {
  // Use o hook de setup para inicialização do mapa
  const cesiumMap = useMap3DSetup({
    containerId,
    initialView,
    initialCamera,
  });

  const { cesium } = useMapsStore();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Notificar quando o viewer estiver pronto ou ocorrer erro
  useEffect(() => {
    if (cesiumMap) {
      setIsReady(true);
      onViewerReady?.(cesiumMap);
    } else if (cesium && !cesiumMap) {
      const err = new Error('Falha ao inicializar o mapa Cesium');
      setError(err);
      onError?.(err);
    }
  }, [cesium, cesiumMap, onViewerReady, onError]);

  // Método para obter a posição atual da câmera
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

  // Método para definir a posição da câmera imediatamente
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

  // Método para voar suavemente para uma posição
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

  // Método para voar para uma visão retangular
  const flyToView = useCallback(
    (rectangle: ViewRectangle, duration: number = 2) => {
      if (!cesium || !cesiumMap) return;

      const rect = cesium.Rectangle.fromDegrees(
        rectangle.west,
        rectangle.south,
        rectangle.east,
        rectangle.north,
      );

      cesiumMap.camera.flyTo({
        destination: rect,
        duration,
      });
    },
    [cesium, cesiumMap],
  );

  return {
    isReady,
    error,
    getCameraPosition,
    setCameraPosition,
    flyToPosition,
    flyToView,
  };
}
