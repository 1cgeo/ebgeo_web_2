// Path: features\data-access\db.ts

import Dexie, { Table } from 'dexie';
import { ExtendedFeature } from './schemas/feature.schema';
import { LayerConfig } from './schemas/layer.schema';
import { MapConfig } from './schemas/map.schema';

// Interface para assets binários
export interface AssetData {
  id: string;
  name: string;
  type: string;
  data: Blob;
  createdAt: string;
  updatedAt: string;
}

// Classe do banco de dados
export class EBGeoDatabase extends Dexie {
  features!: Table<ExtendedFeature, string>;
  layers!: Table<LayerConfig, string>;
  maps!: Table<MapConfig, string>;
  assets!: Table<AssetData, string>;

  constructor() {
    super('EBGeoDatabase');
    
    this.version(1).stores({
      features: 'id, properties.layerId, properties.createdAt, properties.updatedAt',
      layers: 'id, name, createdAt, updatedAt',
      maps: 'id, name, createdAt, updatedAt',
      assets: 'id, name, type, createdAt, updatedAt',
    });

    // Hooks para validação de dados
    this.features.hook('creating', function (primKey, obj, trans) {
      // Validação adicional pode ser feita aqui
      console.log('Criando feature:', obj.id);
    });

    this.features.hook('updating', function (modifications, primKey, obj, trans) {
      // Atualizar timestamp
      if (modifications.properties) {
        modifications.properties.updatedAt = new Date().toISOString();
      }
      console.log('Atualizando feature:', primKey);
    });

    this.features.hook('deleting', function (primKey, obj, trans) {
      console.log('Deletando feature:', primKey);
    });
  }
}

// Instância global do banco de dados
export const db = new EBGeoDatabase();

// Função para inicializar o banco de dados
export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.open();
    console.log('Banco de dados inicializado com sucesso');
    
    // Criar camada padrão se não existir
    const layerCount = await db.layers.count();
    if (layerCount === 0) {
      const defaultLayer: LayerConfig = {
        id: crypto.randomUUID(),
        name: 'Camada Padrão',
        visible: true,
        opacity: 1,
        zIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.layers.add(defaultLayer);
      console.log('Camada padrão criada:', defaultLayer.id);
    }
    
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

// Função para limpar o banco de dados (para testes)
export const clearDatabase = async (): Promise<void> => {
  try {
    await db.transaction('rw', [db.features, db.layers, db.maps, db.assets], async () => {
      await db.features.clear();
      await db.layers.clear();
      await db.maps.clear();
      await db.assets.clear();
    });
    console.log('Banco de dados limpo');
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
    throw error;
  }
};

// Função para obter estatísticas do banco
export const getDatabaseStats = async () => {
  try {
    const [featureCount, layerCount, mapCount, assetCount] = await Promise.all([
      db.features.count(),
      db.layers.count(),
      db.maps.count(),
      db.assets.count(),
    ]);

    return {
      features: featureCount,
      layers: layerCount,
      maps: mapCount,
      assets: assetCount,
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas do banco:', error);
    throw error;
  }
};