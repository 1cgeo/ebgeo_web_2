// Path: map3d\hooks\useMap3DSetup.ts
import { useCallback, useEffect } from 'react';

import { env } from '@/shared/config/env';
import { useMapsStore } from '@/shared/store/mapsStore';

import { useArea } from '../features/area/useArea';
import { useDistance } from '../features/distance/useDistance';
import { useLabel } from '../features/label/useLabel';
import { useViewshed } from '../features/viewshed/useViewshed';
import { type Map3DState } from '../types';

const defaultMapConfig: Map3DState = {
  center: {
    lng: -44.4481491,
    lat: -22.4546061,
    height: 424.7,
  },
  orientation: {
    heading: 164,
    pitch: -2,
    roll: -1,
  },
  bounds: {
    north: -22.45592,
    south: -22.455922,
    east: -44.449654,
    west: -44.449656,
  },
};

interface Map3DSetupOptions {
  containerId: string;
  initialState?: Partial<Map3DState>;
}

export function useMap3DSetup({
  containerId,
  initialState,
}: Map3DSetupOptions) {
  const { cesiumMap, setCesium, setCesiumMap } = useMapsStore();

  // Configura hooks de features
  const setupFeatureHooks = useCallback((Cesium: any, viewer: any) => {
    useArea.setup(Cesium, viewer);
    useDistance.setup(Cesium, viewer);
    useViewshed.setup(Cesium, viewer);
    useLabel.setup(Cesium, viewer);
  }, []);

  useEffect(() => {
    const config = {
      ...defaultMapConfig,
      ...initialState,
    };

    const Cesium = window?.cesium;
    if (!Cesium) {
      console.error(
        "Cesium library not found in global scope (window.Cesium). Make sure it's correctly loaded in index.html.",
      );
      return;
    }

    // Configurar a visualização padrão
    const extent = Cesium.Rectangle.fromDegrees(
      config.bounds?.west || -44.449656,
      config.bounds?.south || -22.455922,
      config.bounds?.east || -44.449654,
      config.bounds?.north || -22.45592,
    );
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    // Criar o viewer do Cesium
    const viewer = new Cesium.Viewer(containerId, {
      infoBox: false,
      shouldAnimate: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: true,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: env.VITE_IMAGERY_PROVIDER_URL,
        credit: 'Diretoria de Serviço Geográfico - Exército Brasileiro',
      }),
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: env.VITE_TERRAIN_PROVIDER_URL,
      }),
    });

    // Configurar o globo
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.skyBox.show = true;
    viewer.bottomContainer.style.display = 'none';

    // Configurar posição e orientação iniciais
    const position = Cesium.Cartesian3.fromDegrees(
      config.center.lng,
      config.center.lat,
      config.center.height || 424.7,
    );

    const heading = Cesium.Math.toRadians(config.orientation.heading);
    const pitch = Cesium.Math.toRadians(config.orientation.pitch);
    const roll = Cesium.Math.toRadians(config.orientation.roll);

    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    // Salvar as instâncias no store global
    setCesium(Cesium);
    setCesiumMap(viewer);

    // Configurar hooks de features
    setupFeatureHooks(Cesium, viewer);

    // Cleanup function
    return () => {
      if (viewer && !viewer.isDestroyed()) {
        setCesiumMap(null);
        viewer.destroy();
      }
    };
  }, [containerId, initialState, setCesium, setCesiumMap, setupFeatureHooks]);

  return cesiumMap;
}
