// Path: features/io/services/export.service.ts

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
  checksum?: string;
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
      console.log('Iniciando exportação completa...');
      
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
      console.error('Erro na exportação:', error);
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
   * Exportar mapa específico
   */
  async exportMap(mapId: string, options: ExportOptions = {}): Promise<ExportResult> {
    try {
      console.log('Exportando mapa:', mapId);

      const map = await db.maps.get(mapId);
      if (!map) {
        throw new Error('Mapa não encontrado');
      }

      return await this.exportAll({
        ...options,
        includeAllMaps: false,
        selectedMapIds: [mapId],
        selectedLayerIds: map.layerIds,
        filename: options.filename || `${this.sanitizeFilename(map.name)}.ebgeo`,
      });

    } catch (error) {
      console.error('Erro ao exportar mapa:', error);
      throw error;
    }
  }

  /**
   * Exportar camadas específicas
   */
  async exportLayers(layerIds: string[], options: ExportOptions = {}): Promise<ExportResult> {
    try {
      console.log('Exportando camadas:', layerIds);

      const layers = await db.layers.where('id').anyOf(layerIds).toArray();
      if (layers.length === 0) {
        throw new Error('Nenhuma camada encontrada');
      }

      const layerNames = layers.map(l => l.name).join('-');
      
      return await this.exportAll({
        ...options,
        includeAllMaps: false,
        selectedLayerIds: layerIds,
        filename: options.filename || `camadas-${this.sanitizeFilename(layerNames)}.ebgeo`,
      });

    } catch (error) {
      console.error('Erro ao exportar camadas:', error);
      throw error;
    }
  }

  /**
   * Coletar dados do IndexedDB baseado nas opções
   */
  private async collectData(options: ExportOptions) {
    console.log('Coletando dados do IndexedDB...');

    // Coletar layers
    let layers: LayerConfig[];
    if (options.selectedLayerIds && options.selectedLayerIds.length > 0) {
      layers = await db.layers.where('id').anyOf(options.selectedLayerIds).toArray();
    } else {
      layers = await db.layers.toArray();
    }

    // Coletar features das layers selecionadas
    const layerIds = layers.map(l => l.id);
    let features: ExtendedFeature[];
    if (layerIds.length > 0) {
      features = await db.features.where('properties.layerId').anyOf(layerIds).toArray();
    } else {
      features = [];
    }

    // Coletar maps
    let maps: MapConfig[];
    if (options.includeAllMaps) {
      maps = await db.maps.toArray();
    } else if (options.selectedMapIds && options.selectedMapIds.length > 0) {
      maps = await db.maps.where('id').anyOf(options.selectedMapIds).toArray();
    } else {
      maps = [];
    }

    // Coletar assets (se necessário)
    let assets: AssetData[] = [];
    if (options.includeAssets) {
      // Encontrar assets referenciados nas features
      const assetIds = this.extractAssetReferences(features);
      if (assetIds.length > 0) {
        assets = await db.assets.where('id').anyOf(assetIds).toArray();
      }
    }

    console.log(`Coletados: ${features.length} features, ${layers.length} layers, ${maps.length} maps, ${assets.length} assets`);

    return { features, layers, maps, assets };
  }

  /**
   * Gerar manifest.json com metadados
   */
  private generateManifest(data: {
    features: ExtendedFeature[];
    layers: LayerConfig[];
    maps: MapConfig[];
    assets: AssetData[];
  }): EBGeoManifest {
    console.log('Gerando manifest.json...');

    return {
      version: '1.0.0',
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
    console.log('Gerando features.json...');

    return {
      type: 'FeatureCollection',
      features: features,
    };
  }

  /**
   * Processar assets binários
   */
  private async processAssets(assets: AssetData[]): Promise<void> {
    console.log(`Processando ${assets.length} assets...`);

    const assetsFolder = this.zip.folder('assets');
    if (!assetsFolder) {
      throw new Error('Erro ao criar pasta assets');
    }

    for (const asset of assets) {
      try {
        // Gerar nome do arquivo baseado no ID e tipo
        const extension = this.getFileExtension(asset.type) || 'bin';
        const filename = `${asset.id}.${extension}`;

        // Adicionar asset ao ZIP
        assetsFolder.file(filename, asset.data);

        console.log(`Asset processado: ${filename} (${asset.data.size} bytes)`);
      } catch (error) {
        console.warn(`Erro ao processar asset ${asset.id}:`, error);
      }
    }
  }

  /**
   * Extrair referências de assets das features
   */
  private extractAssetReferences(features: ExtendedFeature[]): string[] {
    const assetIds: Set<string> = new Set();

    for (const feature of features) {
      // Procurar por referências de assets nas propriedades
      const props = feature.properties;
      
      // Verificar propriedades comuns que podem referenciar assets
      const potentialAssetProps = ['image', 'icon', 'symbol', 'attachment', 'media'];
      
      for (const prop of potentialAssetProps) {
        const value = props[prop];
        if (typeof value === 'string' && value.startsWith('assets/')) {
          // Extrair ID do asset da referência
          const assetId = value.replace('assets/', '').split('.')[0];
          assetIds.add(assetId);
        }
      }

      // Verificar propriedades customizadas
      for (const [key, value] of Object.entries(props)) {
        if (typeof value === 'string' && value.startsWith('assets/')) {
          const assetId = value.replace('assets/', '').split('.')[0];
          assetIds.add(assetId);
        }
      }
    }

    return Array.from(assetIds);
  }

  /**
   * Gerar arquivo ZIP compactado
   */
  private async generateZipFile(compression: boolean): Promise<Blob> {
    console.log('Gerando arquivo ZIP...');

    const options: JSZip.JSZipGeneratorOptions = {
      type: 'blob',
      compression: compression ? 'DEFLATE' : 'STORE',
      compressionOptions: {
        level: IO_CONFIG.compressionLevel,
      },
    };

    return this.zip.generateAsync(options);
  }

  /**
   * Fazer download do arquivo
   */
  private async downloadFile(blob: Blob, filename: string): Promise<void> {
    console.log(`Fazendo download: ${filename} (${this.formatFileSize(blob.size)})`);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Utilitários
   */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  }

  private getFileExtension(mimeType: string): string | null {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
    };

    return mimeMap[mimeType] || null;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validar antes da exportação
   */
  async validateBeforeExport(): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const stats = await db.transaction('r', [db.features, db.layers, db.maps], async () => {
        return {
          features: await db.features.count(),
          layers: await db.layers.count(),
          maps: await db.maps.count(),
        };
      });

      const issues: string[] = [];

      if (stats.features === 0) {
        issues.push('Nenhuma feature encontrada para exportar');
      }

      if (stats.layers === 0) {
        issues.push('Nenhuma camada encontrada para exportar');
      }

      if (stats.features > IO_CONFIG.maxFeaturesPerFile) {
        issues.push(`Muitas features (${stats.features}). Máximo: ${IO_CONFIG.maxFeaturesPerFile}`);
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
export const exportService = new ExportService();