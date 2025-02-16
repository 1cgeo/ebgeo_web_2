// Path: map3d\features\area\useAreaDraw.ts
import { useEffect, useCallback } from 'react';
import { useMapsStore } from '@/shared/store/mapsStore';
import { useMap3DStore } from '@/map3d/store';
import { useAreaStore } from './store';
import { type Cartesian } from './types';

export function useAreaDraw() {
  const { cesium, cesiumMap } = useMapsStore();
  const { activeTool } = useMap3DStore();
  const { 
    currentArea,
    startNewArea,
    addPoint,
    completeArea 
  } = useAreaStore();

  const isActive = activeTool === 'area';

  // Calcula a área usando o turf.js
  const calculateArea = useCallback((positions: Cartesian[]): number => {
    if (!window.turf || positions.length < 3) return 0;

    const coordinates = positions.map(position => {
      const cartographic = cesium?.Cartographic.fromCartesian(
        new cesium.Cartesian3(position.x, position.y, position.z)
      );
      return [
        cesium?.Math.toDegrees(cartographic?.longitude || 0),
        cesium?.Math.toDegrees(cartographic?.latitude || 0)
      ];
    });

    // Fecha o polígono
    coordinates.push(coordinates[0]);

    const polygon = window.turf.polygon([coordinates]);
    return window.turf.area(polygon);
  }, [cesium]);

  // Event handlers
  const handleLeftClick = useCallback((event: any) => {
    if (!isActive || !cesium || !cesiumMap) return;

    const { position } = event;
    const cartesian = cesiumMap.scene.pickPosition(position);
    
    if (!cartesian) return;

    if (!currentArea) {
      startNewArea();
    }
    
    addPoint({
      x: cartesian.x,
      y: cartesian.y,
      z: cartesian.z
    });
  }, [isActive, cesium, cesiumMap, currentArea, startNewArea, addPoint]);

  const handleRightClick = useCallback(() => {
    if (!currentArea || currentArea.points.length < 3) return;

    const area = calculateArea(currentArea.points);
    completeArea(area);
  }, [currentArea, calculateArea, completeArea]);

  const handleMouseMove = useCallback((event: any) => {
    if (!isActive || !currentArea || !cesium || !cesiumMap) return;

    const { endPosition } = event;
    const cartesian = cesiumMap.scene.pickPosition(endPosition);
    
    if (!cartesian) return;

    // Atualizar visualização temporária
    if (currentArea.points.length > 0) {
      // Aqui você pode atualizar a visualização da área no mapa
      // sem modificar o estado
    }
  }, [isActive, currentArea, cesium, cesiumMap]);

  // Setup event handlers
  useEffect(() => {
    if (!cesiumMap) return;

    const handler = new cesium?.ScreenSpaceEventHandler(cesiumMap.scene.canvas);

    handler.setInputAction(handleLeftClick, cesium?.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(handleRightClick, cesium?.ScreenSpaceEventType.RIGHT_CLICK);
    handler.setInputAction(handleMouseMove, cesium?.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      handler.destroy();
    };
  }, [cesium, cesiumMap, handleLeftClick, handleRightClick, handleMouseMove]);

  return {
    calculateArea
  };
}