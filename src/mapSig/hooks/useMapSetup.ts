// Path: mapSig\hooks\useMapSetup.ts
import { useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { type MapState } from '../types';

const defaultMapConfig: MapState = {
  zoom: 4,
  center: {
    lat: -14.235004,
    lng: -51.92528,
  },
  bounds: {
    north: 5.271841,
    south: -33.752081,
    east: -34.793186,
    west: -73.982817,
  },
};

interface UseMapSetupOptions {
  containerId: string;
  initialState?: Partial<MapState>;
}

export function useMapSetup({ containerId, initialState }: UseMapSetupOptions) {
  const { setMapLibregl, setMap } = useMapsStore();

  useEffect(() => {
    const config = {
      ...defaultMapConfig,
      ...initialState,
    };

    const lib = window.maplibregl;
    if (!lib) {
      console.error(
        "MapLibre GL library not found in global scope (window.maplibregl). Make sure it's correctly loaded in index.html.",
      );
      return;
    }

    setMapLibregl(lib);

    const map = new lib.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [config.center.lng, config.center.lat],
      zoom: config.zoom,
      maxBounds: [
        [config.bounds.west, config.bounds.south],
        [config.bounds.east, config.bounds.north],
      ],
    });

    map.on('load', () => {
      setMap(map);
    });

    return () => {
      map.remove();
      setMap(null);
    };
  }, [containerId, initialState, setMap, setMapLibregl]);
}
