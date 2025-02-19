// Path: map3d\features\label\useLabel.ts
import { useCallback, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { useMap3DStore } from '@/map3d/store';
import { EventEmitter } from '@/map3d/utils/events';

import { useLabelStore } from './store';
import { type LabelPosition } from './types';

export function useLabel() {
  const { cesium, cesiumMap } = useMapsStore();
  const { activeTool } = useMap3DStore();
  const { addLabel, selectLabel, labels } = useLabelStore();

  const isActive = activeTool === 'label';

  // Handler para clique no mapa
  const handleMapClick = useCallback(
    (event: any) => {
      if (!isActive || !cesium || !cesiumMap) return;

      const { position } = event;
      const cartesian = cesiumMap.scene.pickPosition(position);

      if (!cartesian) return;

      const labelPosition: LabelPosition = {
        x: cartesian.x,
        y: cartesian.y,
        z: cartesian.z,
      };

      addLabel(labelPosition);
    },
    [isActive, cesium, cesiumMap, addLabel],
  );

  // Handler para seleção de rótulo existente
  const handleLabelSelect = useCallback(
    (event: any) => {
      if (!isActive || !cesium || !cesiumMap) return;

      const pickedObject = cesiumMap.scene.pick(event.position);
      if (cesium.defined(pickedObject) && pickedObject.id) {
        const label = labels.find(l => l.id === pickedObject.id.id);
        if (label) {
          selectLabel(label);
          EventEmitter.dispatch('3d-label-select', label);
        }
      }
    },
    [isActive, cesium, cesiumMap, labels, selectLabel],
  );

  // Setup dos event listeners
  useEffect(() => {
    if (!cesiumMap) return;

    if (isActive) {
      cesiumMap.canvas.addEventListener('click', handleMapClick);
      cesiumMap.canvas.addEventListener('click', handleLabelSelect);

      return () => {
        cesiumMap.canvas.removeEventListener('click', handleMapClick);
        cesiumMap.canvas.removeEventListener('click', handleLabelSelect);
      };
    }
  }, [cesiumMap, isActive, handleMapClick, handleLabelSelect]);

  return {
    onSelect: (callback: (label: Label) => void) => {
      EventEmitter.subscribe('3d-label-select', callback);
      return () => EventEmitter.unsubscribe('3d-label-select');
    },
  };
}
