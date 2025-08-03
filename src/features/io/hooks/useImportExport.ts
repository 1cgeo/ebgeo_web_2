// Path: features/io/hooks/useImportExport.ts

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { exportService, ExportOptions, ExportResult } from '../services/export.service';
import { importService, ImportOptions, ImportResult } from '../services/import.service';
import { FEATURE_QUERY_KEYS } from '../../data-access/hooks/useFeatures';
import { LAYER_QUERY_KEYS } from '../../data-access/hooks/useLayers';
import { MAP_QUERY_KEYS } from '../../data-access/hooks/useMaps';

// Interface para estado das operações
interface OperationState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  result: ExportResult | ImportResult | null;
}

// Hook principal para operações de import/export
export function useImportExport() {
  const queryClient = useQueryClient();
  
  // Estado das operações
  const [exportState, setExportState] = useState<OperationState>({
    isLoading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const [importState, setImportState] = useState<OperationState>({
    isLoading: false,
    progress: 0,
    error: null,
    result: null,
  });

  // Função para simular progresso
  const simulateProgress = useCallback((
    setState: React.Dispatch<React.SetStateAction<OperationState>>,
    duration: number = 3000
  ) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 90, 90); // Máximo 90% simulado
      
      setState(prev => ({ ...prev, progress }));
      
      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 100);
    
    return interval;
  }, []);

  // Invalidar todas as queries relacionadas após import
  const invalidateAllQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: LAYER_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEYS.all });
  }, [queryClient]);

  // Exportar todos os dados
  const exportAll = useCallback(async (options: ExportOptions = {}) => {
    setExportState({
      isLoading: true,
      progress: 0,
      error: null,
      result: null,
    });

    const progressInterval = simulateProgress(setExportState);

    try {
      const result = await exportService.exportAll(options);
      
      clearInterval(progressInterval);
      setExportState({
        isLoading: false,
        progress: 100,
        error: null,
        result,
      });

      return result;

    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na exportação';
      
      setExportState({
        isLoading: false,
        progress: 0,
        error: errorMessage,
        result: {
          success: false,
          filename: '',
          size: 0,
          stats: { features: 0, layers: 0, maps: 0, assets: 0 },
          error: errorMessage,
        },
      });

      throw error;
    }
  }, [simulateProgress]);

  // Exportar mapa específico
  const exportMap = useCallback(async (mapId: string, options: ExportOptions = {}) => {
    setExportState({
      isLoading: true,
      progress: 0,
      error: null,
      result: null,
    });

    const progressInterval = simulateProgress(setExportState);

    try {
      const result = await exportService.exportMap(mapId, options);
      
      clearInterval(progressInterval);
      setExportState({
        isLoading: false,
        progress: 100,
        error: null,
        result,
      });

      return result;

    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na exportação';
      
      setExportState({
        isLoading: false,
        progress: 0,
        error: errorMessage,
        result: {
          success: false,
          filename: '',
          size: 0,
          stats: { features: 0, layers: 0, maps: 0, assets: 0 },
          error: errorMessage,
        },
      });

      throw error;
    }
  }, [simulateProgress]);

  // Exportar camadas específicas
  const exportLayers = useCallback(async (layerIds: string[], options: ExportOptions = {}) => {
    setExportState({
      isLoading: true,
      progress: 0,
      error: null,
      result: null,
    });

    const progressInterval = simulateProgress(setExportState);

    try {
      const result = await exportService.exportLayers(layerIds, options);
      
      clearInterval(progressInterval);
      setExportState({
        isLoading: false,
        progress: 100,
        error: null,
        result,
      });

      return result;

    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na exportação';
      
      setExportState({
        isLoading: false,
        progress: 0,
        error: errorMessage,
        result: {
          success: false,
          filename: '',
          size: 0,
          stats: { features: 0, layers: 0, maps: 0, assets: 0 },
          error: errorMessage,
        },
      });

      throw error;
    }
  }, [simulateProgress]);

  // Importar arquivo
  const importFile = useCallback(async (file: File, options: ImportOptions) => {
    setImportState({
      isLoading: true,
      progress: 0,
      error: null,
      result: null,
    });

    const progressInterval = simulateProgress(setImportState, 5000); // Importação pode ser mais demorada

    try {
      const result = await importService.importFile(file, options);
      
      clearInterval(progressInterval);
      setImportState({
        isLoading: false,
        progress: 100,
        error: null,
        result,
      });

      // Invalidar queries se a importação foi bem-sucedida
      if (result.success) {
        invalidateAllQueries();
      }

      return result;

    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na importação';
      
      setImportState({
        isLoading: false,
        progress: 0,
        error: errorMessage,
        result: {
          success: false,
          stats: { featuresImported: 0, layersImported: 0, mapsImported: 0, assetsImported: 0, conflicts: 0, errors: 1 },
          conflicts: [],
          errors: [errorMessage],
        },
      });

      throw error;
    }
  }, [simulateProgress, invalidateAllQueries]);

  // Limpar estado de export
  const clearExportState = useCallback(() => {
    setExportState({
      isLoading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  // Limpar estado de import
  const clearImportState = useCallback(() => {
    setImportState({
      isLoading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  // Validar antes da exportação
  const validateExport = useCallback(async () => {
    try {
      return await exportService.validateBeforeExport();
    } catch (error) {
      return {
        valid: false,
        issues: [error instanceof Error ? error.message : 'Erro na validação'],
      };
    }
  }, []);

  // Validar após importação
  const validateImport = useCallback(async () => {
    try {
      return await importService.validateAfterImport();
    } catch (error) {
      return {
        valid: false,
        issues: [error instanceof Error ? error.message : 'Erro na validação'],
      };
    }
  }, []);

  return {
    // Estados
    exportState,
    importState,
    
    // Ações de export
    exportAll,
    exportMap,
    exportLayers,
    clearExportState,
    
    // Ações de import
    importFile,
    clearImportState,
    
    // Validações
    validateExport,
    validateImport,
    
    // Utilitários
    invalidateAllQueries,
  };
}

// Hook específico para validação de operações
export function useOperationValidation() {
  const [isValidating, setIsValidating] = useState(false);
  
  const validateExportOperation = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await exportService.validateBeforeExport();
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateImportFile = useCallback(async (file: File) => {
    setIsValidating(true);
    try {
      // Validações básicas do arquivo
      const issues: string[] = [];
      
      if (!file.name.toLowerCase().endsWith('.ebgeo')) {
        issues.push('Arquivo deve ter extensão .ebgeo');
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB
        issues.push('Arquivo muito grande (máximo 50MB)');
      }
      
      if (file.size === 0) {
        issues.push('Arquivo está vazio');
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validatePostImport = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await importService.validateAfterImport();
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    isValidating,
    validateExportOperation,
    validateImportFile,
    validatePostImport,
  };
}

// Hook para estatísticas e métricas
export function useImportExportStats() {
  const [stats, setStats] = useState<{
    totalExports: number;
    totalImports: number;
    lastExportDate?: string;
    lastImportDate?: string;
    avgExportSize: number;
    avgImportSize: number;
  }>({
    totalExports: 0,
    totalImports: 0,
    avgExportSize: 0,
    avgImportSize: 0,
  });

  // Carregar estatísticas do localStorage
  const loadStats = useCallback(() => {
    try {
      const savedStats = localStorage.getItem('ebgeo-import-export-stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.warn('Erro ao carregar estatísticas:', error);
    }
  }, []);

  // Salvar estatísticas no localStorage
  const saveStats = useCallback((newStats: typeof stats) => {
    try {
      localStorage.setItem('ebgeo-import-export-stats', JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.warn('Erro ao salvar estatísticas:', error);
    }
  }, []);

  // Registrar export
  const recordExport = useCallback((size: number) => {
    const newStats = {
      ...stats,
      totalExports: stats.totalExports + 1,
      lastExportDate: new Date().toISOString(),
      avgExportSize: (stats.avgExportSize * stats.totalExports + size) / (stats.totalExports + 1),
    };
    saveStats(newStats);
  }, [stats, saveStats]);

  // Registrar import
  const recordImport = useCallback((size: number) => {
    const newStats = {
      ...stats,
      totalImports: stats.totalImports + 1,
      lastImportDate: new Date().toISOString(),
      avgImportSize: (stats.avgImportSize * stats.totalImports + size) / (stats.totalImports + 1),
    };
    saveStats(newStats);
  }, [stats, saveStats]);

  // Limpar estatísticas
  const clearStats = useCallback(() => {
    const emptyStats = {
      totalExports: 0,
      totalImports: 0,
      avgExportSize: 0,
      avgImportSize: 0,
    };
    saveStats(emptyStats);
  }, [saveStats]);

  return {
    stats,
    loadStats,
    recordExport,
    recordImport,
    clearStats,
  };
}

// Hook para gerenciar backups automáticos
export function useBackupManager() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backups, setBackups] = useState<Array<{
    id: string;
    date: string;
    size: number;
    description: string;
  }>>([]);

  // Carregar lista de backups
  const loadBackups = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('backup-'));
      const backupList = keys.map(key => {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          return {
            id: key,
            date: new Date(parseInt(key.split('-')[1])).toISOString(),
            size: JSON.stringify(parsed).length,
            description: `Backup automático`,
          };
        }
        return null;
      }).filter(Boolean) as typeof backups;

      // Ordenar por data (mais recente primeiro)
      backupList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setBackups(backupList);
    } catch (error) {
      console.warn('Erro ao carregar backups:', error);
    }
  }, []);

  // Criar backup manual
  const createBackup = useCallback(async (description?: string) => {
    setIsCreatingBackup(true);
    try {
      const backupId = `backup-${Date.now()}`;
      
      // Usar o service de import para criar backup
      const backupData = {
        features: await db.features.toArray(),
        layers: await db.layers.toArray(),
        maps: await db.maps.toArray(),
        assets: await db.assets.toArray(),
      };

      localStorage.setItem(backupId, JSON.stringify(backupData));
      
      const newBackup = {
        id: backupId,
        date: new Date().toISOString(),
        size: JSON.stringify(backupData).length,
        description: description || 'Backup manual',
      };

      setBackups(prev => [newBackup, ...prev]);
      
      return backupId;
    } finally {
      setIsCreatingBackup(false);
    }
  }, []);

  // Restaurar backup
  const restoreBackup = useCallback(async (backupId: string) => {
    try {
      const backupData = localStorage.getItem(backupId);
      if (!backupData) {
        throw new Error('Backup não encontrado');
      }

      const data = JSON.parse(backupData);

      await db.transaction('rw', [db.features, db.layers, db.maps, db.assets], async () => {
        await db.features.clear();
        await db.layers.clear();
        await db.maps.clear();
        await db.assets.clear();

        await db.features.bulkAdd(data.features);
        await db.layers.bulkAdd(data.layers);
        await db.maps.bulkAdd(data.maps);
        await db.assets.bulkAdd(data.assets);
      });

      return true;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw error;
    }
  }, []);

  // Deletar backup
  const deleteBackup = useCallback((backupId: string) => {
    try {
      localStorage.removeItem(backupId);
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
    } catch (error) {
      console.warn('Erro ao deletar backup:', error);
    }
  }, []);

  // Limpar backups antigos (manter apenas os 10 mais recentes)
  const cleanOldBackups = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('backup-'));
      keys.sort((a, b) => {
        const timeA = parseInt(a.split('-')[1]);
        const timeB = parseInt(b.split('-')[1]);
        return timeB - timeA; // Mais recente primeiro
      });

      // Remover backups além dos 10 mais recentes
      const toDelete = keys.slice(10);
      toDelete.forEach(key => {
        localStorage.removeItem(key);
      });

      if (toDelete.length > 0) {
        loadBackups(); // Recarregar lista
      }
    } catch (error) {
      console.warn('Erro ao limpar backups antigos:', error);
    }
  }, [loadBackups]);

  return {
    backups,
    isCreatingBackup,
    loadBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    cleanOldBackups,
  };
}