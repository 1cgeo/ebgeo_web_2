// Path: features/io/services/import.service.ts

import JSZip from 'jszip';
import { z } from 'zod';
import { db, AssetData } from '../../data-access/db';
import { 
  ExtendedFeature, 
  FeatureCollection, 
  validateFeature, 
  validateFeatureCollection 
} from '../../data-access/schemas/feature.schema';
import { LayerConfig, validateLayerConfig } from '../../data-access/schemas/layer.schema';
import { MapConfig, validateMapConfig } from '../../data-access/schemas/map.schema';
import { IO_CONFIG, APP_INFO } from '../../../constants/app.constants';
import { EBGeoManifest } from './export.service';

// Schema para validação do manifest
const ManifestSchema = z.object({
  version: z.string(),
  appInfo: z.object({
    name: z.string(),
    version: z.string(),
  }),
  exportDate: z.string().datetime(),
  layers: z.array(z.any()),
  maps: z.array(z.any()),
  featureCount: z.number().min(0),
  assetCount: z.number().min(0),
  checksum: z.string().optional(),
});

// Estratégias de importação
export type ImportStrategy = 'merge' | 'replace' | 'skip-existing' | 'rename-conflicts';

// Opções de importação
export interface ImportOptions {
  strategy: ImportStrategy;
  includeAssets: boolean;
  validateData: boolean;
  backupBeforeImport: boolean;
  selectedLayerIds?: string[];
  selectedMapIds?: string[];
}

// Resultado da importação
export interface ImportResult {
  success: boolean;
  stats: {
    featuresImported: number;
    layersImported: number;
    mapsImported: number;
    assetsImported: number;
    conflicts: number;
    errors: number;
  };
  conflicts: ImportConflict[];
  errors: string[];
  backupId?: string;
}

// Conflito durante importação
export interface ImportConflict {
  type: 'feature' | 'layer' | 'map' | 'asset';
  id: string;
  name?: string;
  action: 'skipped' | 'renamed' | 'replaced';
  details: string;
}

// Dados extraídos do arquivo
interface ExtractedData {
  manifest: EBGeoManifest;
  features: ExtendedFeature[];
  layers: LayerConfig[];
  maps: MapConfig[];
  assets: Map<string, Blob>;
}

/**
 * Service para importação de arquivos .ebgeo
 */
export class ImportService {
  
  /**
   * Importar arquivo .ebgeo
   */
  async importFile(file: File, options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      stats: {
        featuresImported: 0,
        layersImported: 0,
        mapsImported: 0,
        assetsImported: 0,
        conflicts: 0,
        errors: 0,
      },
      conflicts: [],
      errors: [],
    };

    try {
      console.log('Iniciando importação do arquivo:', file.name);

      // 1. Validar arquivo
      await this.validateFile(file);

      // 2. Fazer backup se solicitado
      if (options.backupBeforeImport) {
        result.backupId = await this.createBackup();
        console.log('Backup criado:', result.backupId);
      }

      // 3. Extrair e validar dados
      const data = await this.extractAndValidateData(file, options);

      // 4. Filtrar dados baseado nas seleções
      const filteredData = this.filterSelectedData(data, options);

      // 5. Processar importação
      const importResults = await this.processImport(filteredData, options);
      
      // 6. Consolidar resultados
      result.success = true;
      result.stats = importResults.stats;
      result.conflicts = importResults.conflicts;
      result.errors = importResults.errors;

      console.log('Importação concluída com sucesso:', result.stats);

    } catch (error) {
      console.error('Erro na importação:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Erro desconhecido');
      result.stats.errors++;

      // Reverter backup se houve erro e backup foi criado
      if (result.backupId && options.backupBeforeImport) {
        try {
          await this.restoreBackup(result.backupId);
          console.log('Backup restaurado devido ao erro');
        } catch (backupError) {
          console.error('Erro ao restaurar backup:', backupError);
          result.errors.push('Erro crítico: falha ao restaurar backup');
        }
      }
    }

