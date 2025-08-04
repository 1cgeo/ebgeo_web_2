// Path: features\io\services\export.service.ts
import JSZip from 'jszip';
import { db } from '../../data-access/db';
import { ExtendedFeature, FeatureCollection } from '../../data-access/schemas/feature.schema';
import { LayerConfig } from '../../data-access/schemas/layer.schema';
import { MapConfig } from '../../data-access/schemas/map.schema';
import { AssetData } from '../../data-access/db';
import { IO_CONFIG, APP_INFO } from '../../../constants/app.constants';

// Interface para o manifest.json
export interface EBGeoManifest {
  version: string;
  appInfo: typeof APP_INFO;
  exportDate: string;
  layers: LayerConfig[];
  maps: MapConfig[];
  featureCount: number;
  assetCount: number;
}

// Interface para resultado da exportação
export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  stats: {
    features: number;
    layers: number;
    maps: number;
    assets: number;
  };
  error?: string;
}

// Interface para opções de exportação
export interface ExportOptions {
  includeAssets?: boolean;
  includeAllMaps?: boolean;
  selectedMapIds?: string[];
  selectedLayerIds?: string[];
  compression?: boolean;
  filename?: string;
}

// Interface para dados coletados
interface CollectedData {
  features: ExtendedFeature[];
  layers: LayerConfig[];
  maps: MapConfig[];
  assets: AssetData[];
}

/**
 * Service para exportação de dados para formato .ebgeo
 */
export class ExportService {
  private zip: JSZip;

  constructor() {
    this.zip = new JSZip();
  }

