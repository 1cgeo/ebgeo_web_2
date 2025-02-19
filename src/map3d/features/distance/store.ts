// Path: map3d\features\distance\store.ts
import { nanoid } from 'nanoid';
import { create } from 'zustand';

import { getCesium } from '../../store';
import {
  type DistanceMeasurement,
  type DistancePoint,
  type DistanceStyle,
  DistanceToolState,
} from './types';

interface DistanceState {
  // Estado
  toolState: DistanceToolState;
  currentPoints: DistancePoint[];
  measurements: DistanceMeasurement[];
  style: DistanceStyle;

  // Ações
  startMeasuring: () => void;
  cancelMeasuring: () => void;
  addPoint: (
    point: Omit<DistancePoint, 'distance'>,
    calculateDistance: boolean,
  ) => void;
  completeMeasurement: () => void;
  removeMeasurement: (id: string) => void;
  clearAllMeasurements: () => void;
  updateStyle: (style: Partial<DistanceStyle>) => void;
}

const defaultStyle: DistanceStyle = {
  lineColor: 'rgba(0, 70, 255, 0.8)',
  lineWidth: 3,
  pointSize: 10,
  pointColor: 'rgba(0, 70, 255, 1.0)',
  labelBackgroundColor: 'rgba(255, 255, 255, 0.8)',
  labelTextColor: '#000000',
  labelFont: '14px monospace',
};

export const useDistanceStore = create<DistanceState>((set, get) => ({
  // Estado inicial
  toolState: DistanceToolState.INACTIVE,
  currentPoints: [],
  measurements: [],
  style: defaultStyle,

  // Ações
  startMeasuring: () => {
    // Se já estiver medindo, não faz nada
    if (get().toolState === DistanceToolState.MEASURING) {
      return;
    }

    // Inicia uma nova medição
    set({
      toolState: DistanceToolState.MEASURING,
      currentPoints: [],
    });
  },

  cancelMeasuring: () => {
    set({
      toolState: DistanceToolState.INACTIVE,
      currentPoints: [],
    });
  },

  addPoint: (point, calculateDistance) => {
    const currentPoints = get().currentPoints;
    let distance = 0;

    // Calcula a distância acumulada
    if (currentPoints.length > 0 && calculateDistance) {
      const lastPoint = currentPoints[currentPoints.length - 1];
      const dx = point.x - lastPoint.x;
      const dy = point.y - lastPoint.y;
      const dz = point.z - lastPoint.z;
      const segmentDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      distance = lastPoint.distance + segmentDistance;
    }

    const newPoint: DistancePoint = {
      ...point,
      distance,
    };

    set(state => ({
      currentPoints: [...state.currentPoints, newPoint],
    }));
  },

  completeMeasurement: () => {
    const { currentPoints } = get();

    // Se não houver pontos suficientes, não completa
    if (currentPoints.length < 2) {
      set({
        toolState: DistanceToolState.INACTIVE,
        currentPoints: [],
      });
      return;
    }

    const totalDistance = currentPoints[currentPoints.length - 1].distance;

    const newMeasurement: DistanceMeasurement = {
      id: nanoid(),
      points: currentPoints,
      totalDistance,
      timestamp: Date.now(),
    };

    set(state => ({
      toolState: DistanceToolState.COMPLETED,
      currentPoints: [],
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
      toolState: DistanceToolState.INACTIVE,
      currentPoints: [],
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
export function cleanDistanceMeasurements() {
  const cesium = getCesium();
  if (!cesium) return;

  const { viewer } = cesium;
  const drawLayer = viewer.dataSources.getByName('measureDistanceLayer')[0];
  if (drawLayer) {
    viewer.dataSources.remove(drawLayer);
  }

  useDistanceStore.getState().clearAllMeasurements();
}
