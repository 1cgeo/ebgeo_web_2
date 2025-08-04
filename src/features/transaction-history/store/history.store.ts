// Path: features\transaction-history\store\history.store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Transaction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'feature' | 'layer' | 'map';
  entityId: string;
  beforeData?: any;
  afterData?: any;
  timestamp: number;
}

interface HistoryState {
  transactions: Transaction[];
  currentIndex: number;
}

interface HistoryActions {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  undo: () => Transaction | null;
  redo: () => Transaction | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

const MAX_TRANSACTIONS = 50;

const initialState: HistoryState = {
  transactions: [],
  currentIndex: -1,
};

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      addTransaction: transaction => {
        const id = crypto.randomUUID();
        const newTransaction: Transaction = {
          ...transaction,
          id,
          timestamp: Date.now(),
        };

        set(
          state => {
            const transactions = state.transactions.slice(0, state.currentIndex + 1);
            transactions.push(newTransaction);

            if (transactions.length > MAX_TRANSACTIONS) {
              transactions.shift();
            }

            return {
              transactions,
              currentIndex: transactions.length - 1,
            };
          },
          false,
          'addTransaction'
        );
      },

      undo: () => {
        const state = get();
        if (state.currentIndex >= 0) {
          const transaction = state.transactions[state.currentIndex];
          set({ currentIndex: state.currentIndex - 1 }, false, 'undo');
          return transaction;
        }
        return null;
      },

      redo: () => {
        const state = get();
        if (state.currentIndex < state.transactions.length - 1) {
          const nextIndex = state.currentIndex + 1;
          const transaction = state.transactions[nextIndex];
          set({ currentIndex: nextIndex }, false, 'redo');
          return transaction;
        }
        return null;
      },

      canUndo: () => {
        return get().currentIndex >= 0;
      },

      canRedo: () => {
        const state = get();
        return state.currentIndex < state.transactions.length - 1;
      },

      clear: () => {
        set(initialState, false, 'clear');
      },
    }),
    { name: 'history-store' }
  )
);

export const useHistoryActions = () => {
  return useHistoryStore(state => ({
    addTransaction: state.addTransaction,
    undo: state.undo,
    redo: state.redo,
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    clear: state.clear,
  }));
};
