import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, Database, Map, Layers, AlertCircle, CheckCircle, X, Settings } from 'lucide-react';
import { exportService, ExportOptions, ExportResult } from '../services/export.service';
import { importService, ImportOptions, ImportResult, ImportStrategy } from '../services/import.service';
import { useMaps } from '../../data-access/hooks/useMaps';
import { useLayers } from '../../data-access/hooks/useLayers';

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
  // State
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastResult, setLastResult] = useState<ExportResult | ImportResult | null>(null);
  const [exportModalData, setExportModalData] = useState<ExportModalData>({ type: 'all' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Export options
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeAssets: true,
    includeAllMaps: true,
    compression: true,
  });

  // Import options
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    strategy: 'merge',
    includeAssets: true,
    validateData: true,
    backupBeforeImport: true,
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { data: maps = [] } = useMaps();
  const { data: layers = [] } = useLayers();

  // Handlers
  const handleExportAll = () => {
    setExportModalData({ type: 'all' });
    setActiveModal('export-options');
  };

  const handleExportMap = (mapId: string) => {
    setExportModalData({ type: 'map', mapId });
    setActiveModal('export-options');
  };

  const handleExportLayers = (layerIds: string[]) => {
    setExportModalData({ type: 'layers', layerIds });
    setActiveModal('export-options');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setActiveModal('import-options');
    }
  };

  const executeExport = async () => {
    setIsLoading(true);
    setProgress(0);
    
    try {
      let result: ExportResult;
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      if (exportModalData.type === 'all') {
        result = await exportService.exportAll(exportOptions);
      } else if (exportModalData.type === 'map' && exportModalData.mapId) {
        result = await exportService.exportMap(exportModalData.mapId, exportOptions);
      } else if (exportModalData.type === 'layers' && exportModalData.layerIds) {
        result = await exportService.exportLayers(exportModalData.layerIds, exportOptions);
      } else {
        throw new Error('Configuração de exportação inválida');
      }

      clearInterval(progressInterval);
      setProgress(100);
      
      setLastResult(result);
      setActiveModal('result');
      
    } catch (error) {
      console.error('Erro na exportação:', error);
      setLastResult({
        success: false,
        filename: '',
        size: 0,
        stats: { features: 0, layers: 0, maps: 0, assets: 0 },
        error: error instanceof Error ? error.message : 'Erro desconhecido na exportação',
      });
      setActiveModal('result');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const executeImport = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setProgress(0);
    
    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const result = await importService.importFile(selectedFile, importOptions);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setLastResult(result);
      setActiveModal('result');
      
    } catch (error) {
      console.error('Erro na importação:', error);
      setLastResult({
        success: false,
        stats: { featuresImported: 0, layersImported: 0, mapsImported: 0, assetsImported: 0, conflicts: 0, errors: 1 },
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Erro desconhecido na importação'],
      });
      setActiveModal('result');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const closeModal = () => {
    if (!isLoading) {
      setActiveModal(null);
      setLastResult(null);
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStrategyLabel = (strategy: ImportStrategy): string => {
    const labels = {
      'merge': 'Mesclar (manter mais recente)',
      'replace': 'Substituir existentes',
      'skip-existing': 'Ignorar existentes',
      'rename-conflicts': 'Renomear conflitos',
    };
    return labels[strategy];
  };

  return (
    <>
      <div className={`flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md ${className}`}>
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Database className="w-5 h-5" />
          Import / Export
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
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Database className="w-4 h-4" />
              Todos os Dados
            </button>
            
            <button
              onClick={() => setActiveModal('export')}
              disabled={isLoading || maps.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Map className="w-4 h-4" />
              Mapa Específico
            </button>
            
            <button
              onClick={() => setActiveModal('export')}
              disabled={isLoading || layers.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Layers className="w-4 h-4" />
              Camadas
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
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processando...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {activeModal === 'export' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Selecionar para Exportação</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {maps.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Mapas</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {maps.map(map => (
                      <button
                        key={map.id}
                        onClick={() => {
                          handleExportMap(map.id);
                          setActiveModal('export-options');
                        }}
                        className="w-full text-left p-2 rounded hover:bg-gray-100 border"
                      >
                        <div className="font-medium">{map.name}</div>
                        <div className="text-sm text-gray-600">
                          {map.layerIds.length} camadas
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {layers.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Camadas</h4>
                  <div className="text-sm text-gray-600 mb-2">
                    Selecione múltiplas camadas mantendo Ctrl pressionado
                  </div>
                  <select
                    multiple
                    className="w-full border rounded p-2 h-32"
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(option => option.value);
                      if (selected.length > 0) {
                        handleExportLayers(selected);
                        setActiveModal('export-options');
                      }
                    }}
                  >
                    {layers.map(layer => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {activeModal === 'export-options' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Opções de Exportação
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeAssets"
                  checked={exportOptions.includeAssets}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeAssets: e.target.checked }))}
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
                  onChange={(e) => setExportOptions(prev => ({ ...prev, compression: e.target.checked }))}
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
                  value={exportOptions.filename || ''}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
                  placeholder="Deixe vazio para nome automático"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    executeExport();
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Options Modal */}
      {activeModal === 'import-options' && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Opções de Importação
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
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
                  onChange={(e) => setImportOptions(prev => ({ ...prev, strategy: e.target.value as ImportStrategy }))}
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
                  onChange={(e) => setImportOptions(prev => ({ ...prev, includeAssets: e.target.checked }))}
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
                  onChange={(e) => setImportOptions(prev => ({ ...prev, validateData: e.target.checked }))}
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
                  onChange={(e) => setImportOptions(prev => ({ ...prev, backupBeforeImport: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="backupBeforeImport" className="text-sm">
                  Fazer backup antes da importação
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    executeImport();
                  }}
                  disabled={isLoading}
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
      {activeModal === 'result' && lastResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {lastResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                {lastResult.success ? 'Operação Concluída' : 'Erro na Operação'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {lastResult.success ? (
                <>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-green-800 font-medium">Operação realizada com sucesso!</div>
                  </div>

                  {'filename' in lastResult && (
                    <div>
                      <div className="text-sm font-medium">Arquivo:</div>
                      <div className="text-sm text-gray-600">{lastResult.filename}</div>
                      <div className="text-sm text-gray-600">{formatFileSize(lastResult.size)}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium mb-2">Estatísticas:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Features: {lastResult.stats.features || lastResult.stats.featuresImported || 0}</div>
                      <div>Camadas: {lastResult.stats.layers || lastResult.stats.layersImported || 0}</div>
                      <div>Mapas: {lastResult.stats.maps || lastResult.stats.mapsImported || 0}</div>
                      <div>Assets: {lastResult.stats.assets || lastResult.stats.assetsImported || 0}</div>
                    </div>
                  </div>

                  {'conflicts' in lastResult && lastResult.conflicts.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Conflitos ({lastResult.conflicts.length}):</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {lastResult.conflicts.map((conflict, index) => (
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
                      {lastResult.error || 'Erro desconhecido'}
                    </div>
                  </div>

                  {'errors' in lastResult && lastResult.errors.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Detalhes dos erros:</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {lastResult.errors.map((error, index) => (
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
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}