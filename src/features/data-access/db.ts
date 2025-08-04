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

// Interface para lock de inicialização
interface InitializationLock {
  id: string;
  timestamp: number;
  tabId: string;
  status: 'initializing' | 'completed' | 'failed';
}

// Configurações de inicialização
const INIT_CONFIG = {
  lockTimeout: 30000, // 30 segundos
  retryInterval: 100, // 100ms
  maxRetries: 300, // 30 segundos total de espera
} as const;

// ID único da aba para evitar conflitos
const TAB_ID = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Classe do banco de dados
export class EBGeoDatabase extends Dexie {
  features!: Table<ExtendedFeature, string>;
  layers!: Table<LayerConfig, string>;
  maps!: Table<MapConfig, string>;
  assets!: Table<AssetData, string>;

  // CORREÇÃO: Adicionar tabela para locks de inicialização
  init_locks!: Table<InitializationLock, string>;

  constructor() {
    super('EBGeoDatabase');

    this.version(1).stores({
      features: 'id, properties.layerId, properties.createdAt, properties.updatedAt',
      layers: 'id, name, createdAt, updatedAt',
      maps: 'id, name, createdAt, updatedAt',
      assets: 'id, name, type, createdAt, updatedAt',
      init_locks: 'id, timestamp, tabId, status',
    });

    // Hooks para validação de dados
    this.features.hook('creating', function (primKey, obj, trans) {
      console.log('Criando feature:', obj.id);
    });

    this.features.hook('updating', function (modifications, primKey, obj, trans) {
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

/**
 * CORREÇÃO CRÍTICA: Função para inicializar o banco de dados de forma atômica
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.open();
    console.log('Banco de dados aberto com sucesso');

    // Tentar adquirir lock de inicialização
    const lockAcquired = await acquireInitializationLock();

    if (lockAcquired) {
      console.log('Lock de inicialização adquirido, prosseguindo...');
      await performAtomicInitialization();
      await releaseInitializationLock();
      console.log('Inicialização atômica concluída');
    } else {
      console.log('Outra aba está inicializando, aguardando...');
      await waitForInitializationCompletion();
      console.log('Inicialização aguardada concluída');
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    await releaseInitializationLock(); // Limpar lock em caso de erro
    throw error;
  }
};

/**
 * Adquirir lock de inicialização para evitar condições de corrida
 */
const acquireInitializationLock = async (): Promise<boolean> => {
  try {
    const lockId = 'initialization';
    const now = Date.now();

    // Verificar se já existe um lock ativo
    const existingLock = await db.init_locks.get(lockId);

    if (existingLock) {
      // Verificar se o lock expirou
      const lockAge = now - existingLock.timestamp;

      if (lockAge > INIT_CONFIG.lockTimeout) {
        console.warn('Lock de inicialização expirado, removendo...');
        await db.init_locks.delete(lockId);
      } else if (existingLock.status === 'completed') {
        // Inicialização já foi concluída
        return false;
      } else {
        // Lock ainda ativo, não podemos prosseguir
        return false;
      }
    }

    // Tentar criar novo lock
    const lock: InitializationLock = {
      id: lockId,
      timestamp: now,
      tabId: TAB_ID,
      status: 'initializing',
    };

    await db.init_locks.add(lock);
    return true;
  } catch (error) {
    // Se falhar ao criar lock (ex: outro processo criou primeiro), retornar false
    console.log('Falha ao adquirir lock, outra aba provavelmente está inicializando');
    return false;
  }
};

/**
 * Realizar inicialização atômica do banco de dados
 */
const performAtomicInitialization = async (): Promise<void> => {
  // CORREÇÃO CRÍTICA: Envolver TODA a lógica de inicialização em uma única transação
  await db.transaction('rw', [db.features, db.layers, db.maps, db.assets], async () => {
    console.log('Iniciando transação atômica de inicialização...');

    // Verificar se existem mapas e camadas (dentro da transação)
    const [mapCount, layerCount] = await Promise.all([db.maps.count(), db.layers.count()]);

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
      console.log('Camada padrão criada na transação:', defaultLayer.id);
    } else {
      // Usar a primeira camada existente
      const firstLayer = await db.layers.orderBy('createdAt').first();
      if (!firstLayer) {
        throw new Error('Inconsistência: count > 0 mas nenhuma camada encontrada');
      }
      defaultLayerId = firstLayer.id;
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
      console.log('Mapa padrão criado na transação:', defaultMap.id);
    } else {
      // Verificar se todos os mapas têm pelo menos uma camada (dentro da transação)
      const allMaps = await db.maps.toArray();
      const mapsToUpdate: { id: string; layerIds: string[] }[] = [];

      for (const map of allMaps) {
        if (map.layerIds.length === 0) {
          mapsToUpdate.push({
            id: map.id,
            layerIds: [defaultLayerId],
          });
        }
      }

      // Atualizar mapas que ficaram sem camadas
      for (const update of mapsToUpdate) {
        await db.maps.update(update.id, {
          layerIds: update.layerIds,
          updatedAt: new Date().toISOString(),
        });
        console.log(`Camada padrão adicionada ao mapa ${update.id} na transação`);
      }
    }

    console.log('Transação atômica de inicialização concluída com sucesso');
  });
};

/**
 * Liberar lock de inicialização
 */
const releaseInitializationLock = async (): Promise<void> => {
  try {
    const lockId = 'initialization';
    const existingLock = await db.init_locks.get(lockId);

    if (existingLock && existingLock.tabId === TAB_ID) {
      await db.init_locks.update(lockId, {
        status: 'completed',
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.warn('Erro ao liberar lock de inicialização:', error);
  }
};

/**
 * Aguardar conclusão da inicialização por outra aba
 */
const waitForInitializationCompletion = async (): Promise<void> => {
  const lockId = 'initialization';
  let retries = 0;

  while (retries < INIT_CONFIG.maxRetries) {
    const lock = await db.init_locks.get(lockId);

    if (!lock) {
      // Lock removido, provavelmente inicialização concluída
      return;
    }

    if (lock.status === 'completed') {
      // Inicialização concluída com sucesso
      return;
    }

    if (lock.status === 'failed') {
      // Falha na inicialização, tentar adquirir lock
      const lockAcquired = await acquireInitializationLock();
      if (lockAcquired) {
        await performAtomicInitialization();
        await releaseInitializationLock();
      }
      return;
    }

    // Verificar se lock expirou
    const lockAge = Date.now() - lock.timestamp;
    if (lockAge > INIT_CONFIG.lockTimeout) {
      console.warn('Lock expirado durante espera, tentando adquirir...');
      const lockAcquired = await acquireInitializationLock();
      if (lockAcquired) {
        await performAtomicInitialization();
        await releaseInitializationLock();
      }
      return;
    }

    // Aguardar antes de verificar novamente
    await new Promise(resolve => setTimeout(resolve, INIT_CONFIG.retryInterval));
    retries++;
  }

  throw new Error('Timeout aguardando inicialização do banco de dados');
};

/**
 * Limpar locks antigos (executar na inicialização da aplicação)
 */
export const cleanupOldLocks = async (): Promise<void> => {
  try {
    const now = Date.now();
    const oldLocks = await db.init_locks
      .where('timestamp')
      .below(now - INIT_CONFIG.lockTimeout)
      .toArray();

    if (oldLocks.length > 0) {
      const oldLockIds = oldLocks.map(lock => lock.id);
      await db.init_locks.bulkDelete(oldLockIds);
      console.log(`Removidos ${oldLocks.length} locks antigos`);
    }
  } catch (error) {
    console.warn('Erro ao limpar locks antigos:', error);
  }
};

/**
 * Função para limpar o banco de dados (para testes)
 */
export const clearDatabase = async (): Promise<void> => {
  try {
    await db.transaction(
      'rw',
      [db.features, db.layers, db.maps, db.assets, db.init_locks],
      async () => {
        await db.features.clear();
        await db.layers.clear();
        await db.maps.clear();
        await db.assets.clear();
        await db.init_locks.clear();
      }
    );
    console.log('Banco de dados limpo');
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
    throw error;
  }
};

/**
 * Função para verificar integridade do banco
 */
export const checkDatabaseIntegrity = async (): Promise<{
  valid: boolean;
  issues: string[];
}> => {
  try {
    const issues: string[] = [];

    // Verificar se há pelo menos uma camada e um mapa
    const [layerCount, mapCount] = await Promise.all([db.layers.count(), db.maps.count()]);

    if (layerCount === 0) {
      issues.push('Nenhuma camada encontrada');
    }

    if (mapCount === 0) {
      issues.push('Nenhum mapa encontrado');
    }

    // Verificar referências órfãs
    const features = await db.features.toArray();
    const layers = await db.layers.toArray();
    const maps = await db.maps.toArray();

    const layerIds = new Set(layers.map(l => l.id));
    const orphanedFeatures = features.filter(f => !layerIds.has(f.properties.layerId));

    if (orphanedFeatures.length > 0) {
      issues.push(`${orphanedFeatures.length} feature(s) órfã(s) encontrada(s)`);
    }

    // Verificar mapas com camadas inexistentes
    for (const map of maps) {
      const invalidLayerIds = map.layerIds.filter(id => !layerIds.has(id));
      if (invalidLayerIds.length > 0) {
        issues.push(
          `Mapa "${map.name}" referencia ${invalidLayerIds.length} camada(s) inexistente(s)`
        );
      }

      if (map.layerIds.length === 0) {
        issues.push(`Mapa "${map.name}" não possui camadas`);
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
        `Erro na verificação de integridade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      ],
    };
  }
};

/**
 * Função para reparar problemas de integridade
 */
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

      // Corrigir mapas sem camadas
      const maps = await db.maps.toArray();
      for (const map of maps) {
        if (map.layerIds.length === 0) {
          await db.maps.update(map.id, {
            layerIds: [defaultLayerId],
            updatedAt: new Date().toISOString(),
          });
          actions.push(`Camada padrão adicionada ao mapa "${map.name}"`);
        }
      }
    });

    return { repaired: true, actions };
  } catch (error) {
    console.error('Erro durante reparo:', error);
    return {
      repaired: false,
      actions: [
        `Erro durante reparo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      ],
    };
  }
};

/**
 * Função para obter estatísticas do banco
 */
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

/**
 * Função para backup do banco de dados
 */
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

/**
 * Função para restaurar backup
 */
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
