import React from "react";
import { createContext, useContext, FC, useState  } from "react";
import { useMain } from "../../contexts/MainContext";

interface Model3D {
  id: string;
  name: string;
  url: string;
  lon: number;
  lat: number;
  height: number;
  heightOffset: number;
  maximumScreenSpaceError: number;
}
interface Context {
  cesiumMeasure: any;
  setCesiumMeasure: (measure: any) => void;
  cesiumViewshed: any;
  setCesiumViewshed: (viewshed: any) => void;
  setActiveTool: (toolName: string | null) => void;
  activeTool: string | null;
  addModel3D: (model: Model3D) => void;
  removeModel3D: (modelId: string) => void;
  zoomToModel: (modelId: string) => void;
  models3D: Model3D[];
}

interface Props {
  children: React.ReactNode;
}

const MapToolsContext = createContext<Context>({
  cesiumMeasure: null,
  setCesiumMeasure: () => {},
  cesiumViewshed: null,
  setCesiumViewshed: () => {},
  setActiveTool: () => {},
  activeTool: null,
  addModel3D: () => {},
  removeModel3D: () => {},
  zoomToModel: () => {},
  models3D: [],
});

const MapToolsProvider: FC<Props> = ({ children }) => {
  const { cesiumMap, cesium } = useMain();
  const [activeTool, setActiveToolState] = useState<string | null>(null);
  const [models3D, setModels3D] = useState<Model3D[]>([]);
  var cesiumMeasure: any = null;
  const setCesiumMeasure = (measure: any) => (cesiumMeasure = measure);
  var cesiumViewshed: any = null;
  const setCesiumViewshed = (viewshed: any) => (cesiumViewshed = viewshed);

  const setActiveTool = (toolName: string | null) => {
    setActiveToolState(toolName);
    deactiveTools();
    clearDrawing();
    switch (toolName) {
      case "clean":
        return;
      case "area":
        return cesiumMeasure.setActiveMeasure("area");
      case "distance":
        return cesiumMeasure.setActiveMeasure("distance");
      case "viewshed":
        return cesiumViewshed.setActive(true);
      case "identify":
        return;
      case null:
        return;
      default:
        throw new Error("Not Found Tool");
    }
  };

  const deactiveTools = () => {
    cesiumMeasure.setActiveMeasure(null);
    cesiumViewshed.setActive(false);
  };

  const clearDrawing = () => {
    cesiumMeasure.clean();
    cesiumViewshed.clean();
  };

  const load3dTileset = (tilesetSetup: any) => {
    var tileset = new cesium.Cesium3DTileset({
      url: tilesetSetup.url,
      maximumScreenSpaceError: 0,
      maximumMemoryUsage: 0,
    });
    cesiumMap.scene.primitives.add(tileset);

    tileset.readyPromise
      .then(function (tileset: any) {
        const heightOffset = tilesetSetup.heightOffset;
        const boundingSphere = tileset.boundingSphere;
        const cartographic = cesium.Cartographic.fromCartesian(
          boundingSphere.center
        );
        const surface = cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0.0
        );
        const offset = cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          heightOffset
        );
        const translation = cesium.Cartesian3.subtract(
          offset,
          surface,
          new cesium.Cartesian3()
        );
        tileset.modelMatrix = cesium.Matrix4.fromTranslation(translation);
      })
      .otherwise(function (error: any) {
        console.error("Error loading tileset:", error);
      });
    return tileset;
  };

  const addModel3D = (model: Model3D) => {
    setModels3D((prevModels) => [...prevModels, model]);
    const tilesetSetup = {
      url: model.url,
      heightOffset: model.heightOffset,
      default: true,
      locate: {
        lat: model.lat,
        lon: model.lon,
        height: model.height,
      },
    };
    const tileset = load3dTileset(tilesetSetup);
    // Store the tileset reference for later use (e.g., removal)
    (cesiumMap as any).modelTilesets = (cesiumMap as any).modelTilesets || {};
    (cesiumMap as any).modelTilesets[model.id] = tileset;
  };

  const removeModel3D = (modelId: string) => {
    setModels3D((prevModels) => prevModels.filter((model) => model.id !== modelId));
    // Remove the tileset from the scene
    if ((cesiumMap as any).modelTilesets && (cesiumMap as any).modelTilesets[modelId]) {
      cesiumMap.scene.primitives.remove((cesiumMap as any).modelTilesets[modelId]);
      delete (cesiumMap as any).modelTilesets[modelId];
    }
  };

  const zoomToModel = (modelId: string) => {
    const model = models3D.find((model) => model.id === modelId);
    if (model) {
      cesiumMap.camera.flyTo({
        destination: cesium.Cartesian3.fromDegrees(model.lon, model.lat, model.height),
      });
    }
  };

  return (
    <MapToolsContext.Provider
      value={{
        cesiumMeasure,
        setCesiumMeasure,
        cesiumViewshed,
        setCesiumViewshed,
        setActiveTool,
        activeTool,
        addModel3D,
        removeModel3D,
        zoomToModel,
        models3D,
      }}
    >
      {children}
    </MapToolsContext.Provider>
  );
};

export default MapToolsProvider;

export const useMapTools = () => useContext(MapToolsContext);
