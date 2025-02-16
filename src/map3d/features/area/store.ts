// Path: map3d\features\area\store.ts
import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { useMap3DStore } from '@/map3d/store';

import { type Area, type AreaStyle, defaultAreaStyle } from './types';

interface AreaState {
  currentArea: Area | null;
  areas: Area[];
  style: AreaStyle;

  // Actions
  startNewArea: () => void;
  addPoint: (point: { x: number; y: number; z: number }) => void;
  completeArea: (finalArea: number) => void;
  removeArea: (id: string) => void;
  clearAreas: () => void;
  updateStyle: (style: Partial<AreaStyle>) => void;
  reset: () => void;
}

export const useAreaStore = create<AreaState>((set, get) => ({
  currentArea: null,
  areas: [],
  style: defaultAreaStyle,

  startNewArea: () =>
    set({
      currentArea: {
        id: nanoid(),
        points: [],
        isComplete: false,
      },
    }),

  addPoint: point =>
    set(state => {
      if (!state.currentArea) return state;

      return {
        currentArea: {
          ...state.currentArea,
          points: [...state.currentArea.points, point],
        },
      };
    }),

  completeArea: finalArea => {
    const state = get();
    if (!state.currentArea) return;

    const completedArea = {
      ...state.currentArea,
      area: finalArea,
      isComplete: true,
    };

    set({
      areas: [...state.areas, completedArea],
      currentArea: null,
    });

    // Limpa a ferramenta ativa após completar
    useMap3DStore.getState().clearActiveTool();
  },

  removeArea: id =>
    set(state => ({
      areas: state.areas.filter(area => area.id !== id),
    })),

  clearAreas: () => {
    set({
      areas: [],
      currentArea: null,
    });
    useMap3DStore.getState().clearActiveTool();
  },

  updateStyle: newStyle =>
    set(state => ({
      style: { ...state.style, ...newStyle },
    })),

  reset: () => {
    set({
      currentArea: null,
      areas: [],
      style: defaultAreaStyle,
    });
    useMap3DStore.getState().clearActiveTool();
  },
}));
