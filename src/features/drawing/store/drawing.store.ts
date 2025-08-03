// Path: features\drawing\store\drawing.store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Position } from 'geojson';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { DrawingTool, EditMode } from '../../../types/feature.types';

// Estado do desenho
interface DrawingState {
  // Ferramenta ativa
  activeTool: DrawingTool;
  
  // Estado de edição
  editMode: EditMode;
  isDrawing: boolean;
  
  // Feature sendo criada/editada
  currentFeature: ExtendedFeature | null;
  
  // Camada ativa para novos desenhos
  activeLayerId: string | null;
  
  // Posição do mouse
  mousePosition: Position | null;
  
  // Configurações de estilo temporário
  temporaryStyle: {
    strokeColor: string;
    strokeWidth: number;
    fillColor: string;
    fillOpacity: number;
    markerColor: string;
    markerSize: number;
  };
  
  // Estado de edição de vértices
  editingVertex: {
    featureId: string | null;
    vertexIndex: number | null;
    isDragging: boolean;
  };
  
  // Snappping
  snapSettings: {
    enabled: boolean;
    tolerance: number; // em pixels
    snapToVertices: boolean;
    snapToEdges: boolean;
    snapToGrid: boolean;
    gridSize: number; // em metros
  };
}

// Ações do store
interface DrawingActions {
  // Gerenciamento de ferramentas
  setActiveTool: (tool: DrawingTool) => void;
  resetTool: () => void;
  
  // Gerenciamento de modo de edição
  setEditMode: (mode: EditMode) => void;
  startDrawing: () => void;
  stopDrawing: () => void;
  
  // Gerenciamento de feature atual
  setCurrentFeature: (feature: ExtendedFeature | null) => void;
  updateCurrentFeature: (updates: Partial<ExtendedFeature>) => void;
  clearCurrentFeature: () => void;
  
  // Gerenciamento de camada ativa
  setActiveLayerId: (layerId: string | null) => void;
  
  // Posição do mouse
  setMousePosition: (position: Position | null) => void;
  
  // Estilo temporário
  updateTemporaryStyle: (style: Partial<DrawingState['temporaryStyle']>) => void;
  resetTemporaryStyle: () => void;
  
  // Edição de vértices
  startVertexEdit: (featureId: string, vertexIndex: number) => void;
  updateVertexEdit: (vertexIndex: number) => void;
  stopVertexEdit: () => void;
  setVertexDragging: (isDragging: boolean) => void;
  
  // Configurações de snap
  updateSnapSettings: (settings: Partial<DrawingState['snapSettings']>) => void;
  toggleSnap: () => void;
  
  // Reset completo
  reset: () => void;
}

// Estado inicial
const initialState: DrawingState = {
  activeTool: 'select',
  editMode: 'none',
  isDrawing: false,
  currentFeature: null,
  activeLayerId: null,
  mousePosition: null,
  temporaryStyle: {
    strokeColor: '#1976d2',
    strokeWidth: 3,
    fillColor: '#1976d2',
    fillOpacity: 0.2,
    markerColor: '#1976d2',
    markerSize: 8,
  },
  editingVertex: {
    featureId: null,
    vertexIndex: null,
    isDragging: false,
  },
  snapSettings: {
    enabled: true,
    tolerance: 10,
    snapToVertices: true,
    snapToEdges: true,
    snapToGrid: false,
    gridSize: 100,
  },
};

