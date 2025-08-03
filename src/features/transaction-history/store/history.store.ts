// Path: features/transaction-history/store/history.store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Transaction, TransactionType } from '../../../types/feature.types';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';

// Configuração do histórico
const HISTORY_CONFIG = {
  MAX_TRANSACTIONS: 20,
  AUTO_CLEAR_THRESHOLD: 25, // Limpar quando ultrapassar este número
} as const;

// Estado do histórico
interface HistoryState {
  // Pilha de transações
  transactions: Transaction[];
  
  // Índice atual na pilha (-1 = nenhuma transação, 0 = primeira transação aplicada)
  currentIndex: number;
  
  // Estatísticas
  stats: {
    totalTransactions: number;
    undoCount: number;
    redoCount: number;
  };
  
  // Estado de operação
  isProcessing: boolean;
  lastError: string | null;
}

// Ações do store
interface HistoryActions {
  // Adicionar nova transação
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => string;
  
  // Operações de undo/redo
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  
  // Verificações de estado
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Obter transação específica
  getTransaction: (id: string) => Transaction | null;
  getCurrentTransaction: () => Transaction | null;
  getNextUndoTransaction: () => Transaction | null;
  getNextRedoTransaction: () => Transaction | null;
  
  // Gerenciamento
  clear: () => void;
  clearError: () => void;
  
  // Utilitários
  getTransactionHistory: () => {
    past: Transaction[];
    current: Transaction | null;
    future: Transaction[];
  };
  
  // Debug/Stats
  getStats: () => HistoryState['stats'];
  getDebugInfo: () => {
    transactionCount: number;
    currentIndex: number;
    memoryUsage: number;
    canUndo: boolean;
    canRedo: boolean;
  };
}

// Estado inicial
const initialState: HistoryState = {
  transactions: [],
  currentIndex: -1,
  stats: {
    totalTransactions: 0,
    undoCount: 0,
    redoCount: 0,
  },
  isProcessing: false,
  lastError: null,
};

// Funções utilitárias
const generateTransactionId = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const estimateTransactionSize = (transaction: Transaction): number => {
  // Estimativa básica do tamanho em bytes
  const dataStr = JSON.stringify(transaction.data);
  return dataStr.length * 2; // Aproximação para UTF-16
};

const createTransaction = (
  input: Omit<Transaction, 'id' | 'timestamp'>
): Transaction => {
  return {
    id: generateTransactionId(),
    timestamp: Date.now(),
    ...input,
  };
};

