// Path: features\io\components\ImportExportControls.tsx
import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileText,
  Database,
  Map,
  Layers,
  AlertCircle,
  CheckCircle,
  X,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useImportExport } from '../hooks/useImportExport';
import { useIOActions, useIOSelectors } from '../store/io.store';
import { useIOKeyboardShortcuts, IOShortcutsHelp } from '../hooks/useIOKeyboardShortcuts';
import { useMaps } from '../../data-access/hooks/useMaps';
import { useLayers } from '../../data-access/hooks/useLayers';
import { useMapsStore } from '../../maps-contexts/store/maps.store';
import { useLayersStore } from '../../layers/store/layers.store';
import { ImportStrategy } from '../services/import.service';

interface ImportExportControlsProps {
  className?: string;
}

type ModalType = 'export' | 'import' | 'export-options' | 'import-options' | 'result' | null;

interface ExportModalData {
  type: 'all' | 'map' | 'layers';
  mapId?: string;
  layerIds?: string[];
}

export default function ImportExportControls({ className = '' }: ImportExportControlsProps) {
  // Hooks principais
  const {
    exportAll,
    exportMap,
    exportLayers,
    exportActiveMap,
    exportActiveLayer,
    importFile,
    exportState,
    importState,
    canExport,
    canImport,
    activeMapId,
    activeLayerId,
  } = useImportExport();

  // Store actions e selectors
  const ioActions = useIOActions();
  const ioSelectors = useIOSelectors();

  // Estados dos stores
  const activeMap = useMapsStore(state => state.activeMap);
  const activeLayer = useLayersStore(state => state.activeLayer);

  // Hooks de dados
  const { data: maps = [] } = useMaps();
  const { data: layers = [] } = useLayers();

  // Atalhos de teclado
  useIOKeyboardShortcuts(true);

  // Estados locais
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportType, setExportType] = useState<'all' | 'map' | 'layers'>('all');
  const [selectedMapId, setSelectedMapId] = useState<string>('');
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);

  // Opções de exportação (usando valores do store)
  const [exportOptions, setExportOptions] = useState({
    includeAssets: ioSelectors.lastExportResult?.includeAssets ?? true,
    compression: true,
    filename: '',
  });

  // Opções de importação (usando valores do store)
  const [importOptions, setImportOptions] = useState({
    strategy: 'merge' as ImportStrategy,
    includeAssets: true,
    validateData: true,
    backupBeforeImport: true,
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers principais
  const handleExportAll = () => {
    setExportType('all');
    setShowExportModal(true);
  };

  const handleExportMap = (mapId?: string) => {
    setExportType('map');
    setSelectedMapId(mapId || activeMapId || '');
    setShowExportModal(true);
  };

  const handleExportLayers = (layerIds?: string[]) => {
    setExportType('layers');
    setSelectedLayerIds(layerIds || (activeLayerId ? [activeLayerId] : []));
    setShowExportModal(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowImportModal(true);
    }
  };

  // Executar exportação
  const executeExport = async () => {
    try {
      setShowExportModal(false);

      let result;
      if (exportType === 'all') {
        result = await exportAll(exportOptions);
      } else if (exportType === 'map' && selectedMapId) {
        result = await exportMap(selectedMapId, exportOptions);
      } else if (exportType === 'layers' && selectedLayerIds.length > 0) {
        result = await exportLayers(selectedLayerIds, exportOptions);
      } else {
        throw new Error('Configuração de exportação inválida');
      }

      setShowResultModal(true);
    } catch (error) {
      console.error('Erro na exportação:', error);
      setShowResultModal(true);
    }
  };

  // Executar importação
  const executeImport = async () => {
    if (!selectedFile) return;

    try {
      setShowImportModal(false);

      const result = await importFile(selectedFile, importOptions);

      setShowResultModal(true);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      setShowResultModal(true);
    }
  };

  // Fechar modais
  const closeModals = () => {
    if (!ioSelectors.isAnyOperationActive) {
      setShowExportModal(false);
      setShowImportModal(false);
      setShowResultModal(false);
      setSelectedFile(null);
    }
  };

  // Resultado atual para exibição
  const currentResult = ioSelectors.lastResult;
  const isSuccess = currentResult?.success ?? false;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStrategyLabel = (strategy: ImportStrategy): string => {
    const labels = {
      merge: 'Mesclar (manter mais recente)',
      replace: 'Substituir existentes',
      'skip-existing': 'Ignorar existentes',
      'rename-conflicts': 'Renomear conflitos',
    };
    return labels[strategy];
  };

  return (
    <>
      <div className={`flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Database className="w-5 h-5" />
            Import / Export
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcutsHelp(true)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Atalhos de teclado"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Dados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={handleExportAll}
              disabled={!canExport}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="Ctrl+E"
            >
              <Database className="w-4 h-4" />
              Todos os Dados
            </button>

            <button
              onClick={() => handleExportMap()}
              disabled={!canExport || !activeMapId}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title={activeMap ? `Exportar: ${activeMap.name}` : 'Nenhum mapa ativo'}
            >
              <Map className="w-4 h-4" />
              {activeMap ? `Mapa Ativo` : 'Mapa Específico'}
            </button>

            <button
              onClick={() => handleExportLayers()}
              disabled={!canExport || !activeLayerId}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title={activeLayer ? `Exportar: ${activeLayer.name}` : 'Nenhuma camada ativa'}
            >
              <Layers className="w-4 h-4" />
              {activeLayer ? `Camada Ativa` : 'Camadas'}
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar Dados
          </h3>

          <button
            onClick={handleImportClick}
            disabled={!canImport}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ctrl+I"
          >
            <FileText className="w-4 h-4" />
            Selecionar Arquivo .ebgeo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".ebgeo"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Progress Bar */}
        {ioSelectors.isAnyOperationActive && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{ioSelectors.currentPhase || 'Processando...'}</span>
              <span>
                {ioSelectors.currentOperation === 'export'
                  ? Math.round(ioSelectors.exportProgress)
                  : Math.round(ioSelectors.importProgress)}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ioSelectors.currentOperation === 'export'
                      ? ioSelectors.exportProgress
                      : ioSelectors.importProgress
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Status Information */}
        {ioSelectors.hasRecentOperations && !ioSelectors.isAnyOperationActive && (
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <div>Última operação: {/* mostrar info da última operação */}</div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Opções de Exportação
              </h3>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tipo de exportação */}
              {exportType === 'map' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Mapa</label>
                  <select
                    value={selectedMapId}
                    onChange={e => setSelectedMapId(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    {activeMapId && <option value={activeMapId}>{activeMap?.name} (Ativo)</option>}
                    {maps
                      .filter(m => m.id !== activeMapId)
                      .map(map => (
                        <option key={map.id} value={map.id}>
                          {map.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {exportType === 'layers' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Camadas</label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2">
                    {layers.map(layer => (
                      <label key={layer.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedLayerIds.includes(layer.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedLayerIds(prev => [...prev, layer.id]);
                            } else {
                              setSelectedLayerIds(prev => prev.filter(id => id !== layer.id));
                            }
                          }}
                        />
                        {layer.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeAssets"
                  checked={exportOptions.includeAssets}
                  onChange={e =>
                    setExportOptions(prev => ({ ...prev, includeAssets: e.target.checked }))
                  }
                  className="rounded"
                />
                <label htmlFor="includeAssets" className="text-sm">
                  Incluir assets (imagens, arquivos)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="compression"
                  checked={exportOptions.compression}
                  onChange={e =>
                    setExportOptions(prev => ({ ...prev, compression: e.target.checked }))
                  }
                  className="rounded"
                />
                <label htmlFor="compression" className="text-sm">
                  Compressão do arquivo
                </label>
              </div>

              <div>
                <label htmlFor="filename" className="block text-sm font-medium mb-1">
                  Nome do arquivo (opcional)
                </label>
                <input
                  type="text"
                  id="filename"
                  value={exportOptions.filename}
                  onChange={e => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
                  placeholder="Deixe vazio para nome automático"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={closeModals}
                  disabled={ioSelectors.isAnyOperationActive}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeExport}
                  disabled={ioSelectors.isAnyOperationActive}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Opções de Importação
              </h3>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm font-medium">Arquivo selecionado:</div>
                <div className="text-sm text-gray-600">{selectedFile.name}</div>
                <div className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</div>
              </div>

              <div>
                <label htmlFor="strategy" className="block text-sm font-medium mb-1">
                  Estratégia para conflitos
                </label>
                <select
                  id="strategy"
                  value={importOptions.strategy}
                  onChange={e =>
                    setImportOptions(prev => ({
                      ...prev,
                      strategy: e.target.value as ImportStrategy,
                    }))
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="merge">Mesclar (manter mais recente)</option>
                  <option value="replace">Substituir existentes</option>
                  <option value="skip-existing">Ignorar existentes</option>
                  <option value="rename-conflicts">Renomear conflitos</option>
                </select>
                <div className="text-xs text-gray-600 mt-1">
                  {getStrategyLabel(importOptions.strategy)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeAssetsImport"
                  checked={importOptions.includeAssets}
                  onChange={e =>
                    setImportOptions(prev => ({ ...prev, includeAssets: e.target.checked }))
                  }
                  className="rounded"
                />
                <label htmlFor="includeAssetsImport" className="text-sm">
                  Incluir assets (imagens, arquivos)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="validateData"
                  checked={importOptions.validateData}
                  onChange={e =>
                    setImportOptions(prev => ({ ...prev, validateData: e.target.checked }))
                  }
                  className="rounded"
                />
                <label htmlFor="validateData" className="text-sm">
                  Validar dados antes da importação
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="backupBeforeImport"
                  checked={importOptions.backupBeforeImport}
                  onChange={e =>
                    setImportOptions(prev => ({ ...prev, backupBeforeImport: e.target.checked }))
                  }
                  className="rounded"
                />
                <label htmlFor="backupBeforeImport" className="text-sm">
                  Fazer backup antes da importação
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={closeModals}
                  disabled={ioSelectors.isAnyOperationActive}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeImport}
                  disabled={ioSelectors.isAnyOperationActive}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && currentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                {isSuccess ? 'Operação Concluída' : 'Erro na Operação'}
              </h3>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {isSuccess ? (
                <>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-green-800 font-medium">
                      Operação realizada com sucesso!
                    </div>
                  </div>

                  {'filename' in currentResult && (
                    <div>
                      <div className="text-sm font-medium">Arquivo:</div>
                      <div className="text-sm text-gray-600">{currentResult.filename}</div>
                      <div className="text-sm text-gray-600">
                        {formatFileSize(currentResult.size)}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium mb-2">Estatísticas:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        Features:{' '}
                        {currentResult.stats.features || currentResult.stats.featuresImported || 0}
                      </div>
                      <div>
                        Camadas:{' '}
                        {currentResult.stats.layers || currentResult.stats.layersImported || 0}
                      </div>
                      <div>
                        Mapas: {currentResult.stats.maps || currentResult.stats.mapsImported || 0}
                      </div>
                      <div>
                        Assets:{' '}
                        {currentResult.stats.assets || currentResult.stats.assetsImported || 0}
                      </div>
                    </div>
                  </div>

                  {'conflicts' in currentResult && currentResult.conflicts.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Conflitos ({currentResult.conflicts.length}):
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {currentResult.conflicts.map((conflict, index) => (
                          <div key={index} className="text-xs bg-yellow-50 p-2 rounded">
                            <div className="font-medium">{conflict.name || conflict.id}</div>
                            <div className="text-gray-600">{conflict.details}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="text-red-800 font-medium">Erro na operação</div>
                    <div className="text-red-700 text-sm mt-1">
                      {currentResult.error || 'Erro desconhecido'}
                    </div>
                  </div>

                  {'errors' in currentResult && currentResult.errors.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Detalhes dos erros:</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {currentResult.errors.map((error, index) => (
                          <div key={index} className="text-xs bg-red-50 p-2 rounded text-red-700">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Help Modal */}
      <IOShortcutsHelp visible={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
    </>
  );
}
