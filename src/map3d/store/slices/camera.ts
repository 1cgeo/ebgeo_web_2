import { type StateCreator } from 'zustand';
import { z } from 'zod';

const cameraPositionSchema = z.object({
  longitude: z.number(),
  latitude: z.number(),
  height: z.number(),
  heading: z.number(),
  pitch: z.number(),
  roll: z.number(),
});

export type CameraPosition = z.infer<typeof cameraPositionSchema>;

export interface CameraSlice {
  position: CameraPosition | null;
  savedPositions: Record<string, CameraPosition>;
  setPosition: (position: CameraPosition) => void;
  flyTo: (position: Partial<CameraPosition>, options?: { duration?: number }) => void;
  savePosition: (name: string) => void;
  loadPosition: (name: string) => CameraPosition | null;
  removeSavedPosition: (name: string) => void;
}

export const createCameraSlice: StateCreator<CameraSlice> = (set, get) => ({
  position: null,
  savedPositions: {},

  setPosition: (position) => set({
    position: cameraPositionSchema.parse(position)
  }),

  flyTo: (position, options = {}) => {
    const current = get().position;
    if (!current) return;

    set({
      position: {
        ...current,
        ...position,
      }
    });

    // Nota: A implementação real do flyTo seria feita no componente
    // que consome este store, usando a API do Cesium
  },

  savePosition: (name) => {
    const current = get().position;
    if (!current) return;

    set((state) => ({
      savedPositions: {
        ...state.savedPositions,
        [name]: current
      }
    }));
  },

  loadPosition: (name) => {
    const position = get().savedPositions[name];
    if (!position) return null;
    
    set({ position });
    return position;
  },

  removeSavedPosition: (name) => set((state) => {
    const { [name]: removed, ...rest } = state.savedPositions;
    return { savedPositions: rest };
  })
});