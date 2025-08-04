// Path: features\transaction-history\hooks\useUndoRedo.ts

import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useHistoryStore, useHistoryActions, useHistorySelectors } from '../store/history.store';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';
import { Transaction, TransactionType } from '../../../types/feature.types';
import { IndexedDBFeatureRepository } from '../../data-access/repositories/implementations/IndexedDBFeatureRepository';
import { FEATURE_QUERY_KEYS } from '../../data-access/hooks/useFeatures';

// Instância do repository
const featureRepository = new IndexedDBFeatureRepository();

// Tipos para criação de transações
interface CreateTransactionOptions {
  type: TransactionType;
  description: string;
  before?: ExtendedFeature | ExtendedFeature[];
  after?: ExtendedFeature | ExtendedFeature[];
}

// Interface do hook
interface UseUndoRedoReturn {
  // Estados
  canUndo: boolean;
  canRedo: boolean;
  isProcessing: boolean;
  hasError: boolean;

  // Informações sobre próximas operações
  nextUndoDescription?: string;
  nextRedoDescription?: string;

  // Operações principais
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;

  // Criação de transações
  createTransaction: (options: CreateTransactionOptions) => string;

  // Utilitários
  clear: () => void;
  clearError: () => void;

  // Estatísticas e debug
  stats: {
    totalTransactions: number;
    undoCount: number;
    redoCount: number;
  };
  debugInfo: {
    transactionCount: number;
    currentIndex: number;
    memoryUsage: number;
    canUndo: boolean;
    canRedo: boolean;
  };
}

