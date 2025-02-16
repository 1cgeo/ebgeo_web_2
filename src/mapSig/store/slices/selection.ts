import { type StateCreator } from 'zustand';
import { type Feature } from './features';

export interface SelectionSlice {
  selectedFeature: Feature | null;
  selectFeature: (feature: Feature | null) => void;
  clearSelection: () => void;
}

export const createSelectionSlice: StateCreator<SelectionSlice> = (set) => ({
  selectedFeature: null,
  
  selectFeature: (feature) => set({
    selectedFeature: feature
  }),
  
  clearSelection: () => set({
    selectedFeature: null
  })
});