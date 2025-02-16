import { create } from 'zustand';
import { createModelsSlice, type ModelsSlice } from './slices/models';
import { createToolsSlice, type ToolsSlice } from './slices/tools';
import { createCameraSlice, type CameraSlice } from './slices/camera';

interface Map3DStore extends 
  ModelsSlice,
  ToolsSlice,
  CameraSlice {}

export const useMap3DStore = create<Map3DStore>()((...args) => ({
  ...createModelsSlice(...args),
  ...createToolsSlice(...args),
  ...createCameraSlice(...args),
}));