export const useUndoRedo = (): UseUndoRedoReturn => {
  const queryClient = useQueryClient();

  // Store state e actions
  const historyStore = useHistoryStore();
  const historyActions = useHistoryActions();
  const historySelectors = useHistorySelectors();

  // Criar transação
  const createTransaction = useCallback(
    (options: CreateTransactionOptions): string => {
      const { type, description, before, after } = options;

      // Validar dados da transação
      if (!description.trim()) {
        throw new Error('Descrição da transação é obrigatória');
      }

      // Normalizar dados before/after
      const normalizedBefore = before ? (Array.isArray(before) ? before : [before]) : undefined;
      const normalizedAfter = after ? (Array.isArray(after) ? after : [after]) : undefined;

      // Validações específicas por tipo
      switch (type) {
        case 'create':
          if (!normalizedAfter || normalizedAfter.length === 0) {
            throw new Error('Transação de criação deve ter dados "after"');
          }
          break;

        case 'update':
          if (
            !normalizedBefore ||
            !normalizedAfter ||
            normalizedBefore.length !== normalizedAfter.length
          ) {
            throw new Error(
              'Transação de atualização deve ter dados "before" e "after" com mesmo tamanho'
            );
          }
          break;

        case 'delete':
          if (!normalizedBefore || normalizedBefore.length === 0) {
            throw new Error('Transação de deleção deve ter dados "before"');
          }
          break;

        case 'batch':
          if (
            (!normalizedBefore && !normalizedAfter) ||
            (normalizedBefore &&
              normalizedAfter &&
              normalizedBefore.length !== normalizedAfter.length)
          ) {
            throw new Error('Transação em lote deve ter dados consistentes');
          }
          break;
      }

      return historyActions.addTransaction({
        type,
        description,
        data: {
          before: normalizedBefore,
          after: normalizedAfter,
        },
      });
    },
    [historyActions]
  );

  // Aplicar mudanças no repository e cache
  const applyChangesToStorage = useCallback(
    async (
      features: ExtendedFeature[],
      operation: 'create' | 'update' | 'delete'
    ): Promise<void> => {
      try {
        switch (operation) {
          case 'create':
            await featureRepository.createMany(features);
            // Atualizar cache
            features.forEach(feature => {
              queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(feature.id), feature);
            });
            break;

          case 'update':
            for (const feature of features) {
              await featureRepository.update(feature.id, feature);
              queryClient.setQueryData(FEATURE_QUERY_KEYS.detail(feature.id), feature);
            }
            break;

          case 'delete':
            const ids = features.map(f => f.id);
            await featureRepository.deleteMany(ids);
            // Remover do cache
            ids.forEach(id => {
              queryClient.removeQueries({ queryKey: FEATURE_QUERY_KEYS.detail(id) });
            });
            break;
        }

        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.lists() });

        // Obter layers afetadas e invalidar suas queries
        const affectedLayers = new Set(features.map(f => f.properties.layerId));
        affectedLayers.forEach(layerId => {
          queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.byLayer(layerId) });
          queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.stats(layerId) });
        });
      } catch (error) {
        console.error('Erro ao aplicar mudanças no storage:', error);
        throw error;
      }
    },
    [queryClient]
  );

  // Reverter transação (undo)
  const revertTransaction = useCallback(
    async (transaction: Transaction): Promise<void> => {
      const { type, data } = transaction;

      switch (type) {
        case 'create':
          // Reverter criação = deletar features criadas
          if (data.after) {
            await applyChangesToStorage(data.after as ExtendedFeature[], 'delete');
          }
          break;

        case 'update':
          // Reverter atualização = restaurar estado anterior
          if (data.before) {
            await applyChangesToStorage(data.before as ExtendedFeature[], 'update');
          }
          break;

        case 'delete':
          // Reverter deleção = recriar features deletadas
          if (data.before) {
            await applyChangesToStorage(data.before as ExtendedFeature[], 'create');
          }
          break;

        case 'batch':
          // Para batch, reverter baseado no que existe em before/after
          if (data.before && data.after) {
            // Era uma atualização em lote
            await applyChangesToStorage(data.before as ExtendedFeature[], 'update');
          } else if (data.after) {
            // Era uma criação em lote
            await applyChangesToStorage(data.after as ExtendedFeature[], 'delete');
          } else if (data.before) {
            // Era uma deleção em lote
            await applyChangesToStorage(data.before as ExtendedFeature[], 'create');
          }
          break;

        default:
          throw new Error(`Tipo de transação não suportado para undo: ${type}`);
      }
    },
    [applyChangesToStorage]
  );

  // Aplicar transação (redo)
  const applyTransaction = useCallback(
    async (transaction: Transaction): Promise<void> => {
      const { type, data } = transaction;

      switch (type) {
        case 'create':
          // Aplicar criação
          if (data.after) {
            await applyChangesToStorage(data.after as ExtendedFeature[], 'create');
          }
          break;

        case 'update':
          // Aplicar atualização
          if (data.after) {
            await applyChangesToStorage(data.after as ExtendedFeature[], 'update');
          }
          break;

        case 'delete':
          // Aplicar deleção
          if (data.before) {
            await applyChangesToStorage(data.before as ExtendedFeature[], 'delete');
          }
          break;

        case 'batch':
          // Para batch, aplicar baseado no que existe em before/after
          if (data.before && data.after) {
            // É uma atualização em lote
            await applyChangesToStorage(data.after as ExtendedFeature[], 'update');
          } else if (data.after) {
            // É uma criação em lote
            await applyChangesToStorage(data.after as ExtendedFeature[], 'create');
          } else if (data.before) {
            // É uma deleção em lote
            await applyChangesToStorage(data.before as ExtendedFeature[], 'delete');
          }
          break;

        default:
          throw new Error(`Tipo de transação não suportado para redo: ${type}`);
      }
    },
    [applyChangesToStorage]
  );

  // Operação de undo
  const undo = useCallback(async (): Promise<boolean> => {
    const nextUndoTransaction = historyStore.getNextUndoTransaction();

    if (!nextUndoTransaction) {
      console.warn('Nenhuma transação disponível para undo');
      return false;
    }

    try {
      // Reverter a transação
      await revertTransaction(nextUndoTransaction);

      // Atualizar estado da pilha
      const success = await historyStore.undo();

      if (success) {
        console.log(`Undo executado: ${nextUndoTransaction.description}`);
      }

      return success;
    } catch (error) {
      console.error('Erro durante undo:', error);
      return false;
    }
  }, [historyStore, revertTransaction]);

  // Operação de redo
  const redo = useCallback(async (): Promise<boolean> => {
    const nextRedoTransaction = historyStore.getNextRedoTransaction();

    if (!nextRedoTransaction) {
      console.warn('Nenhuma transação disponível para redo');
      return false;
    }

    try {
      // Aplicar a transação
      await applyTransaction(nextRedoTransaction);

      // Atualizar estado da pilha
      const success = await historyStore.redo();

      if (success) {
        console.log(`Redo executado: ${nextRedoTransaction.description}`);
      }

      return success;
    } catch (error) {
      console.error('Erro durante redo:', error);
      return false;
    }
  }, [historyStore, applyTransaction]);

  // Retorno memorizado
  return useMemo(
    (): UseUndoRedoReturn => ({
      // Estados
      canUndo: historySelectors.canUndo,
      canRedo: historySelectors.canRedo,
      isProcessing: historySelectors.isProcessing,
      hasError: historySelectors.hasError,

      // Informações sobre próximas operações
      nextUndoDescription: historySelectors.nextUndoDescription,
      nextRedoDescription: historySelectors.nextRedoDescription,

      // Operações principais
      undo,
      redo,

      // Criação de transações
      createTransaction,

      // Utilitários
      clear: historyActions.clear,
      clearError: historyActions.clearError,

      // Estatísticas e debug
      stats: historySelectors.stats,
      debugInfo: historyStore.getDebugInfo(),
    }),
    [historySelectors, historyActions, historyStore, undo, redo, createTransaction]
  );
};
