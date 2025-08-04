// Path: features\selection\store\selection.store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Position } from 'geojson';

// Estado da seleção
interface SelectionState {
  // Features selecionadas
  selectedFeatureIds: string[];

  // Feature sendo destacada (hover)
  hoveredFeatureId: string | null;

  // Feature sendo editada ativamente
  editingFeatureId: string | null;

  // Seleção múltipla
  isMultiSelectMode: boolean;

  // Seleção por região (box select)
  boxSelection: {
    isActive: boolean;
    startPoint: Position | null;
    endPoint: Position | null;
  };

  // Modo de seleção
  selectionMode: 'single' | 'multi' | 'box' | 'none';

  // Última ação de seleção (para undo/redo)
  lastSelectionAction: {
    type: 'select' | 'deselect' | 'toggle' | 'clear' | 'box';
    featureIds: string[];
    timestamp: number;
  } | null;
}

// Ações do store
interface SelectionActions {
  // Seleção básica
  selectFeature: (featureId: string, mode?: 'single' | 'add' | 'toggle') => void;
  selectFeatures: (featureIds: string[], mode?: 'replace' | 'add') => void;
  deselectFeature: (featureId: string) => void;
  deselectFeatures: (featureIds: string[]) => void;
  clearSelection: () => void;

  // Seleção condicional
  selectAll: () => void;
  selectByLayerId: (layerId: string) => void;
  selectByGeometryType: (geometryType: string) => void;

  // Toggle de seleção
  toggleFeature: (featureId: string) => void;
  toggleFeatures: (featureIds: string[]) => void;

  // Hover
  setHoveredFeature: (featureId: string | null) => void;

  // Edição
  setEditingFeature: (featureId: string | null) => void;

  // Modo de seleção múltipla
  setMultiSelectMode: (enabled: boolean) => void;
  toggleMultiSelectMode: () => void;

  // Seleção por caixa
  startBoxSelection: (startPoint: Position) => void;
  updateBoxSelection: (endPoint: Position) => void;
  endBoxSelection: (featureIds: string[]) => void;
  cancelBoxSelection: () => void;

  // Modo de seleção
  setSelectionMode: (mode: SelectionState['selectionMode']) => void;

  // Navegação entre seleções
  selectNext: () => void;
  selectPrevious: () => void;

  // Inverter seleção
  invertSelection: (allFeatureIds: string[]) => void;

  // Utilitários
  isSelected: (featureId: string) => boolean;
  getSelectionCount: () => number;
  hasSelection: () => boolean;

  // Reset
  reset: () => void;
}

// Estado inicial
const initialState: SelectionState = {
  selectedFeatureIds: [],
  hoveredFeatureId: null,
  editingFeatureId: null,
  isMultiSelectMode: false,
  boxSelection: {
    isActive: false,
    startPoint: null,
    endPoint: null,
  },
  selectionMode: 'single',
  lastSelectionAction: null,
};

