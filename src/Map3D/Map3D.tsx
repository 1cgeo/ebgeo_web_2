import { useEffect, memo } from "react";
import styled from "styled-components";
import { useMain } from "../contexts/MainContext";
import { useMapTools } from "./contexts/Map3DTools";
import RightSideToolBar from "./RightSideToolBar";
import { Area, Distance, Clean, Viewshed, Identify, Label } from "./tools";
import { useMeasure, useViewshed, useLabel } from "./hooks";
import Model3DLayerList from "./catalog/Model3DLayerList";
import Model3DCatalogButton from "./catalog/Model3DCatalogButton";
import config from "../config";

var loaded = false;

const Map = styled("div")({
  position: "relative",
  overflow: "hidden",
  width: "100%",
  top: 0,
  left: 0,
  height: "100vh",
  cursor: "default",
});

declare global {
  interface Window {
    Cesium?: any;
  }
}

function Map3D() {
  loaded = false;
  const { setCesium, setCesiumMap } = useMain();
  const { setup: setupMeasure } = useMeasure();
  const { setup: setupViewshed } = useViewshed();
  const { setup: setupLabel } = useLabel();
  const { setCesiumMeasure, setCesiumViewshed, setCesiumLabel } = useMapTools();
  const Cesium = window?.Cesium as any;

  useEffect(() => {
    if (!Cesium || loaded) return;
    loaded = true;

    var { west, south, east, north } = {
      west: -44.449656,
      south: -22.455922,
      east: -44.449654,
      north: -22.45592,
    };
    var extent = new Cesium.Rectangle.fromDegrees(west, south, east, north);
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    var map = new Cesium.Viewer("map-3d", {
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
        url: `${config.endpoints.cesiumImagery}`,
        credit: "Diretoria de Serviço Geográfico - Exército Brasileiro",
      }),
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: `${config.endpoints.cesiumTerrain}`,
      }),
    });
    map.scene.globe.baseColor = Cesium.Color.BLACK;
    map.scene.skyAtmosphere.show = true;
    map.scene.skyBox.show = true;
    map.bottomContainer.style.display = "none";

    const position = Cesium.Cartesian3.fromDegrees(
      -44.4481491,
      -22.4546061,
      424.7
    );
    const heading = Cesium.Math.toRadians(164);
    const pitch = Cesium.Math.toRadians(-2);
    const roll = Cesium.Math.toRadians(-1);
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    setCesium(Cesium);
    setCesiumMap(map);

    setCesiumMeasure(setupMeasure(Cesium, map));
    setCesiumViewshed(setupViewshed(Cesium, map));
    setCesiumLabel(setupLabel(Cesium, map));
  }, [Cesium]);

  return (
    <Map id="map-3d">
      <RightSideToolBar
        tools={[
          () => <Model3DCatalogButton key={"Catalog"} />,
          () => <Clean key={"Clear"} />,
          () => <Area key={"Area"} />,
          () => <Distance key={"Distance"} />,
          () => <Viewshed key={"Viewshed"} />,
          () => <Identify key={"Identify"} />,
          () => <Label key={"Label"} />,
        ]}
      />
      <Model3DLayerList />
    </Map>
  );
}

export default memo(Map3D);
