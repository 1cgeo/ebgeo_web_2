// Path: features\io\store\io.store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ExportResult, ImportResult, ImportStrategy } from '../services/import.service';
import { SupportedFormat, OperationStatus } from '../types/io.types';

// Estado das operações de I/O
interface IOState {
  // Estado das operações
  exportOperation: {
    status: OperationStatus;
    progress: number;
    currentPhase: string;
    result: ExportResult | null;
    error: string | null;
    startTime: number | null;
  };

  importOperation: {
    status: OperationStatus;
    progress: number;
    currentPhase: string;
    result: ImportResult | null;
    error: string | null;
    startTime: number | null;
    selectedFile: File | null;
  };

  // Configurações de UI
  ui: {
    showImportExportPanel: boolean;
    showAdvancedOptions: boolean;
    showExportModal: boolean;
    showImportModal: boolean;
    showResultModal: boolean;
    lastResultType: 'export' | 'import' | null;
  };

  // Configurações da última operação
  lastExportOptions: {
    includeAssets: boolean;
    includeAllMaps: boolean;
    compression: boolean;
    selectedMapIds: string[];
    selectedLayerIds: string[];
  };

  lastImportOptions: {
    strategy: ImportStrategy;
    includeAssets: boolean;
    validateData: boolean;
    backupBeforeImport: boolean;
  };

  // Histórico de operações (resumido)
  recentOperations: Array<{
    id: string;
    type: 'export' | 'import';
    filename: string;
    timestamp: string;
    success: boolean;
    stats: any;
  }>;

  // Queue de operações pendentes
  operationQueue: Array<{
    id: string;
    type: 'export' | 'import';
    priority: 'low' | 'normal' | 'high';
    data: any;
    createdAt: string;
  }>;

  // Estatísticas gerais
  stats: {
    totalExports: number;
    totalImports: number;
    totalDataExported: number; // bytes
    totalDataImported: number; // bytes
    lastExportDate: string | null;
    lastImportDate: string | null;
    averageExportTime: number; // segundos
    averageImportTime: number; // segundos;
  };
}

// Ações do store
interface IOActions {
  // Export operations
  startExport: (phase?: string) => void;
  updateExportProgress: (progress: number, phase?: string) => void;
  completeExport: (result: ExportResult) => void;
  failExport: (error: string) => void;
  resetExport: () => void;

  // Import operations
  startImport: (file: File, phase?: string) => void;
  updateImportProgress: (progress: number, phase?: string) => void;
  completeImport: (result: ImportResult) => void;
  failImport: (error: string) => void;
  resetImport: () => void;
  setSelectedFile: (file: File | null) => void;

  // UI management
  setShowImportExportPanel: (show: boolean) => void;
  toggleImportExportPanel: () => void;
  setShowAdvancedOptions: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setShowImportModal: (show: boolean) => void;
  setShowResultModal: (show: boolean, type?: 'export' | 'import') => void;
  closeAllModals: () => void;

  // Options management
  updateLastExportOptions: (options: Partial<IOState['lastExportOptions']>) => void;
  updateLastImportOptions: (options: Partial<IOState['lastImportOptions']>) => void;

  // History and queue
  addRecentOperation: (operation: IOState['recentOperations'][0]) => void;
  clearRecentOperations: () => void;
  addToQueue: (operation: IOState['operationQueue'][0]) => void;
  removeFromQueue: (operationId: string) => void;
  clearQueue: () => void;

  // Statistics
  updateStats: (updates: Partial<IOState['stats']>) => void;
  recordExportStats: (result: ExportResult, duration: number) => void;
  recordImportStats: (result: ImportResult, duration: number) => void;

  // Utilities
  getCurrentOperation: () => 'export' | 'import' | null;
  isAnyOperationActive: () => boolean;
  getLastResult: () => ExportResult | ImportResult | null;

  // Reset
  reset: () => void;
}