    return result;
  }

  /**
   * Validar arquivo antes da importação
   */
  private async validateFile(file: File): Promise<void> {
    // Validar extensão
    if (!file.name.toLowerCase().endsWith('.ebgeo')) {
      throw new Error('Arquivo deve ter extensão .ebgeo');
    }

    // Validar tamanho
    if (file.size > IO_CONFIG.maxFileSize) {
      throw new Error(`Arquivo muito grande. Máximo: ${this.formatFileSize(IO_CONFIG.maxFileSize)}`);
    }

    // Validar se é um ZIP válido
    try {
      const zip = new JSZip();
      await zip.loadAsync(file);
    } catch (error) {
      throw new Error('Arquivo .ebgeo corrompido ou inválido');
    }
  }

  /**
   * Extrair e validar dados do arquivo
   */
  private async extractAndValidateData(file: File, options: ImportOptions): Promise<ExtractedData> {
    console.log('Extraindo dados do arquivo...');

    const zip = new JSZip();
    await zip.loadAsync(file);

    // Verificar estrutura obrigatória
    const requiredFiles = ['manifest.json', 'features.json'];
    for (const fileName of requiredFiles) {
      if (!zip.files[fileName]) {
        throw new Error(`Arquivo obrigatório não encontrado: ${fileName}`);
      }
    }

    // Extrair manifest.json
    const manifestContent = await zip.files['manifest.json'].async('string');
    const manifestData = JSON.parse(manifestContent);
    
    // Validar manifest
    const manifest = ManifestSchema.parse(manifestData);

    // Extrair features.json
    const featuresContent = await zip.files['features.json'].async('string');
    const featuresData = JSON.parse(featuresContent);
    
    // Validar features
    let featureCollection: FeatureCollection;
    if (options.validateData) {
      featureCollection = validateFeatureCollection(featuresData);
    } else {
      featureCollection = featuresData;
    }

    // Validar features individuais
    const features: ExtendedFeature[] = [];
    for (const feature of featureCollection.features) {
      try {
        if (options.validateData) {
          const validatedFeature = validateFeature(feature);
          features.push(validatedFeature);
        } else {
          features.push(feature as ExtendedFeature);
        }
      } catch (error) {
        console.warn(`Feature inválida ignorada: ${feature.id}`, error);
      }
    }

    // Validar layers do manifest
    const layers: LayerConfig[] = [];
    for (const layer of manifest.layers) {
      try {
        if (options.validateData) {
          const validatedLayer = validateLayerConfig(layer);
          layers.push(validatedLayer);
        } else {
          layers.push(layer as LayerConfig);
        }
      } catch (error) {
        console.warn(`Layer inválida ignorada: ${layer.id}`, error);
      }
    }

    // Validar maps do manifest
    const maps: MapConfig[] = [];
    for (const map of manifest.maps) {
      try {
        if (options.validateData) {
          const validatedMap = validateMapConfig(map);
          maps.push(validatedMap);
        } else {
          maps.push(map as MapConfig);
        }
      } catch (error) {
        console.warn(`Map inválido ignorado: ${map.id}`, error);
      }
    }

    // Extrair assets se incluídos
    const assets = new Map<string, Blob>();
    if (options.includeAssets && zip.files['assets/']) {
      console.log('Extraindo assets...');
      
      for (const fileName of Object.keys(zip.files)) {
        if (fileName.startsWith('assets/') && !fileName.endsWith('/')) {
          const assetFile = zip.files[fileName];
          const assetData = await assetFile.async('blob');
          const assetId = fileName.replace('assets/', '').split('.')[0];
          assets.set(assetId, assetData);
        }
      }
    }

    console.log(`Dados extraídos: ${features.length} features, ${layers.length} layers, ${maps.length} maps, ${assets.size} assets`);

    return {
      manifest: manifest as EBGeoManifest,
      features,
      layers,
      maps,
      assets,
    };
  }

  /**
   * Filtrar dados baseado nas seleções do usuário
   */
  private filterSelectedData(data: ExtractedData, options: ImportOptions): ExtractedData {
    let { features, layers, maps, assets } = data;

    // Filtrar layers selecionadas
    if (options.selectedLayerIds && options.selectedLayerIds.length > 0) {
      layers = layers.filter(layer => options.selectedLayerIds!.includes(layer.id));
      
      // Filtrar features das layers selecionadas
      const selectedLayerIds = new Set(layers.map(l => l.id));
      features = features.filter(feature => selectedLayerIds.has(feature.properties.layerId));
    }

    // Filtrar maps selecionados
    if (options.selectedMapIds && options.selectedMapIds.length > 0) {
      maps = maps.filter(map => options.selectedMapIds!.includes(map.id));
    }

    return {
      manifest: data.manifest,
      features,
      layers,
      maps,
      assets,
    };
  }

  /**
   * Processar importação dos dados
   */
  private async processImport(data: ExtractedData, options: ImportOptions): Promise<{
    stats: ImportResult['stats'];
    conflicts: ImportConflict[];
    errors: string[];
  }> {
    const stats: ImportResult['stats'] = {
      featuresImported: 0,
      layersImported: 0,
      mapsImported: 0,
      assetsImported: 0,
      conflicts: 0,
      errors: 0,
    };
    const conflicts: ImportConflict[] = [];
    const errors: string[] = [];

    try {
      await db.transaction('rw', [db.features, db.layers, db.maps, db.assets], async () => {
        
        // 1. Importar assets primeiro
        if (options.includeAssets) {
          const assetResults = await this.importAssets(data.assets, options);
          stats.assetsImported = assetResults.imported;
          conflicts.push(...assetResults.conflicts);
          errors.push(...assetResults.errors);
        }

        // 2. Importar layers
        const layerResults = await this.importLayers(data.layers, options);
        stats.layersImported = layerResults.imported;
        conflicts.push(...layerResults.conflicts);
        errors.push(...layerResults.errors);

        // 3. Importar features
        const featureResults = await this.importFeatures(data.features, options);
        stats.featuresImported = featureResults.imported;
        conflicts.push(...featureResults.conflicts);
        errors.push(...featureResults.errors);

        // 4. Importar maps
        const mapResults = await this.importMaps(data.maps, options);
        stats.mapsImported = mapResults.imported;
        conflicts.push(...mapResults.conflicts);
        errors.push(...mapResults.errors);

        stats.conflicts = conflicts.length;
        stats.errors = errors.length;

      });

    } catch (error) {
      console.error('Erro na transação de importação:', error);
      errors.push(`Erro na transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      stats.errors++;
    }

    return { stats, conflicts, errors };
  }

  /**
   * Importar assets
   */
  private async importAssets(assets: Map<string, Blob>, options: ImportOptions): Promise<{
    imported: number;
    conflicts: ImportConflict[];
    errors: string[];
  }> {
    const conflicts: ImportConflict[] = [];
    const errors: string[] = [];
    let imported = 0;

    for (const [assetId, blob] of assets) {
      try {
        const existing = await db.assets.get(assetId);
        
        if (existing) {
          const conflict = await this.handleAssetConflict(assetId, blob, existing, options.strategy);
          if (conflict) {
            conflicts.push(conflict);
            if (conflict.action === 'skipped') {
              continue;
            }
          }
        }

        // Criar asset data
        const assetData: AssetData = {
          id: assetId,
          name: `imported-${assetId}`,
          type: blob.type || 'application/octet-stream',
          data: blob,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.assets.put(assetData);
        imported++;

      } catch (error) {
        console.error(`Erro ao importar asset ${assetId}:`, error);
        errors.push(`Asset ${assetId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    return { imported, conflicts, errors };
  }

  /**
   * Importar layers
   */
  private async importLayers(layers: LayerConfig[], options: ImportOptions): Promise<{
    imported: number;
    conflicts: ImportConflict[];
    errors: string[];
  }> {
    const conflicts: ImportConflict[] = [];
    const errors: string[] = [];
    let imported = 0;

    for (const layer of layers) {
      try {
        const existing = await db.layers.get(layer.id);
        
        if (existing) {
          const conflict = await this.handleLayerConflict(layer, existing, options.strategy);
          if (conflict) {
            conflicts.push(conflict);
            if (conflict.action === 'skipped') {
              continue;
            }
          }
        }

        // Ajustar timestamps
        const layerToImport = {
          ...layer,
          updatedAt: new Date().toISOString(),
        };

        await db.layers.put(layerToImport);
        imported++;

      } catch (error) {
        console.error(`Erro ao importar layer ${layer.id}:`, error);
        errors.push(`Layer ${layer.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    return { imported, conflicts, errors };
  }

  /**
   * Importar features
   */
  private async importFeatures(features: ExtendedFeature[], options: ImportOptions): Promise<{
    imported: number;
    conflicts: ImportConflict[];
    errors: string[];
  }> {
    const conflicts: ImportConflict[] = [];
    const errors: string[] = [];
    let imported = 0;

    for (const feature of features) {
      try {
        const existing = await db.features.get(feature.id);
        
        if (existing) {
          const conflict = await this.handleFeatureConflict(feature, existing, options.strategy);
          if (conflict) {
            conflicts.push(conflict);
            if (conflict.action === 'skipped') {
              continue;
            }
          }
        }

        // Ajustar timestamps
        const featureToImport = {
          ...feature,
          properties: {
            ...feature.properties,
            updatedAt: new Date().toISOString(),
          },
        };

        await db.features.put(featureToImport);
        imported++;

      } catch (error) {
        console.error(`Erro ao importar feature ${feature.id}:`, error);
        errors.push(`Feature ${feature.properties.name || feature.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    return { imported, conflicts, errors };
  }

  /**
   * Importar maps
   */
  private async importMaps(maps: MapConfig[], options: ImportOptions): Promise<{
    imported: number;
    conflicts: ImportConflict[];
    errors: string[];
  }> {
    const conflicts: ImportConflict[] = [];
    const errors: string[] = [];
    let imported = 0;

    for (const map of maps) {
      try {
        const existing = await db.maps.get(map.id);
        
        if (existing) {
          const conflict = await this.handleMapConflict(map, existing, options.strategy);
          if (conflict) {
            conflicts.push(conflict);
            if (conflict.action === 'skipped') {
              continue;
            }
          }
        }

        // Ajustar timestamps
        const mapToImport = {
          ...map,
          updatedAt: new Date().toISOString(),
        };

        await db.maps.put(mapToImport);
        imported++;

      } catch (error) {
        console.error(`Erro ao importar map ${map.id}:`, error);
        errors.push(`Map ${map.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    return { imported, conflicts, errors };
  }

  /**
   * Tratar conflitos de assets
   */
  private async handleAssetConflict(
    assetId: string,
    newBlob: Blob,
    existing: AssetData,
    strategy: ImportStrategy
  ): Promise<ImportConflict | null> {
    switch (strategy) {
      case 'skip-existing':
        return {
          type: 'asset',
          id: assetId,
          name: existing.name,
          action: 'skipped',
          details: 'Asset já existe e foi ignorado',
        };

      case 'replace':
        return {
          type: 'asset',
          id: assetId,
          name: existing.name,
          action: 'replaced',
          details: 'Asset existente foi substituído',
        };

      case 'merge':
      case 'rename-conflicts':
        // Para assets, merge e rename têm o mesmo comportamento (substituir)
        return {
          type: 'asset',
          id: assetId,
          name: existing.name,
          action: 'replaced',
          details: 'Asset foi atualizado',
        };

      default:
        return null;
    }
  }

  /**
   * Tratar conflitos de layers
   */
  private async handleLayerConflict(
    newLayer: LayerConfig,
    existing: LayerConfig,
    strategy: ImportStrategy
  ): Promise<ImportConflict | null> {
    switch (strategy) {
      case 'skip-existing':
        return {
          type: 'layer',
          id: newLayer.id,
          name: newLayer.name,
          action: 'skipped',
          details: 'Layer já existe e foi ignorado',
        };

      case 'replace':
        return {
          type: 'layer',
          id: newLayer.id,
          name: newLayer.name,
          action: 'replaced',
          details: 'Layer existente foi substituído',
        };

      case 'merge':
        // Para layers, merge significa manter configurações mais recentes
        if (new Date(newLayer.updatedAt) > new Date(existing.updatedAt)) {
          return {
            type: 'layer',
            id: newLayer.id,
            name: newLayer.name,
            action: 'replaced',
            details: 'Layer foi atualizado (mais recente)',
          };
        } else {
          return {
            type: 'layer',
            id: newLayer.id,
            name: newLayer.name,
            action: 'skipped',
            details: 'Layer existente é mais recente',
          };
        }

      case 'rename-conflicts':
        // Gerar novo ID para evitar conflito
        const newId = crypto.randomUUID();
        newLayer.id = newId;
        newLayer.name = `${newLayer.name} (importado)`;
        return {
          type: 'layer',
          id: newId,
          name: newLayer.name,
          action: 'renamed',
          details: `Layer renomeado para evitar conflito`,
        };

      default:
        return null;
    }
  }

  /**
   * Tratar conflitos de features
   */
  private async handleFeatureConflict(
    newFeature: ExtendedFeature,
    existing: ExtendedFeature,
    strategy: ImportStrategy
  ): Promise<ImportConflict | null> {
    switch (strategy) {
      case 'skip-existing':
        return {
          type: 'feature',
          id: newFeature.id,
          name: newFeature.properties.name,
          action: 'skipped',
          details: 'Feature já existe e foi ignorada',
        };

      case 'replace':
        return {
          type: 'feature',
          id: newFeature.id,
          name: newFeature.properties.name,
          action: 'replaced',
          details: 'Feature existente foi substituída',
        };

      case 'merge':
        if (new Date(newFeature.properties.updatedAt) > new Date(existing.properties.updatedAt)) {
          return {
            type: 'feature',
            id: newFeature.id,
            name: newFeature.properties.name,
            action: 'replaced',
            details: 'Feature foi atualizada (mais recente)',
          };
        } else {
          return {
            type: 'feature',
            id: newFeature.id,
            name: newFeature.properties.name,
            action: 'skipped',
            details: 'Feature existente é mais recente',
          };
        }

      case 'rename-conflicts':
        const newId = crypto.randomUUID();
        newFeature.id = newId;
        newFeature.properties.id = newId;
        newFeature.properties.name = `${newFeature.properties.name || 'Feature'} (importado)`;
        return {
          type: 'feature',
          id: newId,
          name: newFeature.properties.name,
          action: 'renamed',
          details: 'Feature renomeada para evitar conflito',
        };

      default:
        return null;
    }
  }

  /**
   * Tratar conflitos de maps
   */
  private async handleMapConflict(
    newMap: MapConfig,
    existing: MapConfig,
    strategy: ImportStrategy
  ): Promise<ImportConflict | null> {
    switch (strategy) {
      case 'skip-existing':
        return {
          type: 'map',
          id: newMap.id,
          name: newMap.name,
          action: 'skipped',
          details: 'Map já existe e foi ignorado',
        };

      case 'replace':
        return {
          type: 'map',
          id: newMap.id,
          name: newMap.name,
          action: 'replaced',
          details: 'Map existente foi substituído',
        };

      case 'merge':
        if (new Date(newMap.updatedAt) > new Date(existing.updatedAt)) {
          return {
            type: 'map',
            id: newMap.id,
            name: newMap.name,
            action: 'replaced',
            details: 'Map foi atualizado (mais recente)',
          };
        } else {
          return {
            type: 'map',
            id: newMap.id,
            name: newMap.name,
            action: 'skipped',
            details: 'Map existente é mais recente',
          };
        }

      case 'rename-conflicts':
        const newId = crypto.randomUUID();
        newMap.id = newId;
        newMap.name = `${newMap.name} (importado)`;
        return {
          type: 'map',
          id: newId,
          name: newMap.name,
          action: 'renamed',
          details: 'Map renomeado para evitar conflito',
        };

      default:
        return null;
    }
  }

  /**
   * Criar backup antes da importação
   */
  private async createBackup(): Promise<string> {
    const backupId = `backup-${Date.now()}`;
    const backupData = {
      features: await db.features.toArray(),
      layers: await db.layers.toArray(),
      maps: await db.maps.toArray(),
      assets: await db.assets.toArray(),
    };

    // Salvar backup no localStorage (temporário)
    localStorage.setItem(backupId, JSON.stringify(backupData));
    
    return backupId;
  }

  /**
   * Restaurar backup
   */
  private async restoreBackup(backupId: string): Promise<void> {
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

    // Remover backup do localStorage
    localStorage.removeItem(backupId);
  }

  /**
   * Utilitários
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validar integridade após importação
   */
  async validateAfterImport(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Verificar referências órfãs
      const features = await db.features.toArray();
      const layers = await db.layers.toArray();
      const layerIds = new Set(layers.map(l => l.id));

      const orphanedFeatures = features.filter(f => !layerIds.has(f.properties.layerId));
      if (orphanedFeatures.length > 0) {
        issues.push(`${orphanedFeatures.length} feature(s) órfã(s) após importação`);
      }

      // Verificar maps com camadas inexistentes
      const maps = await db.maps.toArray();
      for (const map of maps) {
        const invalidLayerIds = map.layerIds.filter(id => !layerIds.has(id));
        if (invalidLayerIds.length > 0) {
          issues.push(`Map "${map.name}" tem ${invalidLayerIds.length} referência(s) inválida(s)`);
        }
      }

      return {
        valid: issues.length === 0,
        issues,
      };

    } catch (error) {
      return {
        valid: false,
        issues: [`Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
      };
    }
  }
}

// Instância singleton
export const importService = new ImportService();