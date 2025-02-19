// Path: map3d\features\identify\useIdentify.ts
import { useCallback, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { fetchFeatureInfo } from './api';
import { useIdentifyStore } from './store';
import { type IdentifyPosition, IdentifyToolState } from './types';

export function useIdentify() {
  const cesiumMap = useMapsStore(state => state.cesiumMap);
  const cesium = useMapsStore(state => state.cesium);
  const {
    toolState,
    featureInfo,
    activateTool,
    deactivateTool,
    setFeatureInfo,
    setPosition,
    setLoading,
    setError,
    clearInfo,
  } = useIdentifyStore();

  // Função para buscar informações de feature na API
  const handleFeatureIdentify = useCallback(
    async (position: IdentifyPosition) => {
      try {
        setLoading();
        setPosition(position);

        const data = await fetchFeatureInfo(position);
        setFeatureInfo(data);
      } catch (error) {
        console.error('Erro ao buscar informações da feature:', error);
        setError((error as Error).message || 'Erro desconhecido');
      }
    },
    [setLoading, setPosition, setFeatureInfo, setError],
  );

  // Função para obter coordenadas 3D a partir de um clique
  const handleMapClick = useCallback(
    (event: MouseEvent) => {
      if (toolState !== IdentifyToolState.ACTIVE || !cesium || !cesiumMap)
        return;

      const canvas = cesiumMap.scene.canvas;
      const rect = canvas.getBoundingClientRect();
      const position = new cesium.Cartesian2(
        event.clientX - rect.left,
        event.clientY - rect.top,
      );

      const pickedFeature = cesiumMap.scene.pick(position);
      if (cesium.defined(pickedFeature)) {
        const cartesian = cesiumMap.scene.pickPosition(position);
        if (cesium.defined(cartesian)) {
          const cartographic = cesium.Cartographic.fromCartesian(cartesian);
          const longitude = cesium.Math.toDegrees(cartographic.longitude);
          const latitude = cesium.Math.toDegrees(cartographic.latitude);
          const height = cartographic.height;

          handleFeatureIdentify({ longitude, latitude, height });
        }
      }
    },
    [toolState, cesium, cesiumMap, handleFeatureIdentify],
  );

  // Adiciona/remove o handler de click quando o estado da ferramenta muda
  useEffect(() => {
    if (!cesiumMap) return;

    if (toolState === IdentifyToolState.ACTIVE) {
      // Atualiza o cursor
      cesiumMap.canvas.style.cursor = 'help';

      // Adiciona o handler de click
      cesiumMap.canvas.addEventListener('click', handleMapClick);
    } else {
      // Restaura o cursor
      cesiumMap.canvas.style.cursor = '';

      // Remove o handler de click
      cesiumMap.canvas.removeEventListener('click', handleMapClick);
    }

    // Cleanup
    return () => {
      if (cesiumMap) {
        cesiumMap.canvas.style.cursor = '';
        cesiumMap.canvas.removeEventListener('click', handleMapClick);
      }
    };
  }, [cesiumMap, toolState, handleMapClick]);

  return {
    isActive: toolState === IdentifyToolState.ACTIVE,
    isLoading: toolState === IdentifyToolState.LOADING,
    hasError: toolState === IdentifyToolState.ERROR,
    featureInfo,
    activateTool,
    deactivateTool,
    clearInfo,
  };
}
