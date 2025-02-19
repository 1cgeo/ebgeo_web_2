// Path: map3d\features\viewshed\useViewshed.ts
import { useCallback, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { useViewshedStore } from './store';
import { ViewshedToolState } from './types';

export default function useViewshed() {
  const cesiumMap = useMapsStore(state => state.cesiumMap);
  const cesium = useMapsStore(state => state.cesium);
  const {
    toolState,
    viewshedInstance,
    startViewshedAnalysis,
    cancelViewshedAnalysis,
    setViewshedInstance,
    clearViewshed,
  } = useViewshedStore();

  // Inicializa a instância de viewshed quando o mapa estiver pronto
  useEffect(() => {
    if (!cesiumMap || !cesium || !window.cesiumViewshed) return;

    // Verifica se já existe uma instância
    if (!viewshedInstance) {
      try {
        // Inicializa o viewshed usando o módulo externo
        const instance = new window.cesiumViewshed(cesium, cesiumMap);
        setViewshedInstance(instance);
      } catch (error) {
        console.error('Erro ao inicializar módulo de viewshed:', error);
      }
    }

    return () => {
      cancelViewshedAnalysis();
    };
  }, [
    cesiumMap,
    cesium,
    viewshedInstance,
    setViewshedInstance,
    cancelViewshedAnalysis,
  ]);

  // Função para adicionar um viewshed
  const addViewshed = useCallback(() => {
    if (!viewshedInstance) return;

    try {
      // Inicia a análise de viewshed usando o módulo externo
      viewshedInstance.addViewshed();
      startViewshedAnalysis();
    } catch (error) {
      console.error('Erro ao adicionar viewshed:', error);
    }
  }, [viewshedInstance, startViewshedAnalysis]);

  // Função para limpar o viewshed
  const clean = useCallback(() => {
    clearViewshed();
  }, [clearViewshed]);

  return {
    isActive: toolState === ViewshedToolState.ACTIVE,
    addViewshed,
    cancelViewshedAnalysis,
    clean,
  };
}
