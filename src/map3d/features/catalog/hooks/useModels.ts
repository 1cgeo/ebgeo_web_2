import { useCallback, useEffect, useRef } from 'react';
import { useMapsStore } from '@/shared/store/mapsStore';
import { type CatalogItem } from '../types';
import { getModelUrl } from '../api';

export function useModels() {
  const { cesium, cesiumMap } = useMapsStore();
  const primitiveRefs = useRef<Record<string, any>>({});

  // Handlers para diferentes tipos de modelo
  const addTiles3D = useCallback((model: CatalogItem) => {
    if (!cesium || !cesiumMap) return;

    const tileset = cesiumMap.scene.primitives.add(
      new cesium.Cesium3DTileset({
        url: getModelUrl(model.type, model.url),
        maximumScreenSpaceError: model.maximumscreenspaceerror,
        maximumMemoryUsage: 512,
        preferLeaves: true,
        dynamicScreenSpaceError: true,
        dynamicScreenSpaceErrorDensity: 0.00278,
        dynamicScreenSpaceErrorFactor: 4.0,
        dynamicScreenSpaceErrorHeightFalloff: 0.25,
      })
    );

    primitiveRefs.current[model.id] = tileset;

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
        model.heightoffset || 0
      );
      const translation = cesium.Cartesian3.subtract(
        offset,
        surface,
        new cesium.Cartesian3()
      );
      tileset.modelMatrix = cesium.Matrix4.fromTranslation(translation);

      flyToModel(model);
    });
  }, [cesium, cesiumMap]);

  const addModelos3D = useCallback((model: CatalogItem) => {
    if (!cesium || !cesiumMap) return;

    const position = cesium.Cartesian3.fromDegrees(
      model.lon,
      model.lat,
      model.height
    );
    const heading = cesium.Math.toRadians(model.heading || 0);
    const pitch = cesium.Math.toRadians(model.pitch || 0);
    const roll = cesium.Math.toRadians(model.roll || 0);
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
        uri: getModelUrl(model.type, model.url),
      },
    });

    primitiveRefs.current[model.id] = entity;
    flyToModel(model);
  }, [cesium, cesiumMap]);

  const addPointCloud = useCallback((model: CatalogItem) => {
    if (!cesium || !cesiumMap) return;

    const pointCloudShading = new cesium.PointCloudShading({
      attenuation: true,
      geometricErrorScale: 1.0,
      maximumAttenuation: 10.0,
      baseResolution: 0.05,
      eyeDomeLighting: true,
    });

    const tileset = new cesium.Cesium3DTileset({
      url: getModelUrl(model.type, model.url),
    });

    if (model.style) {
      tileset.style = new cesium.Cesium3DTileStyle(model.style);
    }

    tileset.pointCloudShading = pointCloudShading;
    cesiumMap.scene.primitives.add(tileset);

    primitiveRefs.current[model.id] = tileset;
    flyToModel(model);
  }, [cesium, cesiumMap]);

  const flyToModel = useCallback((model: CatalogItem) => {
    if (!cesium || !cesiumMap) return;

    cesiumMap.camera.flyTo({
      destination: cesium.Cartesian3.fromDegrees(
        model.lon,
        model.lat,
        model.height
      ),
    });
  }, [cesium, cesiumMap]);

  const removeModel = useCallback((modelId: string) => {
    if (!cesiumMap) return;

    const primitive = primitiveRefs.current[modelId];
    if (!primitive) return;

    // Remove do Cesium
    cesiumMap.entities.remove(primitive);
    if (primitive.destroy) {
      primitive.destroy();
    }

    delete primitiveRefs.current[modelId];
  }, [cesiumMap]);

  const setModelVisibility = useCallback((modelId: string, visible: boolean) => {
    const primitive = primitiveRefs.current[modelId];
    if (!primitive) return;

    primitive.show = visible;
  }, []);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      Object.values(primitiveRefs.current).forEach(primitive => {
        if (primitive.destroy) {
          primitive.destroy();
        }
      });
      primitiveRefs.current = {};
    };
  }, []);

  return {
    addModel: useCallback((model: CatalogItem) => {
      const handlers = {
        'Tiles 3D': addTiles3D,
        'Modelos 3D': addModelos3D,
        'Nuvem de Pontos': addPointCloud,
      };

      const handler = handlers[model.type];
      if (handler) {
        handler(model);
      }
    }, [addTiles3D, addModelos3D, addPointCloud]),
    removeModel,
    setModelVisibility,
    flyToModel,
  };
}