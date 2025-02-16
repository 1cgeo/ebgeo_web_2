// Path: mapSig\features\featureSearch\useFeatureMarker.ts
import { useCallback, useRef } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type SearchFeature } from './types';

export function useFeatureMarker() {
  const markerRef = useRef<any>(null);
  const { map, maplibregl } = useMapsStore();

  const clearMarker = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, []);

  const setMarker = useCallback(
    (feature: SearchFeature) => {
      if (!map || !maplibregl) return;

      clearMarker();

      markerRef.current = new maplibregl.Marker()
        .setLngLat([feature.coordinates.lng, feature.coordinates.lat])
        .addTo(map);

      map.flyTo({
        center: [feature.coordinates.lng, feature.coordinates.lat],
        zoom: 14,
        duration: 1500,
      });
    },
    [map, maplibregl, clearMarker],
  );

  return {
    setMarker,
    clearMarker,
  };
}
