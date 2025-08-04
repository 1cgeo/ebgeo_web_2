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

    // Verificar se existem mapas
    const mapCount = await db.maps.count();
    const layerCount = await db.layers.count();

    let defaultLayerId: string;

    // Criar camada padrão se não existir
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
      defaultLayerId = defaultLayer.id;
      console.log('Camada padrão criada:', defaultLayer.id);
    } else {
      // Usar a primeira camada existente
      const firstLayer = await db.layers.orderBy('createdAt').first();
      defaultLayerId = firstLayer!.id;
    }

    // Criar mapa padrão se não existir
    if (mapCount === 0) {
      const defaultMap: MapConfig = {
        id: crypto.randomUUID(),
        name: 'Mapa Padrão',
        description: 'Mapa padrão criado automaticamente',
        layerIds: [defaultLayerId],
        center: [-51.2177, -30.0346], // Porto Alegre
        zoom: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.maps.add(defaultMap);
      console.log('Mapa padrão criado:', defaultMap.id);
    } else {
      // Verificar se todos os mapas têm pelo menos uma camada
      const allMaps = await db.maps.toArray();
      for (const map of allMaps) {
        if (map.layerIds.length === 0) {
          // Adicionar a camada padrão ao mapa
          await db.maps.update(map.id, {
            layerIds: [defaultLayerId],
            updatedAt: new Date().toISOString(),
          });
          console.log(`Camada padrão adicionada ao mapa: ${map.name}`);
        }
      }
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

// Função para backup do banco de dados
export const backupDatabase = async (): Promise<{
  features: ExtendedFeature[];
  layers: LayerConfig[];
  maps: MapConfig[];
  assets: AssetData[];
}> => {
  try {
    const [features, layers, maps, assets] = await Promise.all([
      db.features.toArray(),
      db.layers.toArray(),
      db.maps.toArray(),
      db.assets.toArray(),
    ]);

    return {
      features,
      layers,
      maps,
      assets,
    };
  } catch (error) {
    console.error('Erro ao fazer backup do banco:', error);
    throw error;
  }
};

// Função para restaurar backup
export const restoreDatabase = async (backup: {
  features: ExtendedFeature[];
  layers: LayerConfig[];
  maps: MapConfig[];
  assets: AssetData[];
}): Promise<void> => {
  try {
    await db.transaction('rw', [db.features, db.layers, db.maps, db.assets], async () => {
      // Limpar dados existentes
      await db.features.clear();
      await db.layers.clear();
      await db.maps.clear();
      await db.assets.clear();

      // Restaurar dados
      await db.features.bulkAdd(backup.features);
      await db.layers.bulkAdd(backup.layers);
      await db.maps.bulkAdd(backup.maps);
      await db.assets.bulkAdd(backup.assets);
    });

    console.log('Backup restaurado com sucesso');
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    throw error;
  }
};

// Função para verificar integridade do banco
export const checkDatabaseIntegrity = async (): Promise<{
  valid: boolean;
  issues: string[];
}> => {
  try {
    const issues: string[] = [];

    // Verificar se há pelo menos um mapa
    const mapCount = await db.maps.count();
    if (mapCount === 0) {
      issues.push('Nenhum mapa encontrado');
    }

    // Verificar se há pelo menos uma camada
    const layerCount = await db.layers.count();
    if (layerCount === 0) {
      issues.push('Nenhuma camada encontrada');
    }

    // Verificar referências órfãs
    const features = await db.features.toArray();
    const layers = await db.layers.toArray();
    const maps = await db.maps.toArray();

    const layerIds = new Set(layers.map(l => l.id));

    // Features órfãs (sem camada)
    const orphanedFeatures = features.filter(f => !layerIds.has(f.properties.layerId));
    if (orphanedFeatures.length > 0) {
      issues.push(`${orphanedFeatures.length} feature(s) órfã(s) encontrada(s)`);
    }

    // Mapas com camadas inexistentes
    for (const map of maps) {
      const invalidLayerIds = map.layerIds.filter(id => !layerIds.has(id));
      if (invalidLayerIds.length > 0) {
        issues.push(
          `Mapa "${map.name}" referencia ${invalidLayerIds.length} camada(s) inexistente(s)`
        );
      }
    }

    // Mapas sem camadas
    const mapsWithoutLayers = maps.filter(m => m.layerIds.length === 0);
    if (mapsWithoutLayers.length > 0) {
      issues.push(`${mapsWithoutLayers.length} mapa(s) sem camadas`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  } catch (error) {
    console.error('Erro ao verificar integridade:', error);
    return {
      valid: false,
      issues: [
        `Erro na verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      ],
    };
  }
};

// Função para reparar problemas de integridade
export const repairDatabaseIntegrity = async (): Promise<{
  repaired: boolean;
  actions: string[];
}> => {
  try {
    const actions: string[] = [];
    const integrity = await checkDatabaseIntegrity();

    if (integrity.valid) {
      return { repaired: false, actions: ['Banco já está íntegro'] };
    }

    await db.transaction('rw', [db.features, db.layers, db.maps], async () => {
      // Garantir que há pelo menos uma camada
      const layerCount = await db.layers.count();
      let defaultLayerId: string;

      if (layerCount === 0) {
        const defaultLayer: LayerConfig = {
          id: crypto.randomUUID(),
          name: 'Camada Padrão (Reparado)',
          visible: true,
          opacity: 1,
          zIndex: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.layers.add(defaultLayer);
        defaultLayerId = defaultLayer.id;
        actions.push('Camada padrão criada');
      } else {
        const firstLayer = await db.layers.orderBy('createdAt').first();
        defaultLayerId = firstLayer!.id;
      }

      // Garantir que há pelo menos um mapa
      const mapCount = await db.maps.count();
      if (mapCount === 0) {
        const defaultMap: MapConfig = {
          id: crypto.randomUUID(),
          name: 'Mapa Padrão (Reparado)',
          description: 'Mapa padrão criado durante reparo',
          layerIds: [defaultLayerId],
          center: [-51.2177, -30.0346],
          zoom: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.maps.add(defaultMap);
        actions.push('Mapa padrão criado');
      }

      // Remover features órfãs
      const features = await db.features.toArray();
      const layers = await db.layers.toArray();
      const layerIds = new Set(layers.map(l => l.id));

      const orphanedFeatureIds = features
        .filter(f => !layerIds.has(f.properties.layerId))
        .map(f => f.id);

      if (orphanedFeatureIds.length > 0) {
        await db.features.bulkDelete(orphanedFeatureIds);
        actions.push(`${orphanedFeatureIds.length} feature(s) órfã(s) removida(s)`);
      }

      // Corrigir mapas com referências inválidas
      const maps = await db.maps.toArray();
      for (const map of maps) {
        const validLayerIds = map.layerIds.filter(id => layerIds.has(id));

        if (validLayerIds.length !== map.layerIds.length) {
          // Se ficou sem camadas válidas, adicionar a padrão
          if (validLayerIds.length === 0) {
            validLayerIds.push(defaultLayerId);
          }

          await db.maps.update(map.id, {
            layerIds: validLayerIds,
            updatedAt: new Date().toISOString(),
          });

          actions.push(`Referências do mapa "${map.name}" corrigidas`);
        }
      }
    });

    return { repaired: true, actions };
  } catch (error) {
    console.error('Erro ao reparar integridade:', error);
    throw error;
  }
};
