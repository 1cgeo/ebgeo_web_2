// Path: features\data-access\db.ts
import Dexie, { Table } from 'dexie';
import { ExtendedFeature } from './schemas/feature.schema';
import { LayerConfig } from './schemas/layer.schema';
import { MapConfig } from './schemas/map.schema';

// Interface para dados de assets
export interface AssetData {
  id: string;
  name: string;
  type: string;
  size: number;
  data: Blob;
  createdAt: string;
  updatedAt: string;
}

// Classe do banco de dados
export class EBGeoDatabase extends Dexie {
  // Tabelas
  features!: Table<ExtendedFeature>;
  layers!: Table<LayerConfig>;
  maps!: Table<MapConfig>;
  assets!: Table<AssetData>;

  constructor() {
    super('EBGeoDatabase');

    // Definir schema do banco
    this.version(1).stores({
      features: 'id, properties.layerId, geometry.type, properties.createdAt, properties.updatedAt',
      layers: 'id, name, zIndex, createdAt, updatedAt',
      maps: 'id, name, createdAt, updatedAt',
      assets: 'id, name, type, size, createdAt, updatedAt',
    });
  }
}

// Instância do banco de dados
export const db = new EBGeoDatabase();

/**
 * Inicializar banco de dados
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.open();
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw new Error('Falha na inicialização do banco de dados');
  }
};

/**
 * Verificar se o banco está disponível
 */
export const isDatabaseReady = async (): Promise<boolean> => {
  try {
    await db.ready;
    return true;
  } catch (error) {
    console.error('Banco de dados não está pronto:', error);
    return false;
  }
};

/**
 * Limpar todos os dados do banco (usar com cuidado)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await db.transaction('rw', [db.features, db.layers, db.maps, db.assets], async () => {
      await db.features.clear();
      await db.layers.clear();
      await db.maps.clear();
      await db.assets.clear();
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw new Error('Falha ao limpar dados do banco');
  }
};

/**
 * Fechar conexão com o banco
 */
export const closeDatabase = (): void => {
  db.close();
};

/**
 * Tratamento de erros do banco
 */
export const handleDatabaseError = (error: any): Error => {
  if (error.name === 'DatabaseClosedError') {
    return new Error('Banco de dados foi fechado inesperadamente');
  }

  if (error.name === 'VersionError') {
    return new Error('Versão do banco de dados incompatível');
  }

  if (error.name === 'OpenFailedError') {
    return new Error('Falha ao abrir banco de dados');
  }

  if (error.name === 'InvalidStateError') {
    return new Error('Estado inválido do banco de dados');
  }

  return new Error(
    `Erro do banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
  );
};
