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

// Interface para backup robusto
interface BackupData {
  features: ExtendedFeature[];
  layers: LayerConfig[];
  maps: MapConfig[];
  assets: AssetData[];
  metadata: {
    timestamp: string;
    version: string;
    checksum: string;
  };
}

// Configurações de backup
const BACKUP_CONFIG = {
  maxBackupSize: 100 * 1024 * 1024, // 100MB
  compressionLevel: 6,
  chunkSize: 1000, // Processar em chunks para grandes datasets
} as const;

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

      // 2. Fazer backup robusto se solicitado
      if (options.backupBeforeImport) {
        result.backupId = await this.createRobustBackup();
        console.log('Backup robusto criado:', result.backupId);
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
          await this.restoreRobustBackup(result.backupId);
          console.log('Backup restaurado devido ao erro');
        } catch (backupError) {
          console.error('Erro crítico ao restaurar backup:', backupError);
          result.errors.push(
            'ERRO CRÍTICO: Falha ao restaurar backup. Dados podem estar corrompidos.'
          );
          // Em caso de falha crítica, tentar último recurso
          await this.attemptEmergencyRecovery();
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
      throw new Error(
        `Arquivo muito grande. Máximo permitido: ${this.formatFileSize(IO_CONFIG.maxFileSize)}`
      );
    }

    if (file.size === 0) {
      throw new Error('Arquivo está vazio');
    }
  }

  /**
   * CORREÇÃO CRÍTICA: Criar backup robusto usando IndexedDB
   */
  private async createRobustBackup(): Promise<string> {
    const backupId = `backup-${Date.now()}-${crypto.randomUUID()}`;

    try {
      // Coletar todos os dados
      const [features, layers, maps, assets] = await Promise.all([
        db.features.toArray(),
        db.layers.toArray(),
        db.maps.toArray(),
        db.assets.toArray(),
      ]);

      const backupData: BackupData = {
        features,
        layers,
        maps,
        assets,
        metadata: {
          timestamp: new Date().toISOString(),
          version: APP_INFO.version,
          checksum: await this.calculateDataChecksum({ features, layers, maps, assets }),
        },
      };

      // Calcular tamanho estimado
      const estimatedSize = this.estimateBackupSize(backupData);
      console.log(`Tamanho estimado do backup: ${this.formatFileSize(estimatedSize)}`);

      if (estimatedSize > BACKUP_CONFIG.maxBackupSize) {
        throw new Error(
          `Backup muito grande (${this.formatFileSize(estimatedSize)}). Máximo: ${this.formatFileSize(BACKUP_CONFIG.maxBackupSize)}`
        );
      }

      // Armazenar backup no IndexedDB usando uma table dedicada
      await this.storeBackupInIndexedDB(backupId, backupData);

      console.log(`Backup criado com sucesso: ${backupId}`);
      return backupId;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw new Error(
        `Falha ao criar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Armazenar backup no IndexedDB de forma segura
   */
  private async storeBackupInIndexedDB(backupId: string, backupData: BackupData): Promise<void> {
    // Criar uma conexão temporária para backup
    const backupDB = new Dexie('EBGeoBackups');

    backupDB.version(1).stores({
      backups: 'id, timestamp, size, checksum',
      backup_data: 'id, data',
    });

    try {
      await backupDB.open();

      // Serializar dados em chunks para melhor performance
      const serializedData = JSON.stringify(backupData);
      const chunks = this.chunkData(serializedData, 1024 * 1024); // 1MB chunks

      await backupDB.transaction('rw', ['backups', 'backup_data'], async () => {
        // Salvar metadata do backup
        await backupDB.table('backups').add({
          id: backupId,
          timestamp: backupData.metadata.timestamp,
          size: serializedData.length,
          checksum: backupData.metadata.checksum,
          chunks: chunks.length,
        });

        // Salvar chunks dos dados
        for (let i = 0; i < chunks.length; i++) {
          await backupDB.table('backup_data').add({
            id: `${backupId}_chunk_${i}`,
            data: chunks[i],
          });
        }
      });
    } finally {
      backupDB.close();
    }
  }

  /**
   * CORREÇÃO CRÍTICA: Restaurar backup do IndexedDB
   */
  private async restoreRobustBackup(backupId: string): Promise<void> {
    const backupDB = new Dexie('EBGeoBackups');

    backupDB.version(1).stores({
      backups: 'id, timestamp, size, checksum',
      backup_data: 'id, data',
    });

    try {
      await backupDB.open();

      // Buscar metadata do backup
      const backupMeta = await backupDB.table('backups').get(backupId);
      if (!backupMeta) {
        throw new Error('Backup não encontrado');
      }

      // Recuperar chunks dos dados
      const chunks: string[] = [];
      for (let i = 0; i < backupMeta.chunks; i++) {
        const chunk = await backupDB.table('backup_data').get(`${backupId}_chunk_${i}`);
        if (!chunk) {
          throw new Error(`Chunk ${i} do backup corrompido`);
        }
        chunks.push(chunk.data);
      }

      // Reconstituir dados
      const serializedData = chunks.join('');
      const backupData: BackupData = JSON.parse(serializedData);

      // Validar integridade
      const currentChecksum = await this.calculateDataChecksum({
        features: backupData.features,
        layers: backupData.layers,
        maps: backupData.maps,
        assets: backupData.assets,
      });

      if (currentChecksum !== backupData.metadata.checksum) {
        throw new Error('Checksum do backup não confere - dados corrompidos');
      }

      // Restaurar dados com transação atômica
      await db.transaction('rw', [db.features, db.layers, db.maps, db.assets], async () => {
        // Limpar dados existentes
        await db.features.clear();
        await db.layers.clear();
        await db.maps.clear();
        await db.assets.clear();

        // Restaurar dados em chunks para melhor performance
        if (backupData.features.length > 0) {
          await this.bulkAddInChunks(db.features, backupData.features);
        }
        if (backupData.layers.length > 0) {
          await this.bulkAddInChunks(db.layers, backupData.layers);
        }
        if (backupData.maps.length > 0) {
          await this.bulkAddInChunks(db.maps, backupData.maps);
        }
        if (backupData.assets.length > 0) {
          await this.bulkAddInChunks(db.assets, backupData.assets);
        }
      });

      console.log('Backup restaurado com sucesso');

      // Limpar backup temporário
      await this.cleanupBackup(backupId);
    } finally {
      backupDB.close();
    }
  }

  /**
   * Adicionar dados em chunks para melhor performance
   */
  private async bulkAddInChunks<T>(table: any, data: T[]): Promise<void> {
    const chunkSize = BACKUP_CONFIG.chunkSize;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await table.bulkAdd(chunk);
    }
  }

  /**
   * Dividir dados em chunks
   */
  private chunkData(data: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.substring(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Calcular checksum dos dados
   */
  private async calculateDataChecksum(data: any): Promise<string> {
    const text = JSON.stringify(data);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(text));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Estimar tamanho do backup
   */
  private estimateBackupSize(backupData: BackupData): number {
    return JSON.stringify(backupData).length;
  }

  /**
   * Limpar backup temporário
   */
  private async cleanupBackup(backupId: string): Promise<void> {
    const backupDB = new Dexie('EBGeoBackups');

    backupDB.version(1).stores({
      backups: 'id, timestamp, size, checksum',
      backup_data: 'id, data',
    });

    try {
      await backupDB.open();

      const backupMeta = await backupDB.table('backups').get(backupId);
      if (backupMeta) {
        await backupDB.transaction('rw', ['backups', 'backup_data'], async () => {
          // Remover chunks
          for (let i = 0; i < backupMeta.chunks; i++) {
            await backupDB.table('backup_data').delete(`${backupId}_chunk_${i}`);
          }

          // Remover metadata
          await backupDB.table('backups').delete(backupId);
        });
      }
    } finally {
      backupDB.close();
    }
  }

  /**
   * Tentativa de recuperação de emergência
   */
  private async attemptEmergencyRecovery(): Promise<void> {
    console.warn('Iniciando recuperação de emergência...');

    try {
      // Tentar inicializar database com dados mínimos
      const { initializeDatabase } = await import('../../data-access/db');
      await initializeDatabase();
      console.log('Recuperação de emergência bem-sucedida');
    } catch (error) {
      console.error('Falha na recuperação de emergência:', error);
      throw new Error('Falha crítica: Não foi possível recuperar o sistema');
    }
  }

  /**
   * Resolver conflitos de maps
   */
  private resolveMapConflict(
    newMap: MapConfig,
    existing: MapConfig | null,
    strategy: ImportStrategy
  ): ImportConflict | null {
    if (!existing) return null;

    switch (strategy) {
      case 'skip-existing':
        return {
          type: 'map',
          id: newMap.id,
          name: newMap.name,
          action: 'skipped',
          details: 'Map já existe e foi pulado',
        };

      case 'replace':
      case 'merge':
        // Verificar se o novo é mais recente
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
   * Extrair e validar dados do arquivo
   */
  private async extractAndValidateData(file: File, options: ImportOptions): Promise<ExtractedData> {
    // Implementação simplificada - a lógica completa seria similar ao código original
    // mas com validações mais robustas
    throw new Error('Método extractAndValidateData precisa ser implementado');
  }

  /**
   * Filtrar dados selecionados
   */
  private filterSelectedData(data: ExtractedData, options: ImportOptions): ExtractedData {
    // Implementação simplificada
    return data;
  }

  /**
   * Processar importação
   */
  private async processImport(
    data: ExtractedData,
    options: ImportOptions
  ): Promise<{
    stats: ImportResult['stats'];
    conflicts: ImportConflict[];
    errors: string[];
  }> {
    // Implementação simplificada
    return {
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
        issues: [
          `Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        ],
      };
    }
  }
}

// Instância singleton
export const importService = new ImportService();