// Estado inicial
const initialState: IOState = {
  exportOperation: {
    status: 'idle',
    progress: 0,
    currentPhase: '',
    result: null,
    error: null,
    startTime: null,
  },

  importOperation: {
    status: 'idle',
    progress: 0,
    currentPhase: '',
    result: null,
    error: null,
    startTime: null,
    selectedFile: null,
  },

  ui: {
    showImportExportPanel: false,
    showAdvancedOptions: false,
    showExportModal: false,
    showImportModal: false,
    showResultModal: false,
    lastResultType: null,
  },

  lastExportOptions: {
    includeAssets: true,
    includeAllMaps: true,
    compression: true,
    selectedMapIds: [],
    selectedLayerIds: [],
  },

  lastImportOptions: {
    strategy: 'merge',
    includeAssets: true,
    validateData: true,
    backupBeforeImport: true,
  },

  recentOperations: [],

  operationQueue: [],

  stats: {
    totalExports: 0,
    totalImports: 0,
    totalDataExported: 0,
    totalDataImported: 0,
    lastExportDate: null,
    lastImportDate: null,
    averageExportTime: 0,
    averageImportTime: 0,
  },
};

// Store principal
export const useIOStore = create<IOState & IOActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Export operations
        startExport: (phase = 'Iniciando exportação...') => {
          set(
            {
              exportOperation: {
                status: 'loading',
                progress: 0,
                currentPhase: phase,
                result: null,
                error: null,
                startTime: Date.now(),
              },
            },
            false,
            'startExport'
          );
        },

        updateExportProgress: (progress, phase) => {
          set(
            state => ({
              exportOperation: {
                ...state.exportOperation,
                progress: Math.max(0, Math.min(100, progress)),
                currentPhase: phase || state.exportOperation.currentPhase,
              },
            }),
            false,
            'updateExportProgress'
          );
        },

        completeExport: result => {
          const state = get();
          const duration = state.exportOperation.startTime
            ? (Date.now() - state.exportOperation.startTime) / 1000
            : 0;

          set(
            {
              exportOperation: {
                status: 'success',
                progress: 100,
                currentPhase: 'Exportação concluída',
                result,
                error: null,
                startTime: null,
              },
            },
            false,
            'completeExport'
          );

          // Registrar estatísticas
          get().recordExportStats(result, duration);

          // Adicionar ao histórico
          get().addRecentOperation({
            id: crypto.randomUUID(),
            type: 'export',
            filename: result.filename,
            timestamp: new Date().toISOString(),
            success: result.success,
            stats: result.stats,
          });
        },

        failExport: error => {
          set(
            {
              exportOperation: {
                status: 'error',
                progress: 0,
                currentPhase: 'Erro na exportação',
                result: null,
                error,
                startTime: null,
              },
            },
            false,
            'failExport'
          );
        },

        resetExport: () => {
          set(
            {
              exportOperation: {
                status: 'idle',
                progress: 0,
                currentPhase: '',
                result: null,
                error: null,
                startTime: null,
              },
            },
            false,
            'resetExport'
          );
        },

        // Import operations
        startImport: (file, phase = 'Iniciando importação...') => {
          set(
            {
              importOperation: {
                status: 'loading',
                progress: 0,
                currentPhase: phase,
                result: null,
                error: null,
                startTime: Date.now(),
                selectedFile: file,
              },
            },
            false,
            'startImport'
          );
        },

        updateImportProgress: (progress, phase) => {
          set(
            state => ({
              importOperation: {
                ...state.importOperation,
                progress: Math.max(0, Math.min(100, progress)),
                currentPhase: phase || state.importOperation.currentPhase,
              },
            }),
            false,
            'updateImportProgress'
          );
        },

        completeImport: result => {
          const state = get();
          const duration = state.importOperation.startTime
            ? (Date.now() - state.importOperation.startTime) / 1000
            : 0;

          const filename = state.importOperation.selectedFile?.name || 'arquivo.ebgeo';

          set(
            {
              importOperation: {
                status: 'success',
                progress: 100,
                currentPhase: 'Importação concluída',
                result,
                error: null,
                startTime: null,
                selectedFile: null,
              },
            },
            false,
            'completeImport'
          );

          // Registrar estatísticas
          get().recordImportStats(result, duration);

          // Adicionar ao histórico
          get().addRecentOperation({
            id: crypto.randomUUID(),
            type: 'import',
            filename,
            timestamp: new Date().toISOString(),
            success: result.success,
            stats: result.stats,
          });
        },

        failImport: error => {
          set(
            {
              importOperation: {
                status: 'error',
                progress: 0,
                currentPhase: 'Erro na importação',
                result: null,
                error,
                startTime: null,
                selectedFile: null,
              },
            },
            false,
            'failImport'
          );
        },

        resetImport: () => {
          set(
            {
              importOperation: {
                status: 'idle',
                progress: 0,
                currentPhase: '',
                result: null,
                error: null,
                startTime: null,
                selectedFile: null,
              },
            },
            false,
            'resetImport'
          );
        },

        setSelectedFile: file => {
          set(
            state => ({
              importOperation: {
                ...state.importOperation,
                selectedFile: file,
              },
            }),
            false,
            'setSelectedFile'
          );
        },

        // UI management
        setShowImportExportPanel: show => {
          set(
            state => ({
              ui: { ...state.ui, showImportExportPanel: show },
            }),
            false,
            'setShowImportExportPanel'
          );
        },

        toggleImportExportPanel: () => {
          set(
            state => ({
              ui: {
                ...state.ui,
                showImportExportPanel: !state.ui.showImportExportPanel,
              },
            }),
            false,
            'toggleImportExportPanel'
          );
        },

        setShowAdvancedOptions: show => {
          set(
            state => ({
              ui: { ...state.ui, showAdvancedOptions: show },
            }),
            false,
            'setShowAdvancedOptions'
          );
        },

        setShowExportModal: show => {
          set(
            state => ({
              ui: { ...state.ui, showExportModal: show },
            }),
            false,
            'setShowExportModal'
          );
        },

        setShowImportModal: show => {
          set(
            state => ({
              ui: { ...state.ui, showImportModal: show },
            }),
            false,
            'setShowImportModal'
          );
        },

        setShowResultModal: (show, type) => {
          set(
            state => ({
              ui: {
                ...state.ui,
                showResultModal: show,
                lastResultType: type || state.ui.lastResultType,
              },
            }),
            false,
            'setShowResultModal'
          );
        },

        closeAllModals: () => {
          set(
            state => ({
              ui: {
                ...state.ui,
                showExportModal: false,
                showImportModal: false,
                showResultModal: false,
              },
            }),
            false,
            'closeAllModals'
          );
        },

        // Options management
        updateLastExportOptions: options => {
          set(
            state => ({
              lastExportOptions: { ...state.lastExportOptions, ...options },
            }),
            false,
            'updateLastExportOptions'
          );
        },

        updateLastImportOptions: options => {
          set(
            state => ({
              lastImportOptions: { ...state.lastImportOptions, ...options },
            }),
            false,
            'updateLastImportOptions'
          );
        },

        // History and queue
        addRecentOperation: operation => {
          set(
            state => ({
              recentOperations: [
                operation,
                ...state.recentOperations.slice(0, 19), // Manter apenas 20
              ],
            }),
            false,
            'addRecentOperation'
          );
        },

        clearRecentOperations: () => {
          set({ recentOperations: [] }, false, 'clearRecentOperations');
        },

        addToQueue: operation => {
          set(
            state => ({
              operationQueue: [...state.operationQueue, operation],
            }),
            false,
            'addToQueue'
          );
        },

        removeFromQueue: operationId => {
          set(
            state => ({
              operationQueue: state.operationQueue.filter(op => op.id !== operationId),
            }),
            false,
            'removeFromQueue'
          );
        },

        clearQueue: () => {
          set({ operationQueue: [] }, false, 'clearQueue');
        },

        // Statistics
        updateStats: updates => {
          set(
            state => ({
              stats: { ...state.stats, ...updates },
            }),
            false,
            'updateStats'
          );
        },

        recordExportStats: (result, duration) => {
          set(
            state => {
              const newTotalExports = state.stats.totalExports + 1;
              const newAverageExportTime =
                (state.stats.averageExportTime * state.stats.totalExports + duration) /
                newTotalExports;

              return {
                stats: {
                  ...state.stats,
                  totalExports: newTotalExports,
                  totalDataExported: state.stats.totalDataExported + result.size,
                  lastExportDate: new Date().toISOString(),
                  averageExportTime: newAverageExportTime,
                },
              };
            },
            false,
            'recordExportStats'
          );
        },

        recordImportStats: (result, duration) => {
          set(
            state => {
              const newTotalImports = state.stats.totalImports + 1;
              const newAverageImportTime =
                (state.stats.averageImportTime * state.stats.totalImports + duration) /
                newTotalImports;

              // Estimar tamanho dos dados importados baseado nas estatísticas
              const estimatedSize =
                result.stats.featuresImported * 1000 + // ~1KB por feature
                result.stats.layersImported * 500 + // ~500B por layer
                result.stats.assetsImported * 10000; // ~10KB por asset

              return {
                stats: {
                  ...state.stats,
                  totalImports: newTotalImports,
                  totalDataImported: state.stats.totalDataImported + estimatedSize,
                  lastImportDate: new Date().toISOString(),
                  averageImportTime: newAverageImportTime,
                },
              };
            },
            false,
            'recordImportStats'
          );
        },

        // Utilities
        getCurrentOperation: () => {
          const state = get();
          if (state.exportOperation.status === 'loading') return 'export';
          if (state.importOperation.status === 'loading') return 'import';
          return null;
        },

        isAnyOperationActive: () => {
          const state = get();
          return (
            state.exportOperation.status === 'loading' || state.importOperation.status === 'loading'
          );
        },

        getLastResult: () => {
          const state = get();
          if (state.ui.lastResultType === 'export') {
            return state.exportOperation.result;
          } else if (state.ui.lastResultType === 'import') {
            return state.importOperation.result;
          }
          return null;
        },

        // Reset
        reset: () => {
          set(initialState, false, 'reset');
        },
      }),
      {
        name: 'io-store',
        // Persistir apenas dados importantes
        partialize: state => ({
          lastExportOptions: state.lastExportOptions,
          lastImportOptions: state.lastImportOptions,
          recentOperations: state.recentOperations.slice(0, 10), // Apenas 10 mais recentes
          stats: state.stats,
          ui: {
            showAdvancedOptions: state.ui.showAdvancedOptions,
          },
        }),
      }
    ),
    {
      name: 'io-store',
    }
  )
);

