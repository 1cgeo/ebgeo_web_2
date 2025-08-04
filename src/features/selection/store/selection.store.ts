// Path: features\selection\store\selection.store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface SelectionState {
  selectedFeatureIds: string[];
  hoveredFeatureId: string | null;
  editingFeatureId: string | null;
  isMultiSelectMode: boolean;
}

interface SelectionActions {
  selectFeature: (featureId: string, mode?: 'single' | 'add' | 'toggle') => void;
  selectFeatures: (featureIds: string[]) => void;
  deselectFeature: (featureId: string) => void;
  clearSelection: () => void;
  toggleFeature: (featureId: string) => void;
  setHoveredFeature: (featureId: string | null) => void;
  setEditingFeature: (featureId: string | null) => void;
  setMultiSelectMode: (enabled: boolean) => void;
  isSelected: (featureId: string) => boolean;
  hasSelection: () => boolean;
  getSelectionCount: () => number;
  reset: () => void;
}

const initialState: SelectionState = {
  selectedFeatureIds: [],
  hoveredFeatureId: null,
  editingFeatureId: null,
  isMultiSelectMode: false,
};

export const useSelectionStore = create<SelectionState & SelectionActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      selectFeature: (featureId, mode = 'single') => {
        const state = get();

        switch (mode) {
          case 'single':
            set({ selectedFeatureIds: [featureId] }, false, 'selectFeature');
            break;
          case 'add':
            if (!state.selectedFeatureIds.includes(featureId)) {
              set(
                {
                  selectedFeatureIds: [...state.selectedFeatureIds, featureId],
                },
                false,
                'selectFeature'
              );
            }
            break;
          case 'toggle':
            get().toggleFeature(featureId);
            break;
        }
      },

      selectFeatures: featureIds => {
        set({ selectedFeatureIds: featureIds }, false, 'selectFeatures');
      },

      deselectFeature: featureId => {
        set(
          state => ({
            selectedFeatureIds: state.selectedFeatureIds.filter(id => id !== featureId),
          }),
          false,
          'deselectFeature'
        );
      },

      clearSelection: () => {
        set({ selectedFeatureIds: [] }, false, 'clearSelection');
      },

      toggleFeature: featureId => {
        const state = get();
        if (state.selectedFeatureIds.includes(featureId)) {
          get().deselectFeature(featureId);
        } else {
          get().selectFeature(featureId, 'add');
        }
      },

      setHoveredFeature: featureId => {
        set({ hoveredFeatureId: featureId }, false, 'setHoveredFeature');
      },

      setEditingFeature: featureId => {
        set({ editingFeatureId: featureId }, false, 'setEditingFeature');
      },

      setMultiSelectMode: enabled => {
        set({ isMultiSelectMode: enabled }, false, 'setMultiSelectMode');
      },

      isSelected: featureId => {
        return get().selectedFeatureIds.includes(featureId);
      },

      hasSelection: () => {
        return get().selectedFeatureIds.length > 0;
      },

      getSelectionCount: () => {
        return get().selectedFeatureIds.length;
      },

      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    { name: 'selection-store' }
  )
);

export const useSelectionActions = () => {
  return useSelectionStore(state => ({
    selectFeature: state.selectFeature,
    selectFeatures: state.selectFeatures,
    deselectFeature: state.deselectFeature,
    clearSelection: state.clearSelection,
    toggleFeature: state.toggleFeature,
    setHoveredFeature: state.setHoveredFeature,
    setEditingFeature: state.setEditingFeature,
    setMultiSelectMode: state.setMultiSelectMode,
    isSelected: state.isSelected,
    reset: state.reset,
  }));
};
