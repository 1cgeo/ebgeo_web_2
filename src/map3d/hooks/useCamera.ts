// Path: map3d\hooks\useCamera.ts
import { useCallback } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type Camera3D } from '../types';

export function useCamera() {
  const { cesium, cesiumMap } = useMapsStore();

  const getCameraPosition = useCallback((): Camera3D | null => {
    if (!cesium || !cesiumMap) return null;
    const camera = cesiumMap.camera;
    const position = camera.positionCartographic;

    return {
      latitude: cesium.Math.toDegrees(position.latitude),
      longitude: cesium.Math.toDegrees(position.longitude),
      height: position.height,
      heading: cesium.Math.toDegrees(camera.heading),
      pitch: cesium.Math.toDegrees(camera.pitch),
      roll: cesium.Math.toDegrees(camera.roll),
    };
  }, [cesium, cesiumMap]);

  const setCameraPosition = useCallback(
    (position: Camera3D) => {
      if (!cesium || !cesiumMap) return;

      const { latitude, longitude, height, heading, pitch, roll } = position;
      const destination = cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height,
      );

      cesiumMap.camera.setView({
        destination,
        orientation: {
          heading: cesium.Math.toRadians(heading),
          pitch: cesium.Math.toRadians(pitch),
          roll: cesium.Math.toRadians(roll),
        },
      });
    },
    [cesium, cesiumMap],
  );

  const flyToPosition = useCallback(
    (position: Camera3D, duration: number = 2) => {
      if (!cesium || !cesiumMap) return;

      const { latitude, longitude, height, heading, pitch, roll } = position;
      const destination = cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height,
      );

      cesiumMap.camera.flyTo({
        destination,
        orientation: {
          heading: cesium.Math.toRadians(heading),
          pitch: cesium.Math.toRadians(pitch),
          roll: cesium.Math.toRadians(roll),
        },
        duration,
      });
    },
    [cesium, cesiumMap],
  );

  return {
    getCameraPosition,
    setCameraPosition,
    flyToPosition,
  };
}