// Store principal
export const useSelectionStore = create<SelectionState & SelectionActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Seleção básica
      selectFeature: (featureId, mode = 'single') => {
        const state = get();
        let newSelectedIds: string[];

        switch (mode) {
          case 'add':
            newSelectedIds = state.selectedFeatureIds.includes(featureId)
              ? state.selectedFeatureIds
              : [...state.selectedFeatureIds, featureId];
            break;
          case 'toggle':
            newSelectedIds = state.selectedFeatureIds.includes(featureId)
              ? state.selectedFeatureIds.filter(id => id !== featureId)
              : [...state.selectedFeatureIds, featureId];
            break;
          case 'single':
          default:
            newSelectedIds = [featureId];
            break;
        }

        set(
          {
            selectedFeatureIds: newSelectedIds,
            lastSelectionAction: {
              type: 'select',
              featureIds: [featureId],
              timestamp: Date.now(),
            },
          },
          false,
          'selectFeature'
        );
      },

      selectFeatures: (featureIds, mode = 'replace') => {
        const state = get();
        const newSelectedIds =
          mode === 'add' ? [...new Set([...state.selectedFeatureIds, ...featureIds])] : featureIds;

        set(
          {
            selectedFeatureIds: newSelectedIds,
            lastSelectionAction: {
              type: 'select',
              featureIds,
              timestamp: Date.now(),
            },
          },
          false,
          'selectFeatures'
        );
      },

      deselectFeature: featureId => {
        const state = get();
        const newSelectedIds = state.selectedFeatureIds.filter(id => id !== featureId);

        set(
          {
            selectedFeatureIds: newSelectedIds,
            lastSelectionAction: {
              type: 'deselect',
              featureIds: [featureId],
              timestamp: Date.now(),
            },
          },
          false,
          'deselectFeature'
        );
      },

      deselectFeatures: featureIds => {
        const state = get();
        const newSelectedIds = state.selectedFeatureIds.filter(id => !featureIds.includes(id));

        set(
          {
            selectedFeatureIds: newSelectedIds,
            lastSelectionAction: {
              type: 'deselect',
              featureIds,
              timestamp: Date.now(),
            },
          },
          false,
          'deselectFeatures'
        );
      },

      clearSelection: () => {
        const state = get();
        set(
          {
            selectedFeatureIds: [],
            editingFeatureId: null,
            lastSelectionAction: {
              type: 'clear',
              featureIds: state.selectedFeatureIds,
              timestamp: Date.now(),
            },
          },
          false,
          'clearSelection'
        );
      },

      // Seleção condicional
      selectAll: () => {
        // Nota: precisaríamos passar todos os IDs como parâmetro
        // Implementação será feita no hook que usa este store
        console.warn('selectAll deve ser implementado no componente que conhece todas as features');
      },

      selectByLayerId: layerId => {
        // Implementação será feita no hook que usa este store
        console.warn('selectByLayerId deve ser implementado no componente que conhece as features');
      },

      selectByGeometryType: geometryType => {
        // Implementação será feita no hook que usa este store
        console.warn(
          'selectByGeometryType deve ser implementado no componente que conhece as features'
        );
      },

      // Toggle de seleção
      toggleFeature: featureId => {
        get().selectFeature(featureId, 'toggle');
      },

      toggleFeatures: featureIds => {
        const state = get();
        const selected: string[] = [];
        const deselected: string[] = [];

        featureIds.forEach(id => {
          if (state.selectedFeatureIds.includes(id)) {
            deselected.push(id);
          } else {
            selected.push(id);
          }
        });

        const newSelectedIds = [
          ...state.selectedFeatureIds.filter(id => !deselected.includes(id)),
          ...selected,
        ];

        set(
          {
            selectedFeatureIds: newSelectedIds,
            lastSelectionAction: {
              type: 'toggle',
              featureIds,
              timestamp: Date.now(),
            },
          },
          false,
          'toggleFeatures'
        );
      },

      // Hover
      setHoveredFeature: featureId => {
        set({ hoveredFeatureId: featureId }, false, 'setHoveredFeature');
      },

      // Edição
      setEditingFeature: featureId => {
        set({ editingFeatureId: featureId }, false, 'setEditingFeature');
      },

      // Modo de seleção múltipla
      setMultiSelectMode: enabled => {
        set({ isMultiSelectMode: enabled }, false, 'setMultiSelectMode');
      },

      toggleMultiSelectMode: () => {
        const state = get();
        set({ isMultiSelectMode: !state.isMultiSelectMode }, false, 'toggleMultiSelectMode');
      },

      // Seleção por caixa
      startBoxSelection: startPoint => {
        set(
          {
            boxSelection: {
              isActive: true,
              startPoint,
              endPoint: null,
            },
            selectionMode: 'box',
          },
          false,
          'startBoxSelection'
        );
      },

      updateBoxSelection: endPoint => {
        const state = get();
        set(
          {
            boxSelection: {
              ...state.boxSelection,
              endPoint,
            },
          },
          false,
          'updateBoxSelection'
        );
      },

      endBoxSelection: featureIds => {
        const state = get();
        get().selectFeatures(featureIds, state.isMultiSelectMode ? 'add' : 'replace');

        set(
          {
            boxSelection: {
              isActive: false,
              startPoint: null,
              endPoint: null,
            },
            selectionMode: 'single',
            lastSelectionAction: {
              type: 'box',
              featureIds,
              timestamp: Date.now(),
            },
          },
          false,
          'endBoxSelection'
        );
      },

      cancelBoxSelection: () => {
        set(
          {
            boxSelection: {
              isActive: false,
              startPoint: null,
              endPoint: null,
            },
            selectionMode: 'single',
          },
          false,
          'cancelBoxSelection'
        );
      },

      // Modo de seleção
      setSelectionMode: mode => {
        set({ selectionMode: mode }, false, 'setSelectionMode');
      },

      // Navegação entre seleções
      selectNext: () => {
        // Implementação será feita no hook que usa este store
        console.warn(
          'selectNext deve ser implementado no componente que conhece a ordem das features'
        );
      },

      selectPrevious: () => {
        // Implementação será feita no hook que usa este store
        console.warn(
          'selectPrevious deve ser implementado no componente que conhece a ordem das features'
        );
      },

      // Inverter seleção
      invertSelection: allFeatureIds => {
        const state = get();
        const newSelectedIds = allFeatureIds.filter(id => !state.selectedFeatureIds.includes(id));

        set(
          {
            selectedFeatureIds: newSelectedIds,
            lastSelectionAction: {
              type: 'toggle',
              featureIds: allFeatureIds,
              timestamp: Date.now(),
            },
          },
          false,
          'invertSelection'
        );
      },

      // Utilitários
      isSelected: featureId => {
        return get().selectedFeatureIds.includes(featureId);
      },

      getSelectionCount: () => {
        return get().selectedFeatureIds.length;
      },

      hasSelection: () => {
        return get().selectedFeatureIds.length > 0;
      },

      // Reset
      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    {
      name: 'selection-store',
    }
  )
);

// Seletores úteis
export const useSelectionSelectors = () => {
  const store = useSelectionStore();

  return {
    // Estados derivados
    hasSelection: store.selectedFeatureIds.length > 0,
    hasSingleSelection: store.selectedFeatureIds.length === 1,
    hasMultipleSelection: store.selectedFeatureIds.length > 1,
    isBoxSelecting: store.boxSelection.isActive,
    isEditing: store.editingFeatureId !== null,
    hasHover: store.hoveredFeatureId !== null,

    // Contadores
    selectionCount: store.selectedFeatureIds.length,

    // IDs
    firstSelectedId: store.selectedFeatureIds[0] || null,
    lastSelectedId: store.selectedFeatureIds[store.selectedFeatureIds.length - 1] || null,
  };
};

// Hook para ações específicas de seleção
export const useSelectionActions = () => {
  const actions = useSelectionStore(state => ({
    selectFeature: state.selectFeature,
    selectFeatures: state.selectFeatures,
    deselectFeature: state.deselectFeature,
    clearSelection: state.clearSelection,
    toggleFeature: state.toggleFeature,
    setHoveredFeature: state.setHoveredFeature,
    setEditingFeature: state.setEditingFeature,
    setMultiSelectMode: state.setMultiSelectMode,
    toggleMultiSelectMode: state.toggleMultiSelectMode,
    isSelected: state.isSelected,
    reset: state.reset,
  }));

  return actions;
};
