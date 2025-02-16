// Path: map3d\features\label\useLabel.ts
import { useEffect, useCallback } from 'react';
import { useMapsStore } from '@/shared/store/mapsStore';
import { useMap3DStore } from '@/map3d/store';
import { useLabelStore } from './store';

export function useLabel() {
  const { cesium, cesiumMap } = useMapsStore();
  const { activeTool } = useMap3DStore();
  const { 
    addLabel,
    selectLabel,
    labels,
  } = useLabelStore();

  const isActive = activeTool === 'label';

  // Handler para clique no mapa
  const handleMapClick = useCallback((event: any) => {
    if (!isActive || !cesium || !cesiumMap) return;

    const { position } = event;
    const cartesian = cesiumMap.scene.pickPosition(position);
    
    if (!cartesian) return;

    addLabel({
      x: cartesian.x,
      y: cartesian.y,
      z: cartesian.z,
    });
  }, [isActive, cesium, cesiumMap, addLabel]);

  // Handler para seleção de label existente
  const handleLabelSelect = useCallback((event: any) => {
    if (!isActive || !cesium || !cesiumMap) return;

    const pickedObject = cesiumMap.scene.pick(event.position);
    if (cesium.defined(pickedObject) && pickedObject.id) {
      const label = labels.find(l => l.id === pickedObject.id.id);
      if (label) {
        selectLabel(label);
      }
    }
  }, [isActive, cesium, cesiumMap, labels, selectLabel]);

  // Setup dos event listeners
  useEffect(() => {
    if (!cesiumMap) return;

    const handler = new cesium?.ScreenSpaceEventHandler(cesiumMap.scene.canvas);

    if (isActive) {
      handler.setInputAction(handleMapClick, cesium?.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(handleLabelSelect, cesium?.ScreenSpaceEventType.LEFT_CLICK);
    }

    return () => {
      handler.destroy();
    };
  }, [
    cesium,
    cesiumMap,
    isActive,
    handleMapClick,
    handleLabelSelect
  ]);
}