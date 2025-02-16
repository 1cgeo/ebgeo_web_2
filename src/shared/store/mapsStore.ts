// Path: shared\store\mapsStore.ts
import { create } from 'zustand';

interface MapsState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cesium: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maplibregl: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cesiumMap: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMap: (map: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setCesium: (cesium: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMapLibregl: (maplibregl: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setCesiumMap: (cesiumMap: any) => void;
}

export const useMapsStore = create<MapsState>(set => ({
  map: null,
  cesium: null,
  maplibregl: null,
  cesiumMap: null,
  setMap: map => set({ map }),
  setCesium: cesium => set({ cesium }),
  setMapLibregl: maplibregl => set({ maplibregl }),
  setCesiumMap: cesiumMap => set({ cesiumMap }),
}));
