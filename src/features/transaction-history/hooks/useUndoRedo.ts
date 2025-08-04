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

// Configuração de retry
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 100, // ms
  maxDelay: 1000, // ms
} as const;

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

// Utility function para retry com exponential backoff
const retry = async <T>(
  operation: () => Promise<T>,
  attempts: number = RETRY_CONFIG.maxAttempts
): Promise<T> => {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === attempts) {
        throw error;
      }

      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
        RETRY_CONFIG.maxDelay
      );

      console.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry failed - should not reach here');
};

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

  // Aplicar mudanças no storage de forma atômica
  const applyChangesToStorage = useCallback(
    async (
      features: ExtendedFeature[],
      operation: 'create' | 'update' | 'delete'
    ): Promise<void> => {
      if (features.length === 0) return;

      try {
        switch (operation) {
          case 'create':
            // Para criação, usar bulkAdd para melhor performance
            await featureRepository.createMany(features);
            break;

          case 'update':
            // Para atualização, processar individualmente para manter integridade
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
          queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.stats(layerId) });
        });
      } catch (error) {
        console.error('Erro ao aplicar mudanças no storage:', error);
        throw error;
      }
    },
    [queryClient]
  );

  // Reverter transação (undo) - CORRIGIDO: aplica mudança ANTES de atualizar estado
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

  // Operação de undo - CORRIGIDO: Transação atômica
  const undo = useCallback(async (): Promise<boolean> => {
    const nextUndoTransaction = historyStore.getNextUndoTransaction();

    if (!nextUndoTransaction) {
      console.warn('Nenhuma transação disponível para undo');
      return false;
    }

    // Verificar se já está processando
    if (historySelectors.isProcessing) {
      console.warn('Operação de undo já em andamento');
      return false;
    }

    try {
      console.log(`Iniciando undo: ${nextUndoTransaction.description}`);

      // CORREÇÃO CRÍTICA: Aplicar mudança no banco PRIMEIRO
      await retry(() => revertTransaction(nextUndoTransaction));

      // SÓ DEPOIS atualizar estado da pilha se a operação foi bem-sucedida
      const historyUpdateSuccess = await historyStore.undo();

      if (historyUpdateSuccess) {
        console.log(`Undo executado com sucesso: ${nextUndoTransaction.description}`);
        return true;
      } else {
        // Se falhar ao atualizar o histórico, reverter a mudança no banco
        console.error('Falha ao atualizar estado do histórico, revertendo mudança...');
        await retry(() => applyTransaction(nextUndoTransaction));
        throw new Error('Falha ao atualizar estado do histórico');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no undo';
      console.error('Erro durante undo:', errorMessage);

      // Limpar qualquer erro anterior e definir novo erro
      historyActions.clearError();
      // Note: Aqui seria ideal ter um método setError no store, mas não vejo no código atual

      return false;
    }
  }, [historyStore, historySelectors, historyActions, revertTransaction, applyTransaction]);

  // Operação de redo - CORRIGIDO: Transação atômica
  const redo = useCallback(async (): Promise<boolean> => {
    const nextRedoTransaction = historyStore.getNextRedoTransaction();

    if (!nextRedoTransaction) {
      console.warn('Nenhuma transação disponível para redo');
      return false;
    }

    // Verificar se já está processando
    if (historySelectors.isProcessing) {
      console.warn('Operação de redo já em andamento');
      return false;
    }

    try {
      console.log(`Iniciando redo: ${nextRedoTransaction.description}`);

      // CORREÇÃO CRÍTICA: Aplicar mudança no banco PRIMEIRO
      await retry(() => applyTransaction(nextRedoTransaction));

      // SÓ DEPOIS atualizar estado da pilha se a operação foi bem-sucedida
      const historyUpdateSuccess = await historyStore.redo();

      if (historyUpdateSuccess) {
        console.log(`Redo executado com sucesso: ${nextRedoTransaction.description}`);
        return true;
      } else {
        // Se falhar ao atualizar o histórico, reverter a mudança no banco
        console.error('Falha ao atualizar estado do histórico, revertendo mudança...');
        await retry(() => revertTransaction(nextRedoTransaction));
        throw new Error('Falha ao atualizar estado do histórico');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no redo';
      console.error('Erro durante redo:', errorMessage);

      // Limpar qualquer erro anterior
      historyActions.clearError();

      return false;
    }
  }, [historyStore, historySelectors, historyActions, applyTransaction, revertTransaction]);

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
