// Path: features\io\hooks\useImportExport.ts

import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { exportService, ExportOptions, ExportResult } from '../services/export.service';
import { importService, ImportOptions, ImportResult } from '../services/import.service';
import { useIOActions, useIOSelectors, useIOStore } from '../store/io.store';
import { useMapsStore } from '../../maps-contexts/store/maps.store';
import { useLayersStore } from '../../layers/store/layers.store';
import { useDrawingStore } from '../../drawing/store/drawing.store';
import { FEATURE_QUERY_KEYS } from '../../data-access/hooks/useFeatures';
import { LAYER_QUERY_KEYS } from '../../data-access/hooks/useLayers';
import { MAP_QUERY_KEYS } from '../../data-access/hooks/useMaps';

// Hook principal para operações de import/export integrado com stores
export function useImportExport() {
  const queryClient = useQueryClient();

  // Stores e ações
  const ioActions = useIOActions();
  const ioSelectors = useIOSelectors();
  const ioStore = useIOStore();

  // Estados dos outros stores
  const activeMapId = useMapsStore(state => state.activeMapId);
  const activeLayerId = useLayersStore(state => state.activeLayerId);
  const drawingState = useDrawingStore(state => ({
    activeTool: state.activeTool,
    isDrawing: state.isDrawing,
  }));

  // Invalidar todas as queries relacionadas após import
  const invalidateAllQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: LAYER_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEYS.all });
  }, [queryClient]);

  // Exportar todos os dados
  const exportAll = useCallback(
    async (options: ExportOptions = {}) => {
      try {
        // Atualizar opções no store
        ioActions.updateExportOptions({
          includeAssets: options.includeAssets ?? true,
          compression: options.compression ?? true,
          includeAllMaps: options.includeAllMaps ?? true,
        });

        // Iniciar operação no store
        ioActions.startExport('Coletando dados...');

        // Criar callback de progresso
        const progressCallback = (progress: number, phase?: string) => {
          ioActions.updateExportProgress(progress, phase);
        };

        // Executar exportação com fases
        progressCallback(10, 'Validando dados...');

        // Validação prévia
        const validation = await exportService.validateBeforeExport();
        if (!validation.valid) {
          throw new Error(`Validação falhou: ${validation.issues.join(', ')}`);
        }

        progressCallback(20, 'Preparando export...');

        // Preparar opções finais
        const finalOptions = {
          includeAssets: true,
          compression: true,
          ...options,
        };

        progressCallback(30, 'Coletando features...');

        // Executar exportação
        const result = await exportService.exportAll(finalOptions);

        progressCallback(100, 'Concluído!');

        // Completar no store
        ioActions.completeExport(result);

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido na exportação';
        ioActions.failExport(errorMessage);
        throw error;
      }
    },
    [ioActions]
  );

  // Exportar mapa específico
  const exportMap = useCallback(
    async (mapId: string, options: ExportOptions = {}) => {
      try {
        ioActions.updateExportOptions({
          selectedMapIds: [mapId],
          includeAllMaps: false,
        });

        ioActions.startExport(`Exportando mapa...`);

        const progressCallback = (progress: number, phase?: string) => {
          ioActions.updateExportProgress(progress, phase);
        };

        progressCallback(20, 'Carregando mapa...');

        const result = await exportService.exportMap(mapId, options);

        progressCallback(100, 'Concluído!');
        ioActions.completeExport(result);

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro na exportação do mapa';
        ioActions.failExport(errorMessage);
        throw error;
      }
    },
    [ioActions]
  );

  // Exportar camadas específicas
  const exportLayers = useCallback(
    async (layerIds: string[], options: ExportOptions = {}) => {
      try {
        ioActions.updateExportOptions({
          selectedLayerIds: layerIds,
          includeAllMaps: false,
        });

        ioActions.startExport(`Exportando ${layerIds.length} camada(s)...`);

        const progressCallback = (progress: number, phase?: string) => {
          ioActions.updateExportProgress(progress, phase);
        };

        progressCallback(20, 'Carregando camadas...');

        const result = await exportService.exportLayers(layerIds, options);

        progressCallback(100, 'Concluído!');
        ioActions.completeExport(result);

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro na exportação das camadas';
        ioActions.failExport(errorMessage);
        throw error;
      }
    },
    [ioActions]
  );

  // Importar arquivo
  const importFile = useCallback(
    async (file: File, options: ImportOptions) => {
      try {
        // Atualizar opções no store
        ioActions.updateImportOptions(options);

        // Iniciar operação no store
        ioActions.startImport(file, 'Validando arquivo...');

        // Criar callback de progresso
        const progressCallback = (progress: number, phase?: string) => {
          ioActions.updateImportProgress(progress, phase);
        };

        // Fases da importação
        progressCallback(10, 'Validando arquivo...');

        // Validação do arquivo
        if (!file.name.toLowerCase().endsWith('.ebgeo')) {
          throw new Error('Arquivo deve ter extensão .ebgeo');
        }

        progressCallback(20, 'Extraindo dados...');

        // Executar importação
        const result = await importService.importFile(file, options);

        progressCallback(100, 'Importação concluída!');

        // Completar no store
        ioActions.completeImport(result);

        // Invalidar queries se a importação foi bem-sucedida
        if (result.success) {
          invalidateAllQueries();

          // Se há layers ou mapas importados, pode precisar atualizar o estado ativo
          if (result.stats.layersImported > 0 || result.stats.mapsImported > 0) {
            // Isso será tratado pelos componentes que consomem as queries
          }
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido na importação';
        ioActions.failImport(errorMessage);
        throw error;
      }
    },
    [ioActions, invalidateAllQueries]
  );

  // Exportar mapa ativo (se houver)
  const exportActiveMap = useCallback(
    async (options: ExportOptions = {}) => {
      if (!activeMapId) {
        throw new Error('Nenhum mapa ativo selecionado');
      }
      return exportMap(activeMapId, options);
    },
    [activeMapId, exportMap]
  );

  // Exportar camada ativa (se houver)
  const exportActiveLayer = useCallback(
    async (options: ExportOptions = {}) => {
      if (!activeLayerId) {
        throw new Error('Nenhuma camada ativa selecionada');
      }
      return exportLayers([activeLayerId], options);
    },
    [activeLayerId, exportLayers]
  );

  // Limpar estados
  const clearExportState = useCallback(() => {
    ioActions.resetExport();
  }, [ioActions]);

  const clearImportState = useCallback(() => {
    ioActions.resetImport();
  }, [ioActions]);

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

  // Estados derivados do store
  const exportState = {
    isLoading: ioSelectors.isExporting,
    progress: ioSelectors.exportProgress,
    error: ioSelectors.exportError,
    result: ioSelectors.lastExportResult,
  };

  const importState = {
    isLoading: ioSelectors.isImporting,
    progress: ioSelectors.importProgress,
    error: ioSelectors.importError,
    result: ioSelectors.lastImportResult,
  };

  // Verificar se pode exportar baseado no estado da aplicação
  const canExport = !ioSelectors.isAnyOperationActive && !drawingState.isDrawing;
  const canImport = !ioSelectors.isAnyOperationActive && !drawingState.isDrawing;

  return {
    // Estados integrados com store
    exportState,
    importState,

    // Ações de export
    exportAll,
    exportMap,
    exportLayers,
    exportActiveMap,
    exportActiveLayer,
    clearExportState,

    // Ações de import
    importFile,
    clearImportState,

    // Validações
    validateExport,
    validateImport,

    // Estados derivados
    canExport,
    canImport,
    isAnyOperationActive: ioSelectors.isAnyOperationActive,
    currentOperation: ioSelectors.currentOperation,

    // Contexto da aplicação
    activeMapId,
    activeLayerId,
    drawingState,

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

      if (file.size > 50 * 1024 * 1024) {
        // 50MB
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
  const recordExport = useCallback(
    (size: number) => {
      const newStats = {
        ...stats,
        totalExports: stats.totalExports + 1,
        lastExportDate: new Date().toISOString(),
        avgExportSize: (stats.avgExportSize * stats.totalExports + size) / (stats.totalExports + 1),
      };
      saveStats(newStats);
    },
    [stats, saveStats]
  );

  // Registrar import
  const recordImport = useCallback(
    (size: number) => {
      const newStats = {
        ...stats,
        totalImports: stats.totalImports + 1,
        lastImportDate: new Date().toISOString(),
        avgImportSize: (stats.avgImportSize * stats.totalImports + size) / (stats.totalImports + 1),
      };
      saveStats(newStats);
    },
    [stats, saveStats]
  );

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
  const [backups, setBackups] = useState<
    Array<{
      id: string;
      date: string;
      size: number;
      description: string;
    }>
  >([]);

  // Carregar lista de backups
  const loadBackups = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('backup-'));
      const backupList = keys
        .map(key => {
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
        })
        .filter(Boolean) as typeof backups;

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
