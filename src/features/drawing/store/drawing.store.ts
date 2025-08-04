// Path: features\drawing\store\drawing.store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';

type DrawingTool = 'select' | 'point' | 'line' | 'polygon' | 'text';
type EditMode = 'none' | 'drawing' | 'editing';

interface DrawingState {
  activeTool: DrawingTool;
  editMode: EditMode;
  isDrawing: boolean;
  currentFeature: ExtendedFeature | null;
  activeLayerId: string | null;
  snapEnabled: boolean;
}

interface DrawingActions {
  setActiveTool: (tool: DrawingTool) => void;
  setEditMode: (mode: EditMode) => void;
  startDrawing: () => void;
  stopDrawing: () => void;
  setCurrentFeature: (feature: ExtendedFeature | null) => void;
  updateCurrentFeature: (updates: Partial<ExtendedFeature>) => void;
  clearCurrentFeature: () => void;
  setActiveLayerId: (layerId: string | null) => void;
  toggleSnap: () => void;
  reset: () => void;
}

const initialState: DrawingState = {
  activeTool: 'select',
  editMode: 'none',
  isDrawing: false,
  currentFeature: null,
  activeLayerId: null,
  snapEnabled: true,
};

export const useDrawingStore = create<DrawingState & DrawingActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setActiveTool: tool => {
        set(
          state => ({
            activeTool: tool,
            editMode: tool === 'select' ? 'none' : 'drawing',
            currentFeature: tool !== state.activeTool ? null : state.currentFeature,
            isDrawing: false,
          }),
          false,
          'setActiveTool'
        );
      },

      setEditMode: mode => {
        set({ editMode: mode }, false, 'setEditMode');
      },

      startDrawing: () => {
        set({ isDrawing: true, editMode: 'drawing' }, false, 'startDrawing');
      },

      stopDrawing: () => {
        set(
          {
            isDrawing: false,
            editMode: get().activeTool === 'select' ? 'none' : 'drawing',
          },
          false,
          'stopDrawing'
        );
      },

      setCurrentFeature: feature => {
        set({ currentFeature: feature }, false, 'setCurrentFeature');
      },

      updateCurrentFeature: updates => {
        set(
          state => ({
            currentFeature: state.currentFeature ? { ...state.currentFeature, ...updates } : null,
          }),
          false,
          'updateCurrentFeature'
        );
      },

      clearCurrentFeature: () => {
        set({ currentFeature: null }, false, 'clearCurrentFeature');
      },

      setActiveLayerId: layerId => {
        set({ activeLayerId: layerId }, false, 'setActiveLayerId');
      },

      toggleSnap: () => {
        set(state => ({ snapEnabled: !state.snapEnabled }), false, 'toggleSnap');
      },

      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    { name: 'drawing-store' }
  )
);

export const useDrawingActions = () => {
  return useDrawingStore(state => ({
    setActiveTool: state.setActiveTool,
    startDrawing: state.startDrawing,
    stopDrawing: state.stopDrawing,
    setCurrentFeature: state.setCurrentFeature,
    updateCurrentFeature: state.updateCurrentFeature,
    clearCurrentFeature: state.clearCurrentFeature,
    setActiveLayerId: state.setActiveLayerId,
    toggleSnap: state.toggleSnap,
    reset: state.reset,
  }));
};
