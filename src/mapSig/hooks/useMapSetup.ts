// Path: mapSig\hooks\useMapSetup.ts
import { useEffect } from 'react';

import { defaultMapStyle } from '@/shared/config/baseMapStyles';
import { useMapsStore } from '@/shared/store/mapsStore';

import { type MapState } from '../types';

const defaultMapConfig: MapState = {
  zoom: 4,
  minZoom: 11,
  maxZoom: 17.9,
  maxPitch: 75,
  center: {
    lat: -14.235004,
    lng: -51.92528,
  },
  bounds: {
    north: -21.30216,
    south: -22.6995,
    east: -43.92333,
    west: -45.82515,
  },
};

interface MapSetupOptions {
  containerId: string;
  initialState?: Partial<MapState>;
}

export function useMapSetup({ containerId, initialState }: MapSetupOptions) {
  const { map, setMap, setMapLibregl } = useMapsStore();

  useEffect(() => {
    const config = {
      ...defaultMapConfig,
      ...initialState,
    };
    const maplibreglInstance = window.maplibregl;
    if (!maplibreglInstance) {
      console.error(
        "MapLibre GL library not found in global scope (window.maplibregl). Make sure it's correctly loaded in index.html.",
      );
      return;
    }

    setMapLibregl(maplibreglInstance);

    const map = new maplibreglInstance.Map({
      container: containerId,
      style: defaultMapStyle,
      center: [config.center.lng, config.center.lat],
      zoom: config.zoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      maxPitch: config.maxPitch,
      maxBounds: [
        [config.bounds.west, config.bounds.south],
        [config.bounds.east, config.bounds.north],
      ],
    });

    setMap(map);

    // Cleanup function
    return () => {
      if (map) {
        setMap(null);
        map.remove();
      }
    };
  }, [containerId, initialState, setMap, setMapLibregl]);

  return map;
}