// Store principal
export const useHistoryStore = create<HistoryState & HistoryActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Adicionar nova transação
      addTransaction: (input) => {
        const transaction = createTransaction(input);
        
        set((state) => {
          const newTransactions = [...state.transactions];
          
          // Se não estamos no topo da pilha, remover transações futuras
          if (state.currentIndex < newTransactions.length - 1) {
            newTransactions.splice(state.currentIndex + 1);
          }
          
          // Adicionar nova transação
          newTransactions.push(transaction);
          
          // Limitar tamanho da pilha
          if (newTransactions.length > HISTORY_CONFIG.MAX_TRANSACTIONS) {
            const excess = newTransactions.length - HISTORY_CONFIG.MAX_TRANSACTIONS;
            newTransactions.splice(0, excess);
          }
          
          return {
            transactions: newTransactions,
            currentIndex: newTransactions.length - 1,
            stats: {
              ...state.stats,
              totalTransactions: state.stats.totalTransactions + 1,
            },
            lastError: null,
          };
        }, false, 'addTransaction');
        
        return transaction.id;
      },

      // Desfazer última transação
      undo: async () => {
        const state = get();
        
        if (!state.canUndo() || state.isProcessing) {
          return false;
        }
        
        set({ isProcessing: true, lastError: null }, false, 'undo:start');
        
        try {
          const currentTransaction = state.transactions[state.currentIndex];
          
          // A lógica de aplicação será implementada no useUndoRedo
          // Aqui apenas atualizamos o estado da pilha
          
          set((prevState) => ({
            currentIndex: prevState.currentIndex - 1,
            stats: {
              ...prevState.stats,
              undoCount: prevState.stats.undoCount + 1,
            },
            isProcessing: false,
          }), false, 'undo:success');
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no undo';
          
          set({
            isProcessing: false,
            lastError: errorMessage,
          }, false, 'undo:error');
          
          return false;
        }
      },

      // Refazer próxima transação
      redo: async () => {
        const state = get();
        
        if (!state.canRedo() || state.isProcessing) {
          return false;
        }
        
        set({ isProcessing: true, lastError: null }, false, 'redo:start');
        
        try {
          const nextTransaction = state.transactions[state.currentIndex + 1];
          
          // A lógica de aplicação será implementada no useUndoRedo
          // Aqui apenas atualizamos o estado da pilha
          
          set((prevState) => ({
            currentIndex: prevState.currentIndex + 1,
            stats: {
              ...prevState.stats,
              redoCount: prevState.stats.redoCount + 1,
            },
            isProcessing: false,
          }), false, 'redo:success');
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no redo';
          
          set({
            isProcessing: false,
            lastError: errorMessage,
          }, false, 'redo:error');
          
          return false;
        }
      },

      // Verificações de estado
      canUndo: () => {
        const state = get();
        return state.currentIndex >= 0 && !state.isProcessing;
      },

      canRedo: () => {
        const state = get();
        return state.currentIndex < state.transactions.length - 1 && !state.isProcessing;
      },

      // Obter transações específicas
      getTransaction: (id) => {
        const state = get();
        return state.transactions.find(t => t.id === id) || null;
      },

      getCurrentTransaction: () => {
        const state = get();
        if (state.currentIndex >= 0 && state.currentIndex < state.transactions.length) {
          return state.transactions[state.currentIndex];
        }
        return null;
      },

      getNextUndoTransaction: () => {
        const state = get();
        if (state.canUndo()) {
          return state.transactions[state.currentIndex];
        }
        return null;
      },

      getNextRedoTransaction: () => {
        const state = get();
        if (state.canRedo()) {
          return state.transactions[state.currentIndex + 1];
        }
        return null;
      },

      // Gerenciamento
      clear: () => {
        set(initialState, false, 'clear');
      },

      clearError: () => {
        set({ lastError: null }, false, 'clearError');
      },

      // Utilitários
      getTransactionHistory: () => {
        const state = get();
        const past = state.transactions.slice(0, state.currentIndex + 1);
        const current = state.getCurrentTransaction();
        const future = state.transactions.slice(state.currentIndex + 1);
        
        return { past, current, future };
      },

      getStats: () => {
        const state = get();
        return { ...state.stats };
      },

      getDebugInfo: () => {
        const state = get();
        const memoryUsage = state.transactions.reduce(
          (acc, tx) => acc + estimateTransactionSize(tx),
          0
        );
        
        return {
          transactionCount: state.transactions.length,
          currentIndex: state.currentIndex,
          memoryUsage,
          canUndo: state.canUndo(),
          canRedo: state.canRedo(),
        };
      },
    }),
    {
      name: 'history-store',
    }
  )
);

// Seletores úteis
export const useHistorySelectors = () => {
  const store = useHistoryStore();
  
  return {
    // Estados básicos
    canUndo: store.canUndo(),
    canRedo: store.canRedo(),
    isProcessing: store.isProcessing,
    hasError: store.lastError !== null,
    
    // Informações sobre transações
    transactionCount: store.transactions.length,
    currentIndex: store.currentIndex,
    
    // Próximas operações
    nextUndoDescription: store.getNextUndoTransaction()?.description,
    nextRedoDescription: store.getNextRedoTransaction()?.description,
    
    // Estatísticas
    stats: store.getStats(),
  };
};

// Hook para ações básicas
export const useHistoryActions = () => {
  const store = useHistoryStore();
  
  return {
    addTransaction: store.addTransaction,
    undo: store.undo,
    redo: store.redo,
    clear: store.clear,
    clearError: store.clearError,
  };
};