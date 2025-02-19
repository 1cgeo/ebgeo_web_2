// Path: map3d\features\label\store.ts
import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { getCesium } from '../../store';
import {
  type Label,
  type LabelCreatedHandler,
  type LabelPosition,
  type LabelProperties,
  type LabelRemovedHandler,
  type LabelSelectedHandler,
  LabelToolState,
  type LabelUpdatedHandler,
} from './types';

interface LabelState {
  // Estado
  toolState: LabelToolState;
  labels: Label[];
  selectedLabel: Label | null;
  defaultProperties: Omit<LabelProperties, 'id'>;

  // Event handlers
  onCreatedHandlers: Set<LabelCreatedHandler>;
  onSelectedHandlers: Set<LabelSelectedHandler>;
  onUpdatedHandlers: Set<LabelUpdatedHandler>;
  onRemovedHandlers: Set<LabelRemovedHandler>;

  // Ações - gerenciamento de estado
  setToolState: (state: LabelToolState) => void;
  startAddingLabel: () => void;
  cancelAddingLabel: () => void;

  // Ações - gerenciamento de etiquetas
  addLabel: (position: LabelPosition) => Label;
  updateLabel: (
    labelId: string,
    properties: Partial<Omit<LabelProperties, 'id'>>,
  ) => void;
  removeLabel: (labelId: string) => void;
  selectLabel: (labelId: string | null) => void;
  deselectAll: () => void;
  setDefaultProperties: (
    properties: Partial<Omit<LabelProperties, 'id'>>,
  ) => void;

  // Ações - event handlers
  addCreatedHandler: (handler: LabelCreatedHandler) => void;
  addSelectedHandler: (handler: LabelSelectedHandler) => void;
  addUpdatedHandler: (handler: LabelUpdatedHandler) => void;
  addRemovedHandler: (handler: LabelRemovedHandler) => void;
  removeCreatedHandler: (handler: LabelCreatedHandler) => void;
  removeSelectedHandler: (handler: LabelSelectedHandler) => void;
  removeUpdatedHandler: (handler: LabelUpdatedHandler) => void;
  removeRemovedHandler: (handler: LabelRemovedHandler) => void;
  clearAllHandlers: () => void;
}

const defaultLabelProperties: Omit<LabelProperties, 'id'> = {
  text: 'TEXTO',
  size: 38,
  align: 'center',
  fillColor: '#FFFFFF',
  backgroundColor: '#000000A3',
  rotation: 0,
};

