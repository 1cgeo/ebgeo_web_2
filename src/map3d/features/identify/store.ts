// Path: map3d\features\identify\store.ts
import { create } from 'zustand';

import {
  type FeatureInfo,
  type IdentifyPosition,
  type IdentifyStyle,
  IdentifyToolState,
} from './types';

interface IdentifyState {
  // Estado
  toolState: IdentifyToolState;
  featureInfo: FeatureInfo | null;
  lastPosition: IdentifyPosition | null;
  style: IdentifyStyle;
  error: string | null;

  // Ações
  activateTool: () => void;
  deactivateTool: () => void;
  setFeatureInfo: (info: FeatureInfo | null) => void;
  setPosition: (position: IdentifyPosition | null) => void;
  setLoading: () => void;
  setError: (message: string) => void;
  clearInfo: () => void;
  updateStyle: (style: Partial<IdentifyStyle>) => void;
}

const defaultStyle: IdentifyStyle = {
  panelBackgroundColor: '#ffffff',
  panelTextColor: '#000000',
  panelBorderColor: '#cccccc',
  panelWidth: 300,
};

export const useIdentifyStore = create<IdentifyState>(set => ({
  // Estado inicial
  toolState: IdentifyToolState.INACTIVE,
  featureInfo: null,
  lastPosition: null,
  style: defaultStyle,
  error: null,

  // Ações
  activateTool: () =>
    set({
      toolState: IdentifyToolState.ACTIVE,
      featureInfo: null,
      error: null,
    }),

  deactivateTool: () =>
    set({
      toolState: IdentifyToolState.INACTIVE,
      featureInfo: null,
      lastPosition: null,
      error: null,
    }),

  setFeatureInfo: info =>
    set({
      featureInfo: info,
      toolState: IdentifyToolState.ACTIVE,
      error: null,
    }),

  setPosition: position => set({ lastPosition: position }),

  setLoading: () =>
    set({
      toolState: IdentifyToolState.LOADING,
      featureInfo: null,
      error: null,
    }),

  setError: message =>
    set({
      toolState: IdentifyToolState.ERROR,
      error: message,
      featureInfo: null,
    }),

  clearInfo: () =>
    set({
      featureInfo: null,
      error: null,
    }),

  updateStyle: style =>
    set(state => ({
      style: {
        ...state.style,
        ...style,
      },
    })),
}));
