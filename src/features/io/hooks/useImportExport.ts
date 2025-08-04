// Path: features\io\hooks\useImportExport.ts
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  importService,
  ImportOptions,
  ImportResult,
  ImportStrategy,
} from '../services/import.service';
import { exportService, ExportOptions, ExportResult } from '../services/export.service';
import { FEATURE_QUERY_KEYS } from '../../data-access/hooks/useFeatures';
import { IO_CONFIG } from '../../../constants/app.constants';

// Hook principal para importação
export function useImport() {
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options: ImportOptions }) => {
      return importService.importFile(file, options);
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas após importação bem-sucedida
      queryClient.invalidateQueries({ queryKey: FEATURE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },
  });

  const importFile = useCallback(
    (
      file: File,
      options: ImportOptions = {
        strategy: 'merge',
        includeAssets: true,
        validateData: true,
      }
    ) => {
      return importMutation.mutateAsync({ file, options });
    },
    [importMutation]
  );

  return {
    importFile,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
    importResult: importMutation.data,
    reset: importMutation.reset,
  };
}

// Hook principal para exportação
export function useExport() {
  const exportMutation = useMutation({
    mutationFn: async (options: ExportOptions) => {
      return exportService.exportAll(options);
    },
  });

  const exportAll = useCallback(
    (options: ExportOptions = {}) => {
      return exportMutation.mutateAsync(options);
    },
    [exportMutation]
  );

  const exportMaps = useCallback(
    (mapIds: string[], options: Omit<ExportOptions, 'selectedMapIds'> = {}) => {
      return exportService.exportMaps(mapIds, options);
    },
    []
  );

  const exportLayers = useCallback(
    (layerIds: string[], options: Omit<ExportOptions, 'selectedLayerIds'> = {}) => {
      return exportService.exportLayers(layerIds, options);
    },
    []
  );

  return {
    exportAll,
    exportMaps,
    exportLayers,
    isExporting: exportMutation.isPending,
    exportError: exportMutation.error,
    exportResult: exportMutation.data,
    reset: exportMutation.reset,
  };
}

// Hook para validação de arquivos e operações
export function useImportExportValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateExportOperation = useCallback(async (options: ExportOptions = {}) => {
    setIsValidating(true);
    try {
      const result = await exportService.validateExportOperation(options);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateImportFile = useCallback(async (file: File) => {
    setIsValidating(true);
    try {
      const issues: string[] = [];

      // Validar extensão
      if (!file.name.toLowerCase().endsWith('.ebgeo')) {
        issues.push('Arquivo deve ter extensão .ebgeo');
      }

      // Validar tamanho
      if (file.size > IO_CONFIG.maxFileSize) {
        issues.push(`Arquivo muito grande (máximo ${formatFileSize(IO_CONFIG.maxFileSize)})`);
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

// Hook para estratégias de importação
export function useImportStrategies() {
  const [selectedStrategy, setSelectedStrategy] = useState<ImportStrategy>('merge');

  const strategies = [
    {
      value: 'merge' as ImportStrategy,
      label: 'Mesclar',
      description: 'Mesclar dados novos com existentes, substituindo conflitos',
    },
    {
      value: 'replace' as ImportStrategy,
      label: 'Substituir',
      description: 'Substituir dados existentes pelos importados',
    },
    {
      value: 'skip-existing' as ImportStrategy,
      label: 'Pular Existentes',
      description: 'Importar apenas dados novos, manter existentes',
    },
    {
      value: 'rename-conflicts' as ImportStrategy,
      label: 'Renomear Conflitos',
      description: 'Renomear dados importados em caso de conflito',
    },
  ];

  return {
    selectedStrategy,
    setSelectedStrategy,
    strategies,
  };
}

// Hook para opções de exportação
export function useExportOptions() {
  const [options, setOptions] = useState<ExportOptions>({
    includeAssets: true,
    includeAllMaps: true,
    compression: true,
  });

  const updateOption = useCallback(
    <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
      setOptions(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetOptions = useCallback(() => {
    setOptions({
      includeAssets: true,
      includeAllMaps: true,
      compression: true,
    });
  }, []);

  return {
    options,
    updateOption,
    resetOptions,
    setOptions,
  };
}

// Utilitário para formatar tamanho de arquivo
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
