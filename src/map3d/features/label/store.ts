// Path: map3d\features\label\store.ts
import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { useMap3DStore } from '@/map3d/store';

import {
  type Label,
  type LabelPosition,
  type LabelProperties,
  defaultLabelProperties,
} from './types';

interface LabelState {
  labels: Label[];
  selectedLabel: Label | null;
  isPanelOpen: boolean;

  // Actions
  addLabel: (position: LabelPosition) => void;
  updateLabel: (labelId: string, properties: Partial<LabelProperties>) => void;
  removeLabel: (labelId: string) => void;
  selectLabel: (label: Label | null) => void;
  clearLabels: () => void;
  openPanel: () => void;
  closePanel: () => void;
  reset: () => void;
}

export const useLabelStore = create<LabelState>(set => ({
  labels: [],
  selectedLabel: null,
  isPanelOpen: false,

  addLabel: position => {
    const newLabel: Label = {
      id: nanoid(),
      position,
      properties: defaultLabelProperties,
    };

    set(state => ({
      labels: [...state.labels, newLabel],
      selectedLabel: newLabel,
      isPanelOpen: true,
    }));
  },

  updateLabel: (labelId, properties) =>
    set(state => ({
      labels: state.labels.map(label =>
        label.id === labelId
          ? {
              ...label,
              properties: { ...label.properties, ...properties },
            }
          : label,
      ),
      selectedLabel:
        state.selectedLabel?.id === labelId
          ? {
              ...state.selectedLabel,
              properties: { ...state.selectedLabel.properties, ...properties },
            }
          : state.selectedLabel,
    })),

  removeLabel: labelId =>
    set(state => ({
      labels: state.labels.filter(label => label.id !== labelId),
      selectedLabel:
        state.selectedLabel?.id === labelId ? null : state.selectedLabel,
      isPanelOpen:
        state.selectedLabel?.id === labelId ? false : state.isPanelOpen,
    })),

  selectLabel: label =>
    set({
      selectedLabel: label,
      isPanelOpen: !!label,
    }),

  clearLabels: () => {
    set({
      labels: [],
      selectedLabel: null,
      isPanelOpen: false,
    });
    useMap3DStore.getState().clearActiveTool();
  },

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () =>
    set({
      isPanelOpen: false,
      selectedLabel: null,
    }),

  reset: () => {
    set({
      labels: [],
      selectedLabel: null,
      isPanelOpen: false,
    });
    useMap3DStore.getState().clearActiveTool();
  },
}));
