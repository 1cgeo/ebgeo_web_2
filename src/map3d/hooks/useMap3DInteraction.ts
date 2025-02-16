// Path: map3d\hooks\useMap3DInteraction.ts
import { useCallback, useEffect, useRef } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type Cartesian3, validateCartesian } from '../types';

interface UseMap3DInteractionOptions {
  enabled?: boolean;
  onClick?: (position: Cartesian3) => void;
  onRightClick?: (position: Cartesian3) => void;
  onMouseMove?: (position: Cartesian3) => void;
  onPickEntity?: (entity: any) => void;
}

export function useMap3DInteraction(options: UseMap3DInteractionOptions = {}) {
  const { cesium, cesiumMap } = useMapsStore();
  const handlerRef = useRef<any>(null);

  const handleClick = useCallback(
    (event: any) => {
      if (!cesium || !cesiumMap) return;

      const cartesian = cesiumMap.scene.pickPosition(event.position);
      if (!cartesian) return;

      const position = validateCartesian({
        x: cartesian.x,
        y: cartesian.y,
        z: cartesian.z,
      });

      const pickedEntity = cesiumMap.scene.pick(event.position);
      if (pickedEntity) {
        options.onPickEntity?.(pickedEntity);
      }

      options.onClick?.(position);
    },
    [cesium, cesiumMap, options],
  );

  const handleRightClick = useCallback(
    (event: any) => {
      if (!cesium || !cesiumMap || !options.onRightClick) return;

      const cartesian = cesiumMap.scene.pickPosition(event.position);
      if (!cartesian) return;

      const position = validateCartesian({
        x: cartesian.x,
        y: cartesian.y,
        z: cartesian.z,
      });

      options.onRightClick(position);
    },
    [cesium, cesiumMap, options],
  );

  const handleMouseMove = useCallback(
    (event: any) => {
      if (!cesium || !cesiumMap || !options.onMouseMove) return;

      const cartesian = cesiumMap.scene.pickPosition(event.endPosition);
      if (!cartesian) return;

      const position = validateCartesian({
        x: cartesian.x,
        y: cartesian.y,
        z: cartesian.z,
      });

      options.onMouseMove(position);
    },
    [cesium, cesiumMap, options],
  );

  useEffect(() => {
    if (!cesium || !cesiumMap || !options.enabled) return;

    const handler = new cesium.ScreenSpaceEventHandler(cesiumMap.scene.canvas);
    handlerRef.current = handler;

    if (options.onClick) {
      handler.setInputAction(
        handleClick,
        cesium.ScreenSpaceEventType.LEFT_CLICK,
      );
    }

    if (options.onRightClick) {
      handler.setInputAction(
        handleRightClick,
        cesium.ScreenSpaceEventType.RIGHT_CLICK,
      );
    }

    if (options.onMouseMove) {
      handler.setInputAction(
        handleMouseMove,
        cesium.ScreenSpaceEventType.MOUSE_MOVE,
      );
    }

    return () => {
      handler.destroy();
      handlerRef.current = null;
    };
  }, [
    cesium,
    cesiumMap,
    options.enabled,
    handleClick,
    handleRightClick,
    handleMouseMove,
  ]);

  return {
    isEnabled: options.enabled,
  };
}
