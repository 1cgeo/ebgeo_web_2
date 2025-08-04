// Path: store\index.ts

export {
  useSelectionStore,
  useSelectionActions,
} from '../features/selection/store/selection.store';

export { useDrawingStore, useDrawingActions } from '../features/drawing/store/drawing.store';

export { useLayersStore, useLayersActions } from '../features/layers/store/layers.store';

export {
  useHistoryStore,
  useHistoryActions,
} from '../features/transaction-history/store/history.store';

export { useIOStore, useIOActions } from '../features/io/store/io.store';

// Hook combinado para ações globais
export const useGlobalActions = () => {
  const selectionActions = useSelectionActions();
  const drawingActions = useDrawingActions();
  const layersActions = useLayersActions();
  const historyActions = useHistoryActions();
  const ioActions = useIOActions();

  return {
    selection: selectionActions,
    drawing: drawingActions,
    layers: layersActions,
    history: historyActions,
    io: ioActions,
  };
};

// Hook para resetar todos os stores
export const useResetAllStores = () => {
  const globalActions = useGlobalActions();

  return () => {
    globalActions.selection.reset();
    globalActions.drawing.reset();
    globalActions.layers.reset();
    globalActions.history.clear();
    globalActions.io.reset();
  };
};
