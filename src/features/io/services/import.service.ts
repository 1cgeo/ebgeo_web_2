// Path: features\io\services\import.service.ts
import JSZip from 'jszip';
import { z } from 'zod';
import { db, AssetData } from '../../data-access/db';
import {
  ExtendedFeature,
  FeatureCollection,
  validateFeature,
  validateFeatureCollection,
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
      // 1. Validar arquivo
      await this.validateFile(file);

      // 2. Extrair e validar dados
      const data = await this.extractAndValidateData(file, options);

      // 3. Filtrar dados baseado nas seleções
      const filteredData = this.filterSelectedData(data, options);

      // 4. Processar importação
      const importResults = await this.processImport(filteredData, options);

      // 5. Consolidar resultados
      result.success = true;
      result.stats = importResults.stats;
      result.conflicts = importResults.conflicts;
      result.errors = importResults.errors;
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Erro desconhecido');
      result.stats.errors++;
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
      throw new Error(
        `Arquivo muito grande. Máximo permitido: ${this.formatFileSize(IO_CONFIG.maxFileSize)}`
      );
    }

    if (file.size === 0) {
      throw new Error('Arquivo está vazio');
    }
  }

  /**
   * Extrair e validar dados do arquivo ZIP
   */
  private async extractAndValidateData(file: File, options: ImportOptions): Promise<ExtractedData> {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);

    // Extrair manifest.json
    const manifestFile = zipData.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Arquivo manifest.json não encontrado');
    }

    const manifestContent = await manifestFile.async('text');
    const manifest = ManifestSchema.parse(JSON.parse(manifestContent));

    // Extrair features.json
    const featuresFile = zipData.file('features.json');
    if (!featuresFile) {
      throw new Error('Arquivo features.json não encontrado');
    }

    const featuresContent = await featuresFile.async('text');
    const featureCollection = validateFeatureCollection(JSON.parse(featuresContent));

    // Validar features individualmente se solicitado
    const features: ExtendedFeature[] = [];
    if (options.validateData) {
      for (const feature of featureCollection.features) {
        try {
          const validatedFeature = validateFeature(feature);
          features.push(validatedFeature);
        } catch (error) {
          throw new Error(
            `Feature inválida: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          );
        }
      }
    } else {
      features.push(...featureCollection.features);
    }

    // Extrair assets se incluídos
    const assets = new Map<string, Blob>();
    if (options.includeAssets) {
      const assetsFolder = zipData.folder('assets');
      if (assetsFolder) {
        for (const [relativePath, file] of Object.entries(assetsFolder.files)) {
          if (!file.dir) {
            const blob = await file.async('blob');
            assets.set(relativePath, blob);
          }
        }
      }
    }

    return {
      manifest,
      features,
      layers: manifest.layers,
      maps: manifest.maps,
      assets,
    };
  }

  /**
   * Filtrar dados baseado nas seleções do usuário
   */
  private filterSelectedData(data: ExtractedData, options: ImportOptions): ExtractedData {
    let filteredLayers = data.layers;
    let filteredMaps = data.maps;
    let filteredFeatures = data.features;

    // Filtrar camadas se especificado
    if (options.selectedLayerIds && options.selectedLayerIds.length > 0) {
      filteredLayers = data.layers.filter(layer => options.selectedLayerIds!.includes(layer.id));

      // Filtrar features das camadas selecionadas
      const selectedLayerIds = new Set(filteredLayers.map(l => l.id));
      filteredFeatures = data.features.filter(feature =>
        selectedLayerIds.has(feature.properties.layerId)
      );
    }

    // Filtrar mapas se especificado
    if (options.selectedMapIds && options.selectedMapIds.length > 0) {
      filteredMaps = data.maps.filter(map => options.selectedMapIds!.includes(map.id));
    }

    return {
      ...data,
      layers: filteredLayers,
      maps: filteredMaps,
      features: filteredFeatures,
    };
  }

  /**
   * Processar importação com estratégia selecionada
   */
  private async processImport(
    data: ExtractedData,
    options: ImportOptions
  ): Promise<{
    stats: ImportResult['stats'];
    conflicts: ImportConflict[];
    errors: string[];
  }> {
    const stats = {
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
        // Importar camadas
        for (const layer of data.layers) {
          try {
            const existingLayer = await db.layers.get(layer.id);

            if (existingLayer) {
              switch (options.strategy) {
                case 'skip-existing':
                  conflicts.push({
                    type: 'layer',
                    id: layer.id,
                    name: layer.name,
                    action: 'skipped',
                    details: 'Camada já existe',
                  });
                  continue;

                case 'replace':
                  await db.layers.update(layer.id, layer);
                  stats.layersImported++;
                  break;

                case 'rename-conflicts':
                  const newLayer = {
                    ...layer,
                    id: `${layer.id}_imported_${Date.now()}`,
                    name: `${layer.name} (Importado)`,
                  };
                  await db.layers.add(newLayer);
                  conflicts.push({
                    type: 'layer',
                    id: layer.id,
                    name: layer.name,
                    action: 'renamed',
                    details: `Renomeado para: ${newLayer.name}`,
                  });
                  stats.layersImported++;
                  break;

                default:
                  await db.layers.update(layer.id, layer);
                  stats.layersImported++;
              }
            } else {
              await db.layers.add(layer);
              stats.layersImported++;
            }
          } catch (error) {
            errors.push(
              `Erro ao importar camada ${layer.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            );
            stats.errors++;
          }
        }

        // Importar features
        for (const feature of data.features) {
          try {
            const existingFeature = await db.features.get(feature.id);

            if (existingFeature) {
              switch (options.strategy) {
                case 'skip-existing':
                  conflicts.push({
                    type: 'feature',
                    id: feature.id,
                    action: 'skipped',
                    details: 'Feature já existe',
                  });
                  continue;

                case 'replace':
                  await db.features.update(feature.id, feature);
                  stats.featuresImported++;
                  break;

                case 'rename-conflicts':
                  const newFeature = {
                    ...feature,
                    id: `${feature.id}_imported_${Date.now()}`,
                  };
                  await db.features.add(newFeature);
                  conflicts.push({
                    type: 'feature',
                    id: feature.id,
                    action: 'renamed',
                    details: `Renomeado ID para: ${newFeature.id}`,
                  });
                  stats.featuresImported++;
                  break;

                default:
                  await db.features.update(feature.id, feature);
                  stats.featuresImported++;
              }
            } else {
              await db.features.add(feature);
              stats.featuresImported++;
            }
          } catch (error) {
            errors.push(
              `Erro ao importar feature ${feature.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            );
            stats.errors++;
          }
        }

        // Importar mapas
        for (const map of data.maps) {
          try {
            const existingMap = await db.maps.get(map.id);

            if (existingMap) {
              switch (options.strategy) {
                case 'skip-existing':
                  conflicts.push({
                    type: 'map',
                    id: map.id,
                    name: map.name,
                    action: 'skipped',
                    details: 'Mapa já existe',
                  });
                  continue;

                case 'replace':
                  await db.maps.update(map.id, map);
                  stats.mapsImported++;
                  break;

                case 'rename-conflicts':
                  const newMap = {
                    ...map,
                    id: `${map.id}_imported_${Date.now()}`,
                    name: `${map.name} (Importado)`,
                  };
                  await db.maps.add(newMap);
                  conflicts.push({
                    type: 'map',
                    id: map.id,
                    name: map.name,
                    action: 'renamed',
                    details: `Renomeado para: ${newMap.name}`,
                  });
                  stats.mapsImported++;
                  break;

                default:
                  await db.maps.update(map.id, map);
                  stats.mapsImported++;
              }
            } else {
              await db.maps.add(map);
              stats.mapsImported++;
            }
          } catch (error) {
            errors.push(
              `Erro ao importar mapa ${map.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            );
            stats.errors++;
          }
        }

        // Importar assets se incluídos
        if (options.includeAssets) {
          for (const [path, blob] of data.assets) {
            try {
              const assetData: AssetData = {
                id: crypto.randomUUID(),
                name: path.split('/').pop() || path,
                type: blob.type,
                size: blob.size,
                data: blob,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              await db.assets.add(assetData);
              stats.assetsImported++;
            } catch (error) {
              errors.push(
                `Erro ao importar asset ${path}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
              );
              stats.errors++;
            }
          }
        }
      });

      stats.conflicts = conflicts.length;
    } catch (error) {
      errors.push(
        `Erro na transação de importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
      stats.errors++;
    }

    return { stats, conflicts, errors };
  }

  /**
   * Validar integridade após importação
   */
  async validateAfterImport(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Verificar se todas as features têm camadas válidas
      const features = await db.features.toArray();
      const layers = await db.layers.toArray();
      const layerIds = new Set(layers.map(l => l.id));

      const orphanFeatures = features.filter(f => !layerIds.has(f.properties.layerId));
      if (orphanFeatures.length > 0) {
        issues.push(`${orphanFeatures.length} features sem camada válida encontradas`);
      }

      // Verificar limite de features
      if (features.length > IO_CONFIG.maxFeaturesPerFile) {
        issues.push(
          `Muitas features (${features.length}). Máximo: ${IO_CONFIG.maxFeaturesPerFile}`
        );
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    } catch (error) {
      return {
        valid: false,
        issues: [
          `Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        ],
      };
    }
  }

  /**
   * Formatar tamanho de arquivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Instância singleton
export const importService = new ImportService();
