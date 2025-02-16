// Path: map3d\utils\cameraUtils.ts
import { useMapsStore } from '@/shared/store/mapsStore';

import { type Camera3D } from '../types';

export function setCameraPosition(position: Camera3D) {
  const { cesium, cesiumMap } = useMapsStore.getState();
  if (!cesium || !cesiumMap) return;

  const destination = cesium.Cartesian3.fromDegrees(
    position.longitude,
    position.latitude,
    position.height,
  );

  cesiumMap.camera.setView({
    destination,
    orientation: {
      heading: cesium.Math.toRadians(position.heading),
      pitch: cesium.Math.toRadians(position.pitch),
      roll: cesium.Math.toRadians(position.roll),
    },
  });
}

export function getCameraPosition(): Camera3D | null {
  const { cesium, cesiumMap } = useMapsStore.getState();
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
}

export function flyToPosition(position: Camera3D, duration: number = 2) {
  const { cesium, cesiumMap } = useMapsStore.getState();
  if (!cesium || !cesiumMap) return;

  const destination = cesium.Cartesian3.fromDegrees(
    position.longitude,
    position.latitude,
    position.height,
  );

  cesiumMap.camera.flyTo({
    destination,
    orientation: {
      heading: cesium.Math.toRadians(position.heading),
      pitch: cesium.Math.toRadians(position.pitch),
      roll: cesium.Math.toRadians(position.roll),
    },
    duration,
  });
}

export function flyToView(
  view: {
    west: number;
    south: number;
    east: number;
    north: number;
  },
  duration: number = 2,
) {
  const { cesium, cesiumMap } = useMapsStore.getState();
  if (!cesium || !cesiumMap) return;

  const rectangle = cesium.Rectangle.fromDegrees(
    view.west,
    view.south,
    view.east,
    view.north,
  );

  cesiumMap.camera.flyTo({
    destination: rectangle,
    duration,
  });
}
