// Path: map3d\features\area\store.ts
import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { getCesium } from '../../store';
import { type AreaMeasurement, type AreaStyle, AreaToolState } from './types';

interface AreaState {
  // Estado
  toolState: AreaToolState;
  currentMeasurement: AreaMeasurement | null;
  measurements: AreaMeasurement[];
  style: AreaStyle;

  // Ações
  startMeasuring: () => void;
  cancelMeasuring: () => void;
  completeMeasurement: (
    measurement: Omit<AreaMeasurement, 'id' | 'timestamp'>,
  ) => void;
  removeMeasurement: (id: string) => void;
  clearAllMeasurements: () => void;
  updateStyle: (style: Partial<AreaStyle>) => void;
}

const defaultStyle: AreaStyle = {
  fillColor: 'rgba(0, 70, 255, 0.2)',
  outlineColor: 'rgba(0, 70, 255, 0.8)',
  outlineWidth: 3,
  labelBackgroundColor: 'rgba(255, 255, 255, 0.8)',
  labelTextColor: '#000000',
  labelFont: '14px monospace',
};

export const useAreaStore = create<AreaState>((set, get) => ({
  // Estado inicial
  toolState: AreaToolState.INACTIVE,
  currentMeasurement: null,
  measurements: [],
  style: defaultStyle,

  // Ações
  startMeasuring: () => {
    // Se já estiver medindo, não faz nada
    if (get().toolState === AreaToolState.MEASURING) {
      return;
    }

    // Inicia uma nova medição
    set({
      toolState: AreaToolState.MEASURING,
      currentMeasurement: null,
    });
  },

  cancelMeasuring: () => {
    set({
      toolState: AreaToolState.INACTIVE,
      currentMeasurement: null,
    });
  },

  completeMeasurement: measurement => {
    const { positions, area } = measurement;
    const newMeasurement: AreaMeasurement = {
      id: nanoid(),
      positions,
      area,
      timestamp: Date.now(),
    };

    set(state => ({
      toolState: AreaToolState.COMPLETED,
      currentMeasurement: null,
      measurements: [...state.measurements, newMeasurement],
    }));
  },

  removeMeasurement: id => {
    set(state => ({
      measurements: state.measurements.filter(m => m.id !== id),
    }));
  },

  clearAllMeasurements: () => {
    set({
      toolState: AreaToolState.INACTIVE,
      currentMeasurement: null,
      measurements: [],
    });
  },

  updateStyle: style => {
    set(state => ({
      style: {
        ...state.style,
        ...style,
      },
    }));
  },
}));

// Helper para limpar medições ao desmontar
export function cleanAreaMeasurements() {
  const cesium = getCesium();
  if (!cesium) return;

  const { viewer } = cesium;
  const drawLayer = viewer.dataSources.getByName('measureAreaLayer')[0];
  if (drawLayer) {
    viewer.dataSources.remove(drawLayer);
  }

  useAreaStore.getState().clearAllMeasurements();
}