export const useLabelStore = create<LabelState>((set, get) => ({
  // Estado inicial
  toolState: LabelToolState.INACTIVE,
  labels: [],
  selectedLabel: null,
  defaultProperties: defaultLabelProperties,

  // Event handlers
  onCreatedHandlers: new Set<LabelCreatedHandler>(),
  onSelectedHandlers: new Set<LabelSelectedHandler>(),
  onUpdatedHandlers: new Set<LabelUpdatedHandler>(),
  onRemovedHandlers: new Set<LabelRemovedHandler>(),

  // Ações - gerenciamento de estado
  setToolState: state => set({ toolState: state }),

  startAddingLabel: () =>
    set({
      toolState: LabelToolState.ADDING,
      selectedLabel: null,
    }),

  cancelAddingLabel: () =>
    set({
      toolState: LabelToolState.INACTIVE,
      selectedLabel: null,
    }),

  // Ações - gerenciamento de etiquetas
  addLabel: position => {
    const labelId = nanoid();
    const newLabel: Label = {
      properties: {
        id: labelId,
        ...get().defaultProperties,
      },
      position,
      entityId: `label-entity-${labelId}`,
      createdAt: Date.now(),
    };

    set(state => ({
      labels: [...state.labels, newLabel],
      toolState: LabelToolState.EDITING,
      selectedLabel: newLabel,
    }));

    // Notificar handlers
    get().onCreatedHandlers.forEach(handler => handler(newLabel));

    return newLabel;
  },

  updateLabel: (labelId, properties) => {
    set(state => {
      const labelIndex = state.labels.findIndex(
        l => l.properties.id === labelId,
      );
      if (labelIndex === -1) return state;

      const updatedLabels = [...state.labels];
      const updatedLabel = {
        ...updatedLabels[labelIndex],
        properties: {
          ...updatedLabels[labelIndex].properties,
          ...properties,
        },
      };

      updatedLabels[labelIndex] = updatedLabel;

      // Notificar handlers
      get().onUpdatedHandlers.forEach(handler => handler(updatedLabel));

      return {
        labels: updatedLabels,
        selectedLabel:
          state.selectedLabel?.properties.id === labelId
            ? updatedLabel
            : state.selectedLabel,
      };
    });
  },

  removeLabel: labelId => {
    set(state => {
      const filteredLabels = state.labels.filter(
        l => l.properties.id !== labelId,
      );

      // Notificar handlers
      get().onRemovedHandlers.forEach(handler => handler(labelId));

      return {
        labels: filteredLabels,
        selectedLabel:
          state.selectedLabel?.properties.id === labelId
            ? null
            : state.selectedLabel,
        toolState:
          state.selectedLabel?.properties.id === labelId
            ? LabelToolState.INACTIVE
            : state.toolState,
      };
    });
  },

  selectLabel: labelId => {
    if (!labelId) {
      set({
        selectedLabel: null,
        toolState: LabelToolState.INACTIVE,
      });
      return;
    }

    set(state => {
      const selectedLabel =
        state.labels.find(l => l.properties.id === labelId) || null;

      if (selectedLabel) {
        // Notificar handlers
        get().onSelectedHandlers.forEach(handler => handler(selectedLabel));
      }

      return {
        selectedLabel,
        toolState: selectedLabel
          ? LabelToolState.EDITING
          : LabelToolState.INACTIVE,
      };
    });
  },

  deselectAll: () => {
    set({
      selectedLabel: null,
      toolState: LabelToolState.INACTIVE,
    });
  },

  setDefaultProperties: properties =>
    set(state => ({
      defaultProperties: {
        ...state.defaultProperties,
        ...properties,
      },
    })),

  // Ações - event handlers
  addCreatedHandler: handler =>
    set(state => {
      state.onCreatedHandlers.add(handler);
      return { onCreatedHandlers: new Set(state.onCreatedHandlers) };
    }),

  addSelectedHandler: handler =>
    set(state => {
      state.onSelectedHandlers.add(handler);
      return { onSelectedHandlers: new Set(state.onSelectedHandlers) };
    }),

  addUpdatedHandler: handler =>
    set(state => {
      state.onUpdatedHandlers.add(handler);
      return { onUpdatedHandlers: new Set(state.onUpdatedHandlers) };
    }),

  addRemovedHandler: handler =>
    set(state => {
      state.onRemovedHandlers.add(handler);
      return { onRemovedHandlers: new Set(state.onRemovedHandlers) };
    }),

  removeCreatedHandler: handler =>
    set(state => {
      state.onCreatedHandlers.delete(handler);
      return { onCreatedHandlers: new Set(state.onCreatedHandlers) };
    }),

  removeSelectedHandler: handler =>
    set(state => {
      state.onSelectedHandlers.delete(handler);
      return { onSelectedHandlers: new Set(state.onSelectedHandlers) };
    }),

  removeUpdatedHandler: handler =>
    set(state => {
      state.onUpdatedHandlers.delete(handler);
      return { onUpdatedHandlers: new Set(state.onUpdatedHandlers) };
    }),

  removeRemovedHandler: handler =>
    set(state => {
      state.onRemovedHandlers.delete(handler);
      return { onRemovedHandlers: new Set(state.onRemovedHandlers) };
    }),

  clearAllHandlers: () =>
    set({
      onCreatedHandlers: new Set(),
      onSelectedHandlers: new Set(),
      onUpdatedHandlers: new Set(),
      onRemovedHandlers: new Set(),
    }),
}));

// Helper para limpar etiquetas
export function cleanLabels() {
  const cesium = getCesium();
  if (!cesium) return;

  const { viewer } = cesium;
  const labelStore = useLabelStore.getState();

  // Remove as entidades das etiquetas
  labelStore.labels.forEach(label => {
    const entity = viewer.entities.getById(label.entityId);
    if (entity) {
      viewer.entities.remove(entity);
    }
  });

  // Limpa o estado
  useLabelStore.setState({
    labels: [],
    selectedLabel: null,
    toolState: LabelToolState.INACTIVE,
  });
}
