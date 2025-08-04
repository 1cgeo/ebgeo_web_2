// Path: features\io\store\io.store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface IOState {
  isImporting: boolean;
  isExporting: boolean;
  lastImportError: string | null;
  lastExportError: string | null;
  showImportDialog: boolean;
  showExportDialog: boolean;
}

interface IOActions {
  setImporting: (isImporting: boolean) => void;
  setExporting: (isExporting: boolean) => void;
  setImportError: (error: string | null) => void;
  setExportError: (error: string | null) => void;
  toggleImportDialog: (show?: boolean) => void;
  toggleExportDialog: (show?: boolean) => void;
  clearErrors: () => void;
  reset: () => void;
}

const initialState: IOState = {
  isImporting: false,
  isExporting: false,
  lastImportError: null,
  lastExportError: null,
  showImportDialog: false,
  showExportDialog: false,
};

export const useIOStore = create<IOState & IOActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setImporting: isImporting => {
        set(
          {
            isImporting,
            lastImportError: isImporting ? null : get().lastImportError,
          },
          false,
          'setImporting'
        );
      },

      setExporting: isExporting => {
        set(
          {
            isExporting,
            lastExportError: isExporting ? null : get().lastExportError,
          },
          false,
          'setExporting'
        );
      },

      setImportError: error => {
        set({ lastImportError: error, isImporting: false }, false, 'setImportError');
      },

      setExportError: error => {
        set({ lastExportError: error, isExporting: false }, false, 'setExportError');
      },

      toggleImportDialog: show => {
        set(
          state => ({
            showImportDialog: show !== undefined ? show : !state.showImportDialog,
          }),
          false,
          'toggleImportDialog'
        );
      },

      toggleExportDialog: show => {
        set(
          state => ({
            showExportDialog: show !== undefined ? show : !state.showExportDialog,
          }),
          false,
          'toggleExportDialog'
        );
      },

      clearErrors: () => {
        set(
          {
            lastImportError: null,
            lastExportError: null,
          },
          false,
          'clearErrors'
        );
      },

      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    { name: 'io-store' }
  )
);

export const useIOActions = () => {
  return useIOStore(state => ({
    setImporting: state.setImporting,
    setExporting: state.setExporting,
    setImportError: state.setImportError,
    setExportError: state.setExportError,
    toggleImportDialog: state.toggleImportDialog,
    toggleExportDialog: state.toggleExportDialog,
    clearErrors: state.clearErrors,
    reset: state.reset,
  }));
};
