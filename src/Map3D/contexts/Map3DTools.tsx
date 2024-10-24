import React, { useEffect } from "react";
import { createContext, useContext, FC, useState } from "react";
import { useMain } from "../../contexts/MainContext";
import {
  Tiles3D,
  Modelos3D,
  PointCloud,
} from "../../ts/interfaces/map3D.interfaces";
import { CatalogItem } from "../../ts/types/map3D.types";
import { getModelUrl } from "../../utils/source";

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
  setVisibleModel: (modelId: string, visible: boolean) => void;
  isVisibleModel: (modelId: string) => boolean;
  cesiumLabel: any;
  setCesiumLabel: (viewshed: any) => void;
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
  setVisibleModel: () => {},
  isVisibleModel: () => {
    return false;
  },
  cesiumLabel: null,
  setCesiumLabel: () => {},
});

const MapToolsProvider: FC<Props> = ({ children }) => {
  const { cesiumMap, cesium } = useMain();
  const [activeTool, setActiveToolState] = useState<string | null>(null);
  const [models, setModels] = useState<CatalogItem[]>([]);
  const [areToolsEnabled, setAreToolsEnabled] = useState(false);
  const [cesiumMeasure, _setCesiumMeasure] = useState<any>(null);
  const [cesiumViewshed, _setCesiumViewshed] = useState<any>(null);
  const [primitiveModels, setPrimitiveModels] = useState<any>({});
  const [cesiumLabel, setCesiumLabel] = useState<any>(null);

  useEffect(() => {
    if (models.length > 0 || !(cesiumMeasure && cesiumViewshed)) return;
    clearDrawing();
  }, [models, cesiumMeasure, cesiumViewshed]);

  const setCesiumMeasure = (measure: any) => {
    _setCesiumMeasure(measure);
  };

  const setCesiumViewshed = (viewshed: any) => {
    _setCesiumViewshed(viewshed);
  };

  const setActiveTool = (toolName: string | null) => {
    const tools: any = {
      clean: () => {},
      distance: () => cesiumMeasure.setActiveMeasure("distance"),
      area: () => cesiumMeasure.setActiveMeasure("area"),
      viewshed: () => cesiumViewshed.addViewshed(),
      identify: () => {},
      label: () => cesiumLabel.setActive(true),
    };
    setActiveToolState(toolName);
    clearDrawing();
    if (!(toolName && tools[toolName])) throw new Error("Not Found Tool");
    tools[toolName]();
  };

  const clearDrawing = () => {
    cesiumMeasure.clean();
    cesiumViewshed.clean();
    cesiumLabel.clean();
  };

  const addModel = (model: CatalogItem) => {
    setModels((prevModels) => {
      const newModels = [...prevModels, model];
      setAreToolsEnabled(newModels.length > 0);
      return newModels;
    });

    let loader = getModelLoader(model.type);
    if (!loader) throw new Error("Not Found Model Loader");
    loader(model);
  };

  const getModelLoader = (modelType: string): any => {
    return {
      "Tiles 3D": addTiles3D,
      "Modelos 3D": addModelos3D,
      "Nuvem de Pontos": addPointCloud,
    }[modelType];
  };

  const addTiles3D = (model: Tiles3D) => {
    const tileset = cesiumMap.scene.primitives.add(
      new cesium.Cesium3DTileset({
        url: `${getModelUrl(model.type)}${model.url}`,
        maximumScreenSpaceError: model.maximumscreenspaceerror,
        maximumMemoryUsage: 512,
        preferLeaves: true,
        dynamicScreenSpaceError: true,
        dynamicScreenSpaceErrorDensity: 0.00278,
        dynamicScreenSpaceErrorFactor: 4.0,
        dynamicScreenSpaceErrorHeightFalloff: 0.25,
      })
    );
    tileset.readyPromise.then(() => {
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
        model.heightoffset
      );
      const translation = cesium.Cartesian3.subtract(
        offset,
        surface,
        new cesium.Cartesian3()
      );
      tileset.modelMatrix = cesium.Matrix4.fromTranslation(translation);
      cesiumMap.camera.flyTo({
        destination: cesium.Cartesian3.fromDegrees(
          model.lon,
          model.lat,
          model.height
        ),
      });
    });
    setPrimitiveModels({
      ...primitiveModels,
      [model.id]: tileset,
    });
  };

  const addModelos3D = (model: Modelos3D) => {
    const position = cesium.Cartesian3.fromDegrees(
      model.lon,
      model.lat,
      model.height
    );
    const heading = cesium.Math.toRadians(model.heading);
    const pitch = cesium.Math.toRadians(model.pitch);
    const roll = cesium.Math.toRadians(model.roll);
    const hpr = new cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr
    );

    const entity = cesiumMap.entities.add({
      name: model.name,
      position: position,
      orientation: orientation,
      model: {
        uri: `${getModelUrl(model.type)}${model.url}`,
      },
    });
    cesiumMap.camera.flyTo({
      destination: cesium.Cartesian3.fromDegrees(
        model.lon,
        model.lat,
        model.height
      ),
    });
    setPrimitiveModels({
      ...primitiveModels,
      [model.id]: entity,
    });
  };

  const addPointCloud = (model: PointCloud) => {
    let pointCloudShading = new cesium.PointCloudShading({
      attenuation: true,
      geometricErrorScale: 1.0,
      maximumAttenuation: 10.0,
      baseResolution: 0.05,
      eyeDomeLighting: true,
    });

    let tileset = new cesium.Cesium3DTileset({
      url: `${getModelUrl(model.type)}/esao/tileset.json`,
    });
    cesiumMap.scene.primitives.add(tileset);
    tileset.style = new cesium.Cesium3DTileStyle(model.style);
    tileset.pointCloudShading = pointCloudShading;

    cesiumMap.camera.flyTo({
      destination: cesium.Cartesian3.fromDegrees(
        model.lon,
        model.lat,
        model.height
      ),
    });

    setPrimitiveModels({
      ...primitiveModels,
      [model.id]: tileset,
    });
  };

  const removeModel = (modelId: string) => {
    setModels((prevModels) => {
      const newModels = prevModels.filter((model) => model.id !== modelId);
      setAreToolsEnabled(newModels.length > 0);
      return newModels;
    });
    const primitive = primitiveModels[modelId];
    if (!primitive) return;
    cesiumMap.entities.remove(primitive);
    if (primitive?.destroy) primitive.destroy();
    const newPrimitivesModels = { ...primitiveModels };
    delete newPrimitivesModels[modelId];
    setPrimitiveModels(newPrimitivesModels);
  };

  const setVisibleModel = (modelId: string, visible: boolean) => {
    const primitive = primitiveModels[modelId];
    if (!primitive) return;
    primitive.show = visible;
    setPrimitiveModels({
      ...primitiveModels,
      [modelId]: primitive,
    });
  };

  const isVisibleModel = (modelId: string): boolean => {
    const primitive = primitiveModels[modelId];
    if (!primitive) return false;
    return primitive?.show;
  };

  const zoomToModel = (modelId: string) => {
    const model = models.find((model) => model.id === modelId);
    if (model) {
      cesiumMap.camera.flyTo({
        destination: cesium.Cartesian3.fromDegrees(
          model.lon,
          model.lat,
          model.height
        ),
      });
      //cesiumMap.zoomTo(model);
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
        setVisibleModel,
        isVisibleModel,
        cesiumLabel,
        setCesiumLabel,
      }}
    >
      {children}
    </MapToolsContext.Provider>
  );
};

export default MapToolsProvider;

export const useMapTools = () => useContext(MapToolsContext);
