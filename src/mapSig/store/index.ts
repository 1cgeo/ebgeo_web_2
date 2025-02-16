import { create } from 'zustand';
import { createFeaturesSlice, type FeaturesSlice } from './slices/features';
import { createPanelSlice, type PanelSlice } from './slices/panel';
import { createSelectionSlice, type SelectionSlice } from './slices/selection';
import { createToolsSlice, type ToolsSlice } from './slices/tools';

// Combina todos os tipos dos slices
interface MapSigStore extends 
  FeaturesSlice,
  PanelSlice,
  SelectionSlice,
  ToolsSlice {}

// Cria o store combinando os slices
export const useMapSigStore = create<MapSigStore>()((...args) => ({
  ...createFeaturesSlice(...args),
  ...createPanelSlice(...args),
  ...createSelectionSlice(...args),
  ...createToolsSlice(...args),
}));