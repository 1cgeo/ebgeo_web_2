import { useEffect, memo } from 'react';
import { useMap3DStore } from '../../store';
import { useMapsStore } from '@/shared/store/mapsStore';
import { RightSideToolBar } from '../RightSideToolBar';
import { useMap3DFeatures } from '../../features/registry';
import { MapContainer } from './styles';
import config from '@/shared/config/env';

function Map3DView() {
  const { setCesium, setCesiumMap } = useMapsStore();
  const models = useMap3DStore(state => state.models);
  const features = useMap3DFeatures({ showInToolbar: true });
  
  useEffect(() => {
    const Cesium = window?.Cesium;
    if (!Cesium) return;

    // Configuração inicial do Cesium
    const initialPosition = {
      west: -44.449656,
      south: -22.455922,
      east: -44.449654,
      north: -22.45592,
    };

    const extent = new Cesium.Rectangle.fromDegrees(
      initialPosition.west,
      initialPosition.south,
      initialPosition.east,
      initialPosition.north
    );

    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    const viewer = new Cesium.Viewer('map-3d', {
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
        url: config.imageryUrl,
        credit: 'Diretoria de Serviço Geográfico - Exército Brasileiro',
      }),
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: config.terrainUrl,
      }),
    });

    // Configurações adicionais
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.skyBox.show = true;
    viewer.bottomContainer.style.display = 'none';

    setCesium(Cesium);
    setCesiumMap(viewer);

    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <MapContainer id="map-3d">
      <RightSideToolBar 
        features={features} 
        enabled={models.length > 0} 
      />
    </MapContainer>
  );
}

export default memo(Map3DView);