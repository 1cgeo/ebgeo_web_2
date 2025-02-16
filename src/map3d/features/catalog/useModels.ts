// Path: map3d\features\catalog\useModels.ts
import { useCallback, useEffect, useRef } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { getModelUrl, isModelos3D, isNuvemPontos, isTiles3D } from './api';
import { type Model3D } from './types';

export function useModels() {
  const { cesium, cesiumMap } = useMapsStore();
  const modelRefs = useRef<Record<string, any>>({});

  // Adiciona modelo à cena
  const addModel = useCallback(
    (model: Model3D) => {
      if (!cesium || !cesiumMap) return;

      if (isTiles3D(model)) {
        // Adiciona Tileset 3D
        const tileset = cesiumMap.scene.primitives.add(
          new cesium.Cesium3DTileset({
            url: getModelUrl(model),
            maximumScreenSpaceError: model.erro_maximo_tela,
            maximumMemoryUsage: 512,
            preferLeaves: true,
          }),
        );

        modelRefs.current[model.id] = tileset;

        // Configura posição e orientação
        tileset.readyPromise.then(() => {
          const boundingSphere = tileset.boundingSphere;
          const cartographic = cesium.Cartographic.fromCartesian(
            boundingSphere.center,
          );
          const surface = cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            0.0,
          );
          const offset = cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            model.offset_altura,
          );
          const translation = cesium.Cartesian3.subtract(
            offset,
            surface,
            new cesium.Cartesian3(),
          );
          tileset.modelMatrix = cesium.Matrix4.fromTranslation(translation);
        });
      } else if (isModelos3D(model)) {
        // Adiciona modelo GLB/GLTF
        const position = cesium.Cartesian3.fromDegrees(
          model.coordenadas.lon,
          model.coordenadas.lat,
          model.coordenadas.altura,
        );
        const heading = cesium.Math.toRadians(model.heading);
        const pitch = cesium.Math.toRadians(model.pitch);
        const roll = cesium.Math.toRadians(model.roll);
        const hpr = new cesium.HeadingPitchRoll(heading, pitch, roll);
        const orientation = cesium.Transforms.headingPitchRollQuaternion(
          position,
          hpr,
        );

        const entity = cesiumMap.entities.add({
          name: model.nome,
          position,
          orientation,
          model: {
            uri: getModelUrl(model),
          },
        });

        modelRefs.current[model.id] = entity;
      } else if (isNuvemPontos(model)) {
        // Adiciona nuvem de pontos
        const pointCloudShading = new cesium.PointCloudShading({
          attenuation: true,
          geometricErrorScale: 1.0,
          maximumAttenuation: 10.0,
          baseResolution: 0.05,
          eyeDomeLighting: true,
        });

        const tileset = new cesium.Cesium3DTileset({
          url: getModelUrl(model),
          pointCloudShading,
        });

        if (model.estilo) {
          tileset.style = new cesium.Cesium3DTileStyle(model.estilo);
        }

        cesiumMap.scene.primitives.add(tileset);
        modelRefs.current[model.id] = tileset;
      }
    },
    [cesium, cesiumMap],
  );

  // Remove modelo da cena
  const removeModel = useCallback(
    (modelId: string) => {
      const model = modelRefs.current[modelId];
      if (!model) return;

      if (model.destroy) {
        model.destroy();
      } else {
        cesiumMap?.entities.remove(model);
      }

      delete modelRefs.current[modelId];
    },
    [cesiumMap],
  );

  // Altera visibilidade do modelo
  const setModelVisibility = useCallback(
    (modelId: string, visible: boolean) => {
      const model = modelRefs.current[modelId];
      if (!model) return;

      model.show = visible;
    },
    [],
  );

  // Limpa modelos na desmontagem
  useEffect(() => {
    return () => {
      Object.values(modelRefs.current).forEach(model => {
        if (model.destroy) {
          model.destroy();
        }
      });
      modelRefs.current = {};
    };
  }, []);

  return {
    addModel,
    removeModel,
    setModelVisibility,
  };
}
