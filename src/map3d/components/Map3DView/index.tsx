// Path: map3d\components\Map3DView\index.tsx
import { memo, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { config, defaultOptions } from '../../config';
import { useLabel, useMeasure, useViewshed } from '../../hooks';
import { useMap3DStore } from '../../store';
import { MapToolbar } from '../MapToolbar';
import { ModelList } from '../ModelList';
import { MapContainer } from './styles';

function Map3DView() {
  const { setCesium, setCesiumMap } = useMapsStore();
  const { setCesiumMeasure, setCesiumViewshed, setCesiumLabel, setOptions } =
    useMap3DStore();

  const { setup: setupMeasure } = useMeasure();
  const { setup: setupViewshed } = useViewshed();
  const { setup: setupLabel } = useLabel();

  useEffect(() => {
    const Cesium = window?.Cesium;
    if (!Cesium) return;

    // Configuração inicial do Cesium
    const { defaultView, cesiumOptions } = config.viewer;
    const { imagery, terrain } = config;

    const extent = new Cesium.Rectangle.fromDegrees(
      defaultView.west,
      defaultView.south,
      defaultView.east,
      defaultView.north,
    );

    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    const viewer = new Cesium.Viewer('map-3d', {
      ...cesiumOptions,
      imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: imagery.url,
        credit: imagery.credit,
      }),
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: terrain.url,
      }),
    });

    // Configuração do globo
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;
    viewer.scene.skyAtmosphere.show = defaultOptions.atmosphere;
    viewer.scene.skyBox.show = defaultOptions.atmosphere;
    viewer.bottomContainer.style.display = 'none';

    setCesium(Cesium);
    setCesiumMap(viewer);

    // Setup das ferramentas
    setCesiumMeasure(setupMeasure(Cesium, viewer));
    setCesiumViewshed(setupViewshed(Cesium, viewer));
    setCesiumLabel(setupLabel(Cesium, viewer));

    // Cleanup
    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <MapContainer id="map-3d">
      <MapToolbar />
      <ModelList />
    </MapContainer>
  );
}

export default memo(Map3DView);
