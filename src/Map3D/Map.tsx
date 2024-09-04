import { useEffect, memo, useState } from "react";
import styled from "styled-components";
import { useMain } from "../contexts/MainContext";

const Map = styled("div")({
  position: "relative",
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

function MapSig() {
  const { setCesium } = useMain();
  const Cesium = window?.Cesium as any;
  const [tilesetSetups] = useState([
    {
      url: "/3d/AMAN/tileset.json",

      heightOffset: 50, //-360 para elipsoide 40 para terreno,
      id: "AMAN",
      default: true,
      locate: {
        lat: -22.455921,
        lon: -44.449655,
        height: 2200,
      },
    },
    {
      url: "/3d/ESA/tileset.json",
      heightOffset: 75,
      id: "ESA",
      locate: {
        lon: -45.25666459926732,
        lat: -21.703613735103637,
        height: 1500,
      },
    },
    {
      url: "/3d/PCL/tileset.json",
      heightOffset: 35,
      id: "PCL",
      locate: {
        lon: -44.47332385414955,
        lat: -22.43976556982974,
        height: 1000,
      },
    },
  ]);

  const load3dTileset = (Cesium: any, map: any, tilesetSetup: any) => {
    var tileset = new Cesium.Cesium3DTileset({
      url: tilesetSetup.url,
      maximumScreenSpaceError: 0,
      maximumMemoryUsage: 0,
    });
    map.scene.primitives.add(tileset);

    tileset.readyPromise
      .then(function (tileset: any) {
        const heightOffset = tilesetSetup.heightOffset;
        const boundingSphere = tileset.boundingSphere;
        const cartographic = Cesium.Cartographic.fromCartesian(
          boundingSphere.center
        );
        const surface = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0.0
        );
        const offset = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          heightOffset
        );
        const translation = Cesium.Cartesian3.subtract(
          offset,
          surface,
          new Cesium.Cartesian3()
        );
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        if (tilesetSetup.default) {
          // map.flyTo(tileset, {
          //     offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-60), 0)
          // });
          const { lat, lon, height } = tilesetSetup.locate;
          map.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
          });
        }
      })
      .otherwise(function (error: any) {
        // Handle loading errors here
        console.error("Error loading tileset:", error);
      });
    return tileset;
  };

  useEffect(() => {
    if (!Cesium) return;

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

    for (let tilesetSetup of tilesetSetups) {
      load3dTileset(Cesium, map, tilesetSetup);
    }

    setCesium(Cesium);
    return () => {
      setCesium(null);
    };
  }, [Cesium]);

  return <Map id="map-3d"></Map>;
}

export default memo(MapSig);
