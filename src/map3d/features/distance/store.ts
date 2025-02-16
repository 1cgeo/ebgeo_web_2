// Path: map3d\features\distance\store.ts
import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { useMap3DStore } from '@/map3d/store';

import {
  type Cartesian,
  type DistanceLine,
  type DistanceStyle,
  cartesianSchema,
  defaultDistanceStyle,
  distanceLineSchema,
} from './types';

interface DistanceState {
  currentLine: DistanceLine | null;
  lines: DistanceLine[];
  style: DistanceStyle;

  // Actions
  startNewLine: () => void;
  addPoint: (point: Cartesian) => void;
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

  startNewLine: () => {
    const newLine = distanceLineSchema.parse({
      id: nanoid(),
      points: [],
      isComplete: false,
    });

    set({ currentLine: newLine });
  },

  addPoint: point => {
    // Valida o ponto antes de adicionar
    const validatedPoint = cartesianSchema.parse(point);

    set(state => {
      if (!state.currentLine) return state;

      const updatedLine = distanceLineSchema.parse({
        ...state.currentLine,
        points: [...state.currentLine.points, validatedPoint],
      });

      return { currentLine: updatedLine };
    });
  },

  completeLine: finalDistance => {
    const state = get();
    if (!state.currentLine) return;

    const completedLine = distanceLineSchema.parse({
      ...state.currentLine,
      distance: finalDistance,
      isComplete: true,
    });

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
