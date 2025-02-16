// Path: map3d\store\slices\camera.ts
import { type StateCreator } from 'zustand';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type Camera3D } from '../../types';

export interface CameraSlice {
  cameraPosition: Camera3D | null;
  defaultPosition: Camera3D;
  setCameraPosition: (position: Camera3D) => void;
  flyToPosition: (position: Camera3D, duration?: number) => void;
  resetCamera: () => void;
}

export const createCameraSlice: StateCreator<CameraSlice> = (set, get) => ({
  cameraPosition: null,
  defaultPosition: {
    latitude: -22.4546061,
    longitude: -44.4481491,
    height: 424.7,
    heading: 164,
    pitch: -2,
    roll: -1,
  },

  setCameraPosition: position => {
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

    set({ cameraPosition: position });
  },

  flyToPosition: (position, duration = 2) => {
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

    set({ cameraPosition: position });
  },

  resetCamera: () => {
    const { defaultPosition } = get();
    get().flyToPosition(defaultPosition);
  },
});