// Store principal
export const useDrawingStore = create<DrawingState & DrawingActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Gerenciamento de ferramentas
      setActiveTool: (tool) => {
        set(
          (state) => ({
            activeTool: tool,
            editMode: tool === 'select' ? 'selecting' : 'drawing',
            // Limpar estado atual se mudando de ferramenta
            currentFeature: tool !== state.activeTool ? null : state.currentFeature,
            isDrawing: false,
          }),
          false,
          'setActiveTool'
        );
      },

      resetTool: () => {
        set(
          {
            activeTool: 'select',
            editMode: 'none',
            isDrawing: false,
            currentFeature: null,
          },
          false,
          'resetTool'
        );
      },

      // Gerenciamento de modo de edição
      setEditMode: (mode) => {
        set({ editMode: mode }, false, 'setEditMode');
      },

      startDrawing: () => {
        set(
          {
            isDrawing: true,
            editMode: 'drawing',
          },
          false,
          'startDrawing'
        );
      },

      stopDrawing: () => {
        set(
          {
            isDrawing: false,
            editMode: get().activeTool === 'select' ? 'selecting' : 'none',
          },
          false,
          'stopDrawing'
        );
      },

      // Gerenciamento de feature atual
      setCurrentFeature: (feature) => {
        set({ currentFeature: feature }, false, 'setCurrentFeature');
      },

      updateCurrentFeature: (updates) => {
        set(
          (state) => ({
            currentFeature: state.currentFeature
              ? { ...state.currentFeature, ...updates }
              : null,
          }),
          false,
          'updateCurrentFeature'
        );
      },

      clearCurrentFeature: () => {
        set({ currentFeature: null }, false, 'clearCurrentFeature');
      },

      // Gerenciamento de camada ativa
      setActiveLayerId: (layerId) => {
        set({ activeLayerId: layerId }, false, 'setActiveLayerId');
      },

      // Posição do mouse
      setMousePosition: (position) => {
        set({ mousePosition: position }, false, 'setMousePosition');
      },

      // Estilo temporário
      updateTemporaryStyle: (style) => {
        set(
          (state) => ({
            temporaryStyle: { ...state.temporaryStyle, ...style },
          }),
          false,
          'updateTemporaryStyle'
        );
      },

      resetTemporaryStyle: () => {
        set(
          { temporaryStyle: initialState.temporaryStyle },
          false,
          'resetTemporaryStyle'
        );
      },

      // Edição de vértices
      startVertexEdit: (featureId, vertexIndex) => {
        set(
          {
            editingVertex: {
              featureId,
              vertexIndex,
              isDragging: false,
            },
            editMode: 'editing',
          },
          false,
          'startVertexEdit'
        );
      },

      updateVertexEdit: (vertexIndex) => {
        set(
          (state) => ({
            editingVertex: {
              ...state.editingVertex,
              vertexIndex,
            },
          }),
          false,
          'updateVertexEdit'
        );
      },

      stopVertexEdit: () => {
        set(
          {
            editingVertex: {
              featureId: null,
              vertexIndex: null,
              isDragging: false,
            },
            editMode: 'none',
          },
          false,
          'stopVertexEdit'
        );
      },

      setVertexDragging: (isDragging) => {
        set(
          (state) => ({
            editingVertex: {
              ...state.editingVertex,
              isDragging,
            },
          }),
          false,
          'setVertexDragging'
        );
      },

      // Configurações de snap
      updateSnapSettings: (settings) => {
        set(
          (state) => ({
            snapSettings: { ...state.snapSettings, ...settings },
          }),
          false,
          'updateSnapSettings'
        );
      },

      toggleSnap: () => {
        set(
          (state) => ({
            snapSettings: {
              ...state.snapSettings,
              enabled: !state.snapSettings.enabled,
            },
          }),
          false,
          'toggleSnap'
        );
      },

      // Reset completo
      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    {
      name: 'drawing-store',
    }
  )
);

// Seletores úteis
export const useDrawingSelectors = () => {
  const store = useDrawingStore();
  
  return {
    // Estados derivados
    isEditing: store.editMode === 'editing',
    isSelecting: store.editMode === 'selecting',
    canDraw: store.activeTool !== 'select' && !store.isDrawing,
    hasCurrentFeature: store.currentFeature !== null,
    isEditingVertex: store.editingVertex.featureId !== null,
    
    // Configurações ativas
    snapEnabled: store.snapSettings.enabled,
    strokeStyle: {
      color: store.temporaryStyle.strokeColor,
      width: store.temporaryStyle.strokeWidth,
    },
    fillStyle: {
      color: store.temporaryStyle.fillColor,
      opacity: store.temporaryStyle.fillOpacity,
    },
    markerStyle: {
      color: store.temporaryStyle.markerColor,
      size: store.temporaryStyle.markerSize,
    },
  };
};

// Hook para ações específicas de ferramentas
export const useDrawingActions = () => {
  const actions = useDrawingStore((state) => ({
    setActiveTool: state.setActiveTool,
    startDrawing: state.startDrawing,
    stopDrawing: state.stopDrawing,
    setCurrentFeature: state.setCurrentFeature,
    updateCurrentFeature: state.updateCurrentFeature,
    clearCurrentFeature: state.clearCurrentFeature,
    setActiveLayerId: state.setActiveLayerId,
    reset: state.reset,
  }));

  return actions;
};