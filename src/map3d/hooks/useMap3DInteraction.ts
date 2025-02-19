// Path: map3d\hooks\useMap3DInteraction.ts
import { useCallback, useEffect, useRef } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type Cartesian3, validateCartesian } from '@/map3d/types';
import { EventEmitter } from '@/map3d/utils/events';

interface UseMap3DInteractionOptions {
  enabled?: boolean;
  onClick?: (position: Cartesian3) => void;
  onRightClick?: (position: Cartesian3) => void;
  onMouseMove?: (position: Cartesian3) => void;
  onPickEntity?: (entity: any) => void;
  onHoverEntity?: (entity: any) => void;
}

interface UseMap3DInteractionResult {
  isEnabled: boolean;
  addCustomHandler: (
    eventType: string,
    callback: (event: any) => void,
  ) => () => void;
}

export function useMap3DInteraction(
  options: UseMap3DInteractionOptions = {},
): UseMap3DInteractionResult {
  const { cesium, cesiumMap } = useMapsStore();
  const handlerRef = useRef<any>(null);
  const customHandlersRef = useRef<Map<string, (event: any) => void>>(
    new Map(),
  );

  const handleClick = useCallback(
    (event: any) => {
      if (!cesium || !cesiumMap || !options.onClick) return;

      const cartesian = cesiumMap.scene.pickPosition(event.position);
      if (!cartesian) return;

      const position = validateCartesian({
        x: cartesian.x,
        y: cartesian.y,
        z: cartesian.z,
      });

      const pickedEntity = cesiumMap.scene.pick(event.position);
      if (pickedEntity && options.onPickEntity) {
        options.onPickEntity(pickedEntity);
        EventEmitter.dispatch('map3d:entity-picked', pickedEntity);
      }

      options.onClick(position);
    },
    [cesium, cesiumMap, options.onClick, options.onPickEntity],
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
    [cesium, cesiumMap, options.onRightClick],
  );

  const handleMouseMove = useCallback(
    (event: any) => {
      if (!cesium || !cesiumMap) return;

      const cartesian = cesiumMap.scene.pickPosition(event.endPosition);
      if (!cartesian) return;

      const position = validateCartesian({
        x: cartesian.x,
        y: cartesian.y,
        z: cartesian.z,
      });

      if (options.onMouseMove) {
        options.onMouseMove(position);
      }

      // Hover entity handling
      if (options.onHoverEntity) {
        const pickedEntity = cesiumMap.scene.pick(event.endPosition);
        if (pickedEntity) {
          options.onHoverEntity(pickedEntity);
          EventEmitter.dispatch('map3d:entity-hover', pickedEntity);
        }
      }
    },
    [cesium, cesiumMap, options.onMouseMove, options.onHoverEntity],
  );

  // API para adicionar manipuladores personalizados
  const addCustomHandler = useCallback(
    (eventType: string, callback: (event: any) => void) => {
      if (!cesium || !cesiumMap || !handlerRef.current) return () => {};

      const cesiumEventType = cesium.ScreenSpaceEventType[eventType];
      if (!cesiumEventType) {
        console.warn(`Tipo de evento inválido: ${eventType}`);
        return () => {};
      }

      customHandlersRef.current.set(eventType, callback);
      handlerRef.current.setInputAction(callback, cesiumEventType);

      return () => {
        if (handlerRef.current) {
          handlerRef.current.removeInputAction(cesiumEventType);
        }
        customHandlersRef.current.delete(eventType);
      };
    },
    [cesium, cesiumMap],
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

    if (options.onMouseMove || options.onHoverEntity) {
      handler.setInputAction(
        handleMouseMove,
        cesium.ScreenSpaceEventType.MOUSE_MOVE,
      );
    }

    // Restaurar manipuladores personalizados quando o manipulador é recriado
    customHandlersRef.current.forEach((callback, eventType) => {
      const cesiumEventType = cesium.ScreenSpaceEventType[eventType];
      if (cesiumEventType) {
        handler.setInputAction(callback, cesiumEventType);
      }
    });

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
    options.onClick,
    options.onRightClick,
    options.onMouseMove,
    options.onHoverEntity,
  ]);

  return {
    isEnabled: !!options.enabled && !!cesiumMap,
    addCustomHandler,
  };
}
