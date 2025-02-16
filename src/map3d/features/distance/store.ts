// Path: map3d\features\distance\store.ts
import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { useMap3DStore } from '@/map3d/store';

import {
  type DistanceLine,
  type DistanceStyle,
  defaultDistanceStyle,
} from './types';

interface DistanceState {
  currentLine: DistanceLine | null;
  lines: DistanceLine[];
  style: DistanceStyle;

  // Actions
  startNewLine: () => void;
  addPoint: (point: { x: number; y: number; z: number }) => void;
  completeLine: (finalDistance: number) => void;
  removeLine: (id: string) => void;
  clearLines: () => void;
  updateStyle: (style: Partial<DistanceStyle>) => void;
  reset: () => void;
}

export const useDistanceStore = create<DistanceState>((set, get) => ({
  currentLine: null,
  lines: [],
  style: defaultDistanceStyle,

  startNewLine: () =>
    set({
      currentLine: {
        id: nanoid(),
        points: [],
        isComplete: false,
      },
    }),

  addPoint: point =>
    set(state => {
      if (!state.currentLine) return state;

      const newPoints = [...state.currentLine.points, point];
      return {
        currentLine: {
          ...state.currentLine,
          points: newPoints,
        },
      };
    }),

  completeLine: finalDistance => {
    const state = get();
    if (!state.currentLine) return;

    const completedLine = {
      ...state.currentLine,
      distance: finalDistance,
      isComplete: true,
    };

    set({
      lines: [...state.lines, completedLine],
      currentLine: null,
    });

    // Limpa a ferramenta ativa após completar
    useMap3DStore.getState().clearActiveTool();
  },

  removeLine: id =>
    set(state => ({
      lines: state.lines.filter(line => line.id !== id),
    })),

  clearLines: () => {
    set({
      lines: [],
      currentLine: null,
    });
    useMap3DStore.getState().clearActiveTool();
  },

  updateStyle: newStyle =>
    set(state => ({
      style: { ...state.style, ...newStyle },
    })),

  reset: () => {
    set({
      currentLine: null,
      lines: [],
      style: defaultDistanceStyle,
    });
    useMap3DStore.getState().clearActiveTool();
  },
}));