// Seletores úteis
export const useIOSelectors = () => {
  const store = useIOStore();

  return {
    // Estados de operação
    isExporting: store.exportOperation.status === 'loading',
    isImporting: store.importOperation.status === 'loading',
    isAnyOperationActive: store.isAnyOperationActive(),
    currentOperation: store.getCurrentOperation(),

    // Progresso
    exportProgress: store.exportOperation.progress,
    importProgress: store.importOperation.progress,
    currentPhase:
      store.getCurrentOperation() === 'export'
        ? store.exportOperation.currentPhase
        : store.importOperation.currentPhase,

    // Resultados
    lastExportResult: store.exportOperation.result,
    lastImportResult: store.importOperation.result,
    lastResult: store.getLastResult(),
    hasRecentOperations: store.recentOperations.length > 0,

    // Erros
    exportError: store.exportOperation.error,
    importError: store.importOperation.error,
    hasError: !!(store.exportOperation.error || store.importOperation.error),

    // UI
    showPanel: store.ui.showImportExportPanel,
    showAdvanced: store.ui.showAdvancedOptions,
    modalsOpen: {
      export: store.ui.showExportModal,
      import: store.ui.showImportModal,
      result: store.ui.showResultModal,
    },

    // Queue
    queueSize: store.operationQueue.length,
    hasQueuedOperations: store.operationQueue.length > 0,
  };
};

// Hook para ações específicas
export const useIOActions = () => {
  const actions = useIOStore(state => ({
    // Export
    startExport: state.startExport,
    updateExportProgress: state.updateExportProgress,
    completeExport: state.completeExport,
    failExport: state.failExport,
    resetExport: state.resetExport,

    // Import
    startImport: state.startImport,
    updateImportProgress: state.updateImportProgress,
    completeImport: state.completeImport,
    failImport: state.failImport,
    resetImport: state.resetImport,
    setSelectedFile: state.setSelectedFile,

    // UI
    togglePanel: state.toggleImportExportPanel,
    setShowAdvanced: state.setShowAdvancedOptions,
    setShowExportModal: state.setShowExportModal,
    setShowImportModal: state.setShowImportModal,
    setShowResultModal: state.setShowResultModal,
    closeAllModals: state.closeAllModals,

    // Options
    updateExportOptions: state.updateLastExportOptions,
    updateImportOptions: state.updateLastImportOptions,
  }));

  return actions;
};
