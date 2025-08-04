// Path: features\transaction-history\hooks\useUndoRedo.ts
import { useCallback } from 'react';
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

  // Ações
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  addTransaction: (options: CreateTransactionOptions) => string;
  clear: () => void;
  clearError: () => void;
}

/**
 * Hook para gerenciar undo/redo de operações
 */
export const useUndoRedo = (): UseUndoRedoReturn => {
  const queryClient = useQueryClient();

  // Seletores do store
  const { canUndo, canRedo, isProcessing, lastError } = useHistorySelectors();

  // Ações do store
  const historyActions = useHistoryActions();

  // Função para aplicar mudanças no storage
  const applyChangesToStorage = useCallback(
    async (
      features: ExtendedFeature[],
      operation: 'create' | 'update' | 'delete'
    ): Promise<void> => {
      if (features.length === 0) return;

      try {
        switch (operation) {
          case 'create':
            await featureRepository.createMany(features);
            break;

          case 'update':
            for (const feature of features) {
              await featureRepository.update(feature.id, feature);
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
        });
      } catch (error) {
        console.error(`Erro ao aplicar ${operation}:`, error);
        throw error;
      }
    },
    [queryClient]
  );

  // Executar undo
  const undo = useCallback(async (): Promise<boolean> => {
    if (!canUndo || isProcessing) return false;

    try {
      const success = await historyActions.undo(async transaction => {
        const { before, after } = transaction.data;

        if (after && after.length > 0) {
          // Reverter criação (deletar features criadas)
          if (transaction.type === 'create') {
            await applyChangesToStorage(after, 'delete');
          }
          // Reverter atualização (restaurar estado anterior)
          else if (transaction.type === 'update' && before && before.length > 0) {
            await applyChangesToStorage(before, 'update');
          }
          // Reverter deleção (recriar features deletadas)
          else if (transaction.type === 'delete' && before && before.length > 0) {
            await applyChangesToStorage(before, 'create');
          }
        }
      });

      return success;
    } catch (error) {
      console.error('Erro no undo:', error);
      return false;
    }
  }, [canUndo, isProcessing, historyActions, applyChangesToStorage]);

  // Executar redo
  const redo = useCallback(async (): Promise<boolean> => {
    if (!canRedo || isProcessing) return false;

    try {
      const success = await historyActions.redo(async transaction => {
        const { before, after } = transaction.data;

        if (after && after.length > 0) {
          // Refazer criação
          if (transaction.type === 'create') {
            await applyChangesToStorage(after, 'create');
          }
          // Refazer atualização
          else if (transaction.type === 'update') {
            await applyChangesToStorage(after, 'update');
          }
          // Refazer deleção
          else if (transaction.type === 'delete') {
            await applyChangesToStorage(after, 'delete');
          }
        }
      });

      return success;
    } catch (error) {
      console.error('Erro no redo:', error);
      return false;
    }
  }, [canRedo, isProcessing, historyActions, applyChangesToStorage]);

  // Adicionar nova transação
  const addTransaction = useCallback(
    (options: CreateTransactionOptions): string => {
      const { type, description, before, after } = options;

      // Normalizar arrays
      const normalizedBefore = before ? (Array.isArray(before) ? before : [before]) : undefined;
      const normalizedAfter = after ? (Array.isArray(after) ? after : [after]) : undefined;

      // Criar transação
      const transaction: Omit<Transaction, 'id' | 'timestamp'> = {
        type,
        description,
        data: {
          before: normalizedBefore,
          after: normalizedAfter,
        },
      };

      return historyActions.addTransaction(transaction);
    },
    [historyActions]
  );

  // Obter descrição da próxima operação de undo
  const nextUndoDescription = useCallback(() => {
    const transaction = historyActions.getNextUndoTransaction();
    return transaction?.description;
  }, [historyActions]);

  // Obter descrição da próxima operação de redo
  const nextRedoDescription = useCallback(() => {
    const transaction = historyActions.getNextRedoTransaction();
    return transaction?.description;
  }, [historyActions]);

  return {
    // Estados
    canUndo,
    canRedo,
    isProcessing,
    hasError: !!lastError,

    // Informações sobre próximas operações
    nextUndoDescription: nextUndoDescription(),
    nextRedoDescription: nextRedoDescription(),

    // Ações
    undo,
    redo,
    addTransaction,
    clear: historyActions.clear,
    clearError: historyActions.clearError,
  };
};
