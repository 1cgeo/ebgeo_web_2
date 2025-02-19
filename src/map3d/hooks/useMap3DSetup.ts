// Path: map3d\hooks\useMap3DSetup.ts
import { useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { config } from '@/map3d/config';
import { useMap3DStore } from '@/map3d/store';
import {
  type Camera3D,
  type ViewRectangle,
  camera3DSchema,
  viewRectangleSchema,
} from '@/map3d/types';

interface Map3DSetupOptions {
  containerId: string;
  initialView?: Partial<ViewRectangle>;
  initialCamera?: Partial<Camera3D>;
}

export function useMap3DSetup({
  containerId,
  initialView,
  initialCamera,
}: Map3DSetupOptions) {
  const { cesiumMap, setCesium, setCesiumMap } = useMapsStore();
  const { setCameraPosition } = useMap3DStore();

  useEffect(() => {
    // Get Cesium instance from window
    const cesiumInstance = window.cesium;
    if (!cesiumInstance) {
      console.error(
        "Cesium library not found in global scope (window.Cesium). Make sure it's correctly loaded in index.html.",
      );
      return;
    }

    // Set Cesium instance in the store
    setCesium(cesiumInstance);

    // Merge default view with provided initial view
    const view = {
      ...config.viewer.defaultView,
      ...initialView,
    };

    // Validate the view rectangle
    const validatedView = viewRectangleSchema.parse(view);

    // Set default view rectangle for Cesium
    const extent = cesiumInstance.Rectangle.fromDegrees(
      validatedView.west,
      validatedView.south,
      validatedView.east,
      validatedView.north,
    );
    cesiumInstance.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    cesiumInstance.Camera.DEFAULT_VIEW_FACTOR = 0;

    // Create Cesium viewer with configuration from config
    const viewer = new cesiumInstance.Viewer(containerId, {
      ...config.viewer.cesiumOptions,
      imageryProvider: new cesiumInstance.UrlTemplateImageryProvider(
        config.imagery,
      ),
      terrainProvider: new cesiumInstance.CesiumTerrainProvider(config.terrain),
    });

    // Apply global settings
    viewer.scene.globe.baseColor = cesiumInstance.Color.BLACK;
    viewer.scene.skyAtmosphere.show = config.viewer.defaultOptions.atmosphere;
    viewer.scene.skyBox.show = config.viewer.defaultOptions.atmosphere;
    viewer.bottomContainer.style.display = 'none';

    // If initial camera is provided, set the camera position
    if (initialCamera) {
      const camera = {
        ...config.viewer.defaultCamera,
        ...initialCamera,
      };

      // Validate camera position
      const validatedCamera = camera3DSchema.parse(camera);

      // Set initial camera position
      const position = cesiumInstance.Cartesian3.fromDegrees(
        validatedCamera.longitude,
        validatedCamera.latitude,
        validatedCamera.height,
      );

      const heading = cesiumInstance.Math.toRadians(validatedCamera.heading);
      const pitch = cesiumInstance.Math.toRadians(validatedCamera.pitch);
      const roll = cesiumInstance.Math.toRadians(validatedCamera.roll);

      viewer.camera.setView({
        destination: position,
        orientation: {
          heading,
          pitch,
          roll,
        },
      });

      // Update camera position in store
      setCameraPosition(validatedCamera);
    }

    // Save viewer reference to store
    setCesiumMap(viewer);

    // Apply performance settings
    if (viewer.scene.primitives) {
      viewer.scene.primitives.maximumScreenSpaceError =
        config.performance.maximumScreenSpaceError;
    }

    // Cleanup function
    return () => {
      if (viewer) {
        setCesiumMap(null);
        viewer.destroy();
      }
    };
  }, [
    containerId,
    initialView,
    initialCamera,
    setCesium,
    setCesiumMap,
    setCameraPosition,
  ]);

  return cesiumMap;
}
