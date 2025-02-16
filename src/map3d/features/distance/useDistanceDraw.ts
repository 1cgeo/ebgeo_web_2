// Path: map3d\features\distance\useDistanceDraw.ts
import { useEffect, useCallback } from 'react';
import { useMapsStore } from '@/shared/store/mapsStore';
import { useMap3DStore } from '@/map3d/store';
import { useDistanceStore } from './store';

export function useDistanceDraw() {
  const { cesium, cesiumMap } = useMapsStore();
  const { activeTool } = useMap3DStore();
  const { 
    currentLine,
    startNewLine,
    addPoint,
    completeLine 
  } = useDistanceStore();

  const isActive = activeTool === 'distance';

  // Calcula a distância entre pontos
  const calculateDistance = useCallback((positions: any[]) => {
    if (!cesium || positions.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      const point1cartographic = cesium.Cartographic.fromCartesian(positions[i]);
      const point2cartographic = cesium.Cartographic.fromCartesian(positions[i + 1]);
      
      const geodesic = new cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      
      const surfaceDistance = geodesic.surfaceDistance;
      const heightDifference = point2cartographic.height - point1cartographic.height;
      
      // Distância 3D usando Pitágoras
      const distance = Math.sqrt(
        Math.pow(surfaceDistance, 2) + 
        Math.pow(heightDifference, 2)
      );
      
      totalDistance += distance;
    }

    return totalDistance;
  }, [cesium]);

  // Event handlers
  const handleLeftClick = useCallback((event: any) => {
    if (!isActive || !cesium || !cesiumMap) return;

    const { position } = event;
    const cartesian = cesiumMap.scene.pickPosition(position);
    
    if (!cartesian) return;

    if (!currentLine) {
      startNewLine();
    }
    
    addPoint({
      x: cartesian.x,
      y: cartesian.y,
      z: cartesian.z
    });
  }, [isActive, cesium, cesiumMap, currentLine, startNewLine, addPoint]);

  const handleRightClick = useCallback(() => {
    if (!currentLine || currentLine.points.length < 2) return;

    const positions = currentLine.points.map(point => 
      new cesium?.Cartesian3(point.x, point.y, point.z)
    );

    const distance = calculateDistance(positions);
    completeLine(distance);
  }, [cesium, currentLine, calculateDistance, completeLine]);

  const handleMouseMove = useCallback((event: any) => {
    if (!isActive || !currentLine || !cesium || !cesiumMap) return;

    const { endPosition } = event;
    const cartesian = cesiumMap.scene.pickPosition(endPosition);
    
    if (!cartesian) return;

    // Update preview point
    if (currentLine.points.length > 0) {
      const points = [...currentLine.points];
      if (points.length === 1) {
        points.push(cartesian);
      } else {
        points[points.length - 1] = {
          x: cartesian.x,
          y: cartesian.y,
          z: cartesian.z
        };
      }
      // Trigger update in visualization
    }
  }, [isActive, currentLine, cesium, cesiumMap]);

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
    calculateDistance
  };
}