// Path: map3d\features\viewshed\store.ts
import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { useMap3DStore } from '@/map3d/store';

import {
  type ViewshedOptions,
  type ViewshedStyle,
  defaultViewshedOptions,
  defaultViewshedStyle,
} from './types';

interface ViewshedState {
  currentViewshed: ViewshedOptions | null;
  viewsheds: ViewshedOptions[];
  style: ViewshedStyle;

  // Actions
  startNewViewshed: () => void;
  setViewshedPoint: (point: { x: number; y: number; z: number }) => void;
  updateViewshedOptions: (options: Partial<ViewshedOptions>) => void;
  completeViewshed: () => void;
  removeViewshed: (id: string) => void;
  clearViewsheds: () => void;
  updateStyle: (style: Partial<ViewshedStyle>) => void;
  reset: () => void;
}

export const useViewshedStore = create<ViewshedState>((set, get) => ({
  currentViewshed: null,
  viewsheds: [],
  style: defaultViewshedStyle,

  startNewViewshed: () =>
    set({
      currentViewshed: {
        id: nanoid(),
        ...defaultViewshedOptions,
      },
    }),

  setViewshedPoint: point =>
    set(state => {
      if (!state.currentViewshed) return state;

      return {
        currentViewshed: {
          ...state.currentViewshed,
          point,
        },
      };
    }),

  updateViewshedOptions: options =>
    set(state => {
      if (!state.currentViewshed) return state;

      return {
        currentViewshed: {
          ...state.currentViewshed,
          ...options,
        },
      };
    }),

  completeViewshed: () => {
    const state = get();
    if (!state.currentViewshed) return;

    const completedViewshed = {
      ...state.currentViewshed,
      isComplete: true,
    };

    set({
      viewsheds: [...state.viewsheds, completedViewshed],
      currentViewshed: null,
    });

    useMap3DStore.getState().clearActiveTool();
  },

  removeViewshed: id =>
    set(state => ({
      viewsheds: state.viewsheds.filter(vs => vs.id !== id),
    })),

  clearViewsheds: () => {
    set({
      viewsheds: [],
      currentViewshed: null,
    });
    useMap3DStore.getState().clearActiveTool();
  },

  updateStyle: newStyle =>
    set(state => ({
      style: { ...state.style, ...newStyle },
    })),

  reset: () => {
    set({
      currentViewshed: null,
      viewsheds: [],
      style: defaultViewshedStyle,
    });
    useMap3DStore.getState().clearActiveTool();
  },
}));
