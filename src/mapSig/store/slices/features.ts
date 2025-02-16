import { type StateCreator } from 'zustand';
import { z } from 'zod';

const featureSchema = z.object({
  id: z.string(),
  type: z.string(),
  properties: z.record(z.unknown()),
  geometry: z.object({
    type: z.string(),
    coordinates: z.array(z.number()).or(z.array(z.array(z.number())))
  })
});

export type Feature = z.infer<typeof featureSchema>;

export interface FeaturesSlice {
  features: Feature[];
  addFeature: (feature: Feature) => void;
  removeFeature: (id: string) => void;
  clearFeatures: () => void;
}

export const createFeaturesSlice: StateCreator<FeaturesSlice> = (set) => ({
  features: [],
  
  addFeature: (feature) => 
    set((state) => ({
      features: [...state.features, featureSchema.parse(feature)]
    })),
  
  removeFeature: (id) =>
    set((state) => ({
      features: state.features.filter(f => f.id !== id)
    })),
    
  clearFeatures: () => set({ features: [] })
});