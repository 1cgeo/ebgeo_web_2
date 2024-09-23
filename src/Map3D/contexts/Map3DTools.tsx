import React from "react";
import { createContext, useContext, FC, useState  } from "react";
import { useMain } from "../../contexts/MainContext";
import { Tiles3D, Modelos3D, CatalogItem } from "../catalog/modelTypes";

interface Context {
  cesiumMeasure: any;
  setCesiumMeasure: (measure: any) => void;
  cesiumViewshed: any;
  setCesiumViewshed: (viewshed: any) => void;
  setActiveTool: (toolName: string | null) => void;
  activeTool: string | null;
  addModel: (model: CatalogItem) => void;
  removeModel: (modelId: string) => void;
  zoomToModel: (modelId: string) => void;
  models: CatalogItem[];
  areToolsEnabled: boolean;
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
  addModel: () => {},
  removeModel: () => {},
  zoomToModel: () => {},
  models: [],
  areToolsEnabled: false,
});

const MapToolsProvider: FC<Props> = ({ children }) => {
  const { cesiumMap, cesium } = useMain();
  const [activeTool, setActiveToolState] = useState<string | null>(null);
  const [models, setModels] = useState<CatalogItem[]>([]);
  const [areToolsEnabled, setAreToolsEnabled] = useState(false);
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

  const addTiles3D = (model: Tiles3D) => {
    const tileset = new cesium.Cesium3DTileset({
      url: model.url,
      maximumScreenSpaceError: model.maximumScreenSpaceError,
      maximumMemoryUsage: 512,
        preferLeaves: true,
        dynamicScreenSpaceError: true,
        dynamicScreenSpaceErrorDensity: 0.00278,
        dynamicScreenSpaceErrorFactor: 4.0,
        dynamicScreenSpaceErrorHeightFalloff: 0.25
    });
    cesiumMap.scene.primitives.add(tileset);

    tileset.readyPromise.then(() => {
      const boundingSphere = tileset.boundingSphere;
      const cartographic = cesium.Cartographic.fromCartesian(boundingSphere.center);
      const surface = cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
      const offset = cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, model.heightOffset);
      const translation = cesium.Cartesian3.subtract(offset, surface, new cesium.Cartesian3());
      tileset.modelMatrix = cesium.Matrix4.fromTranslation(translation);
    });

    (cesiumMap as any).modelTilesets = (cesiumMap as any).modelTilesets || {};
    (cesiumMap as any).modelTilesets[model.id] = tileset;
  };

  const addModelos3D = (model: Modelos3D) => {
    const position = cesium.Cartesian3.fromDegrees(model.lon, model.lat, model.height);
    const heading = cesium.Math.toRadians(model.heading);
    const pitch = cesium.Math.toRadians(model.pitch);
    const roll = cesium.Math.toRadians(model.roll);
    const hpr = new cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    const entity = cesiumMap.entities.add({
      name: model.name,
      position: position,
      orientation: orientation,
      model: {
        uri: model.url,
      },
    });

    (cesiumMap as any).modelEntities = (cesiumMap as any).modelEntities || {};
    (cesiumMap as any).modelEntities[model.id] = entity;
  };

  const addModel = (model: CatalogItem) => {
    setModels((prevModels) => {
      const newModels = [...prevModels, model];
      setAreToolsEnabled(newModels.length > 0);
      return newModels;
    });
    
    if (model.type === 'Tiles 3D') {
      addTiles3D(model);
    } else {
      addModelos3D(model);
    }
  };

  const removeModel = (modelId: string) => {
    setModels((prevModels) => {
      const newModels = prevModels.filter((model) => model.id !== modelId);
      setAreToolsEnabled(newModels.length > 0);
      return newModels;
    });

    if ((cesiumMap as any).modelTilesets && (cesiumMap as any).modelTilesets[modelId]) {
      cesiumMap.scene.primitives.remove((cesiumMap as any).modelTilesets[modelId]);
      delete (cesiumMap as any).modelTilesets[modelId];
    }
    
    if ((cesiumMap as any).modelEntities && (cesiumMap as any).modelEntities[modelId]) {
      cesiumMap.entities.remove((cesiumMap as any).modelEntities[modelId]);
      delete (cesiumMap as any).modelEntities[modelId];
    }
  };

  const zoomToModel = (modelId: string) => {
    const model = models.find((model) => model.id === modelId);
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
        addModel,
        removeModel,
        zoomToModel,
        models,
        areToolsEnabled,
      }}
    >
      {children}
    </MapToolsContext.Provider>
  );
};

export default MapToolsProvider;

export const useMapTools = () => useContext(MapToolsContext);