  /**
   * Exportar dados completos para arquivo .ebgeo
   */
  async exportAll(options: ExportOptions = {}): Promise<ExportResult> {
    try {
      // Configurações padrão
      const config = {
        includeAssets: true,
        includeAllMaps: true,
        compression: true,
        filename: `ebgeo-export-${new Date().toISOString().split('T')[0]}.ebgeo`,
        ...options,
      };

      // Limpar ZIP anterior
      this.zip = new JSZip();

      // 1. Coletar dados do IndexedDB
      const data = await this.collectData(config);

      // 2. Gerar manifest.json
      const manifest = this.generateManifest(data);
      this.zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // 3. Gerar features.json
      const featureCollection = this.generateFeatureCollection(data.features);
      this.zip.file('features.json', JSON.stringify(featureCollection, null, 2));

      // 4. Processar assets (se incluídos)
      if (config.includeAssets && data.assets.length > 0) {
        await this.processAssets(data.assets);
      }

      // 5. Gerar arquivo compactado
      const blob = await this.generateZipFile(config.compression);

      // 6. Fazer download
      await this.downloadFile(blob, config.filename);

      // 7. Retornar resultado
      return {
        success: true,
        filename: config.filename,
        size: blob.size,
        stats: {
          features: data.features.length,
          layers: data.layers.length,
          maps: data.maps.length,
          assets: data.assets.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        stats: { features: 0, layers: 0, maps: 0, assets: 0 },
        error: error instanceof Error ? error.message : 'Erro desconhecido na exportação',
      };
    }
  }

  /**
   * Exportar mapas específicos
   */
  async exportMaps(
    mapIds: string[],
    options: Omit<ExportOptions, 'selectedMapIds'> = {}
  ): Promise<ExportResult> {
    return this.exportAll({
      ...options,
      selectedMapIds: mapIds,
      includeAllMaps: false,
    });
  }

  /**
   * Exportar camadas específicas
   */
  async exportLayers(
    layerIds: string[],
    options: Omit<ExportOptions, 'selectedLayerIds'> = {}
  ): Promise<ExportResult> {
    return this.exportAll({
      ...options,
      selectedLayerIds: layerIds,
    });
  }

  /**
   * Coletar dados do IndexedDB baseado nas opções
   */
  private async collectData(options: Required<ExportOptions>): Promise<CollectedData> {
    let layers: LayerConfig[];
    let maps: MapConfig[];
    let features: ExtendedFeature[];
    let assets: AssetData[] = [];

    // Coletar camadas
    if (options.selectedLayerIds && options.selectedLayerIds.length > 0) {
      layers = [];
      for (const layerId of options.selectedLayerIds) {
        const layer = await db.layers.get(layerId);
        if (layer) layers.push(layer);
      }
    } else {
      layers = await db.layers.toArray();
    }

    // Coletar mapas
    if (options.includeAllMaps) {
      maps = await db.maps.toArray();
    } else if (options.selectedMapIds && options.selectedMapIds.length > 0) {
      maps = [];
      for (const mapId of options.selectedMapIds) {
        const map = await db.maps.get(mapId);
        if (map) maps.push(map);
      }
    } else {
      maps = [];
    }

    // Coletar features das camadas selecionadas
    const layerIds = new Set(layers.map(l => l.id));
    if (layerIds.size > 0) {
      features = await db.features
        .where('properties.layerId')
        .anyOf([...layerIds])
        .toArray();
    } else {
      features = await db.features.toArray();
    }

    // Coletar assets se solicitado
    if (options.includeAssets) {
      // Coletar apenas assets referenciados pelas features
      const assetPaths = new Set<string>();

      features.forEach(feature => {
        // Verificar propriedades que podem conter referências de assets
        if (feature.properties.image) {
          assetPaths.add(feature.properties.image);
        }
        if (feature.properties.icon) {
          assetPaths.add(feature.properties.icon);
        }
        // Adicionar outras propriedades que podem referenciar assets
      });

      if (assetPaths.size > 0) {
        assets = await db.assets.toArray();
        // Filtrar apenas assets referenciados
        assets = assets.filter(
          asset => assetPaths.has(`assets/${asset.name}`) || assetPaths.has(asset.name)
        );
      }
    }

    return { features, layers, maps, assets };
  }

  /**
   * Gerar manifest.json
   */
  private generateManifest(data: CollectedData): EBGeoManifest {
    return {
      version: '1.0',
      appInfo: APP_INFO,
      exportDate: new Date().toISOString(),
      layers: data.layers,
      maps: data.maps,
      featureCount: data.features.length,
      assetCount: data.assets.length,
    };
  }

  /**
   * Gerar FeatureCollection para features.json
   */
  private generateFeatureCollection(features: ExtendedFeature[]): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * Processar e adicionar assets ao ZIP
   */
  private async processAssets(assets: AssetData[]): Promise<void> {
    const assetsFolder = this.zip.folder('assets');
    if (!assetsFolder) return;

    for (const asset of assets) {
      try {
        // Adicionar asset ao ZIP
        assetsFolder.file(asset.name, asset.data);
      } catch (error) {
        console.warn(`Erro ao processar asset ${asset.name}:`, error);
      }
    }
  }

  /**
   * Gerar arquivo ZIP
   */
  private async generateZipFile(compression: boolean = true): Promise<Blob> {
    const options: JSZip.JSZipGeneratorOptions = {
      type: 'blob',
      compression: compression ? 'DEFLATE' : 'STORE',
      compressionOptions: {
        level: compression ? 6 : 0,
      },
    };

    return this.zip.generateAsync(options);
  }

  /**
   * Fazer download do arquivo
   */
  private async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar URL object
    URL.revokeObjectURL(url);
  }

  /**
   * Validar operação de exportação antes de executar
   */
  async validateExportOperation(options: ExportOptions = {}): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Verificar se há dados para exportar
      const layerCount = await db.layers.count();
      const featureCount = await db.features.count();

      if (layerCount === 0) {
        issues.push('Nenhuma camada encontrada para exportar');
      }

      if (featureCount === 0) {
        issues.push('Nenhuma feature encontrada para exportar');
      }

      // Verificar limites
      if (featureCount > IO_CONFIG.maxFeaturesPerFile) {
        issues.push(`Muitas features (${featureCount}). Máximo: ${IO_CONFIG.maxFeaturesPerFile}`);
      }

      // Verificar seleções específicas
      if (options.selectedLayerIds && options.selectedLayerIds.length > 0) {
        for (const layerId of options.selectedLayerIds) {
          const layer = await db.layers.get(layerId);
          if (!layer) {
            issues.push(`Camada selecionada não encontrada: ${layerId}`);
          }
        }
      }

      if (options.selectedMapIds && options.selectedMapIds.length > 0) {
        for (const mapId of options.selectedMapIds) {
          const map = await db.maps.get(mapId);
          if (!map) {
            issues.push(`Mapa selecionado não encontrado: ${mapId}`);
          }
        }
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
}

// Instância singleton
export const exportService = new ExportService();
