// Path: mapSig\hooks\useMapSetup.ts
import { type Map as MapLibreMap } from 'maplibre-gl';

import { useEffect } from 'react';

import { useMapSigStore } from '../store';
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
  const { setMap } = useMapSigStore();

  useEffect(() => {
    const config = {
      ...defaultMapConfig,
      ...initialState,
    };

    const map = new MapLibreMap({
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
  }, [containerId, initialState, setMap]);
}
