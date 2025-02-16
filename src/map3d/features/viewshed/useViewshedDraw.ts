// Path: map3d\features\viewshed\useViewshedDraw.ts
import { useEffect, useCallback, useRef } from 'react';
import { useMapsStore } from '@/shared/store/mapsStore';
import { useMap3DStore } from '@/map3d/store';
import { useViewshedStore } from './store';
import { type Cartesian } from './types';

export function useViewshedDraw() {
  const { cesium, cesiumMap } = useMapsStore();
  const { activeTool } = useMap3DStore();
  const viewshedRefs = useRef<Record<string, any>>({});
  
  const { 
    currentViewshed,
    viewsheds,
    style,
    setViewshedPoint,
    completeViewshed 
  } = useViewshedStore();

  const isActive = activeTool === 'viewshed';

  // Cria um novo viewshed
  const createViewshed = useCallback((options: any) => {
    if (!cesium || !cesiumMap) return null;

    return new cesium.ViewShed3D(cesiumMap, {
      horizontalAngle: options.horizontalAngle,
      verticalAngle: options.verticalAngle,
      distance: options.distance,
      calback: () => {
        // Callback chamado quando o usuário finaliza a edição
        completeViewshed();
      },
    });
  }, [cesium, cesiumMap, completeViewshed]);

  // Event handlers
  const handleLeftClick = useCallback((event: any) => {
    if (!isActive || !cesium || !cesiumMap) return;

    const { position } = event;
    const cartesian = cesiumMap.scene.pickPosition(position);
    
    if (!cartesian) return;

    const point: Cartesian = {
      x: cartesian.x,
      y: cartesian.y,
      z: cartesian.z
    };

    setViewshedPoint(point);

    // Se já existe um viewshed atual, atualiza sua posição
    if (currentViewshed?.id && viewshedRefs.current[currentViewshed.id]) {
      const viewshed = viewshedRefs.current[currentViewshed.id];
      viewshed.viewPosition = cartesian;
    } else if (currentViewshed) {
      // Cria um novo viewshed
      const viewshed = createViewshed(currentViewshed);
      if (viewshed) {
        viewshed.viewPosition = cartesian;
        viewshedRefs.current[currentViewshed.id] = viewshed;
      }
    }
  }, [isActive, cesium, cesiumMap, currentViewshed, setViewshedPoint, createViewshed]);

  // Cleanup quando o componente é desmontado
  useEffect(() => {
    return () => {
      Object.values(viewshedRefs.current).forEach((viewshed: any) => {
        if (viewshed?.destroy) {
          viewshed.destroy();
        }
      });
      viewshedRefs.current = {};
    };
  }, []);

  // Setup event handlers
  useEffect(() => {
    if (!cesiumMap) return;

    const handler = new cesium?.ScreenSpaceEventHandler(cesiumMap.scene.canvas);
    handler.setInputAction(handleLeftClick, cesium?.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [cesium, cesiumMap, handleLeftClick]);

  return {
    viewshedRefs
  };
}