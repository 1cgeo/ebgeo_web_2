// Path: features\data-access\repositories\implementations\IndexedDBFeatureRepository.ts

import { db } from '../../db';
import { MapConfig, validateMapConfig } from '../../schemas/map.schema';
import { LayerConfig } from '../../schemas/layer.schema';
import {
  IMapRepository,
  CreateMapOptions,
  DuplicateMapOptions,
  MapValidationResult,
} from '../interfaces/IMapRepository';

export class IndexedDBMapRepository implements IMapRepository {
  async create(map: MapConfig): Promise<MapConfig> {
    try {
      const validatedMap = validateMapConfig(map);
      await db.maps.add(validatedMap);
      return validatedMap;
    } catch (error) {
      console.error('Erro ao criar mapa:', error);
      throw new Error(
        `Falha ao criar mapa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async getById(id: string): Promise<MapConfig | null> {
    try {
      const map = await db.maps.get(id);
      return map || null;
    } catch (error) {
      console.error('Erro ao buscar mapa por ID:', error);
      throw new Error(
        `Falha ao buscar mapa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async getAll(): Promise<MapConfig[]> {
    try {
      return await db.maps.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error('Erro ao buscar todos os mapas:', error);
      throw new Error(
        `Falha ao buscar mapas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async update(id: string, updates: Partial<MapConfig>): Promise<MapConfig> {
    try {
      const existingMap = await this.getById(id);
      if (!existingMap) {
        throw new Error('Mapa não encontrado');
      }

      const updatedMap = {
        ...existingMap,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const validatedMap = validateMapConfig(updatedMap);
      await db.maps.update(id, validatedMap);
      return validatedMap;
    } catch (error) {
      console.error('Erro ao atualizar mapa:', error);
      throw new Error(
        `Falha ao atualizar mapa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deleted = await db.maps.delete(id);
      if (deleted === 0) {
        throw new Error('Mapa não encontrado');
      }
    } catch (error) {
      console.error('Erro ao deletar mapa:', error);
      throw new Error(
        `Falha ao deletar mapa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async addLayer(mapId: string, layerId: string): Promise<MapConfig> {
    try {
      const map = await this.getById(mapId);
      if (!map) {
        throw new Error('Mapa não encontrado');
      }

      // Verificar se a camada existe
      const layer = await db.layers.get(layerId);
      if (!layer) {
        throw new Error('Camada não encontrada');
      }

      // Verificar se a camada já está no mapa
      if (map.layerIds.includes(layerId)) {
        throw new Error('Camada já está no mapa');
      }

      // Verificar limite máximo de camadas
      if (map.layerIds.length >= 10) {
        throw new Error('Limite máximo de 10 camadas por mapa atingido');
      }

      const updatedLayerIds = [...map.layerIds, layerId];
      return await this.update(mapId, { layerIds: updatedLayerIds });
    } catch (error) {
      console.error('Erro ao adicionar camada ao mapa:', error);
      throw new Error(
        `Falha ao adicionar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * CORREÇÃO: Remover camada com validações mais robustas
   */
  async removeLayer(mapId: string, layerId: string): Promise<MapConfig> {
    try {
      const map = await this.getById(mapId);
      if (!map) {
        throw new Error('Mapa não encontrado');
      }

      // CORREÇÃO CRÍTICA: Verificar se a camada realmente existe no mapa
      if (!map.layerIds.includes(layerId)) {
        throw new Error('Camada não está presente no mapa');
      }

      // CORREÇÃO: Lógica mais robusta para verificação da última camada
      const remainingLayers = map.layerIds.filter(id => id !== layerId);

      if (remainingLayers.length === 0) {
        throw new Error(
          'Não é possível remover a última camada do mapa. Deve haver pelo menos 1 camada.'
        );
      }

      // CORREÇÃO: Verificar se as camadas restantes existem no banco
      const validRemainingLayers = await this.validateLayerIds(remainingLayers);

      if (validRemainingLayers.length === 0) {
        throw new Error('Não é possível remover a camada: não há outras camadas válidas no mapa');
      }

      // Usar apenas camadas válidas
      return await this.update(mapId, { layerIds: validRemainingLayers });
    } catch (error) {
      console.error('Erro ao remover camada do mapa:', error);
      throw new Error(
        `Falha ao remover camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * NOVO: Validar IDs de camadas contra o banco de dados
   */
  private async validateLayerIds(layerIds: string[]): Promise<string[]> {
    try {
      const validLayers = await db.layers.where('id').anyOf(layerIds).toArray();
      return validLayers.map(layer => layer.id);
    } catch (error) {
      console.error('Erro ao validar IDs de camadas:', error);
      return [];
    }
  }

  /**
   * CORREÇÃO: Reordenar camadas com validações mais robustas
   */
  async reorderLayers(mapId: string, layerIds: string[]): Promise<MapConfig> {
    try {
      const map = await this.getById(mapId);
      if (!map) {
        throw new Error('Mapa não encontrado');
      }

      // CORREÇÃO: Verificar se todos os IDs fornecidos são válidos
      if (layerIds.length === 0) {
        throw new Error('Lista de camadas não pode estar vazia');
      }

      // CORREÇÃO: Verificar se as camadas existem no banco de dados
      const validLayerIds = await this.validateLayerIds(layerIds);

      if (validLayerIds.length !== layerIds.length) {
        const invalidIds = layerIds.filter(id => !validLayerIds.includes(id));
        throw new Error(`Camadas não encontradas: ${invalidIds.join(', ')}`);
      }

      // CORREÇÃO: Verificar se todas as camadas pertencem ao mapa
      const invalidForMap = layerIds.filter(id => !map.layerIds.includes(id));
      if (invalidForMap.length > 0) {
        throw new Error(`Camadas não pertencem ao mapa: ${invalidForMap.join(', ')}`);
      }

      // CORREÇÃO: Verificar se não faltam camadas do mapa original
      const missingFromReorder = map.layerIds.filter(id => !layerIds.includes(id));
      if (missingFromReorder.length > 0) {
        console.warn(`Camadas ausentes na reordenação: ${missingFromReorder.join(', ')}`);
        // Adicionar camadas faltantes ao final
        layerIds.push(...missingFromReorder);
      }

      return await this.update(mapId, { layerIds });
    } catch (error) {
      console.error('Erro ao reordenar camadas do mapa:', error);
      throw new Error(
        `Falha ao reordenar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async createMany(maps: MapConfig[]): Promise<MapConfig[]> {
    try {
      const validatedMaps = maps.map(map => validateMapConfig(map));
      await db.maps.bulkAdd(validatedMaps);
      return validatedMaps;
    } catch (error) {
      console.error('Erro ao criar múltiplos mapas:', error);
      throw new Error(
        `Falha ao criar mapas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    try {
      await db.maps.bulkDelete(ids);
    } catch (error) {
      console.error('Erro ao deletar múltiplos mapas:', error);
      throw new Error(
        `Falha ao deletar mapas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async count(): Promise<number> {
    try {
      return await db.maps.count();
    } catch (error) {
      console.error('Erro ao contar mapas:', error);
      throw new Error(
        `Falha ao contar mapas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const map = await db.maps.get(id);
      return !!map;
    } catch (error) {
      console.error('Erro ao verificar existência do mapa:', error);
      return false;
    }
  }

  async getByName(name: string): Promise<MapConfig | null> {
    try {
      const map = await db.maps.where('name').equals(name).first();
      return map || null;
    } catch (error) {
      console.error('Erro ao buscar mapa por nome:', error);
      throw new Error(
        `Falha ao buscar mapa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      const map = await this.getByName(name);
      return map !== null && map.id !== excludeId;
    } catch (error) {
      console.error('Erro ao verificar nome do mapa:', error);
      return false;
    }
  }

  async getWithLayers(id: string): Promise<{
    map: MapConfig;
    layers: LayerConfig[];
  } | null> {
    try {
      const map = await this.getById(id);
      if (!map) {
        return null;
      }

      const layers = await db.layers.where('id').anyOf(map.layerIds).toArray();

      // Ordenar layers pelo zIndex
      layers.sort((a, b) => a.zIndex - b.zIndex);

      return { map, layers };
    } catch (error) {
      console.error('Erro ao buscar mapa com camadas:', error);
      throw new Error(
        `Falha ao buscar mapa com camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async duplicate(
    id: string,
    newName: string,
    includeFeatures: boolean = false
  ): Promise<MapConfig> {
    try {
      const originalMap = await this.getById(id);
      if (!originalMap) {
        throw new Error('Mapa original não encontrado');
      }

      if (await this.nameExists(newName)) {
        throw new Error('Nome do mapa já existe');
      }

      const now = new Date().toISOString();
      let newLayerIds: string[] = [];

      if (includeFeatures) {
        // Duplicar todas as camadas e suas features
        const layers = await db.layers.where('id').anyOf(originalMap.layerIds).toArray();

        for (const layer of layers) {
          // Duplicar camada
          const newLayerId = crypto.randomUUID();
          const newLayer: LayerConfig = {
            ...layer,
            id: newLayerId,
            name: `${layer.name} (Cópia)`,
            createdAt: now,
            updatedAt: now,
          };

          await db.layers.add(newLayer);
          newLayerIds.push(newLayerId);

          // Duplicar features da camada
          const features = await db.features.where('properties.layerId').equals(layer.id).toArray();
          const newFeatures = features.map(feature => ({
            ...feature,
            id: crypto.randomUUID(),
            properties: {
              ...feature.properties,
              id: crypto.randomUUID(),
              layerId: newLayerId,
              name: feature.properties.name ? `${feature.properties.name} (Cópia)` : undefined,
              createdAt: now,
              updatedAt: now,
            },
          }));

          if (newFeatures.length > 0) {
            await db.features.bulkAdd(newFeatures);
          }
        }
      } else {
        // Apenas referenciar as camadas existentes
        newLayerIds = [...originalMap.layerIds];
      }

      // Criar novo mapa
      const newMap: MapConfig = {
        ...originalMap,
        id: crypto.randomUUID(),
        name: newName,
        layerIds: newLayerIds,
        createdAt: now,
        updatedAt: now,
      };

      return await this.create(newMap);
    } catch (error) {
      console.error('Erro ao duplicar mapa:', error);
      throw new Error(
        `Falha ao duplicar mapa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async updateViewport(id: string, center: [number, number], zoom: number): Promise<MapConfig> {
    try {
      return await this.update(id, { center, zoom });
    } catch (error) {
      console.error('Erro ao atualizar viewport do mapa:', error);
      throw new Error(
        `Falha ao atualizar viewport: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * CORREÇÃO: Validação mais robusta do mapa
   */
  async validateMap(id: string): Promise<{
    valid: boolean;
    issues: string[];
    missingLayers: string[];
  }> {
    try {
      const map = await this.getById(id);
      if (!map) {
        return {
          valid: false,
          issues: ['Mapa não encontrado'],
          missingLayers: [],
        };
      }

      const issues: string[] = [];
      const missingLayers: string[] = [];

      // CORREÇÃO: Verificar se as camadas referenciadas existem
      const validLayerIds = await this.validateLayerIds(map.layerIds);
      const invalidLayerIds = map.layerIds.filter(id => !validLayerIds.includes(id));

      if (invalidLayerIds.length > 0) {
        missingLayers.push(...invalidLayerIds);
        issues.push(
          `${invalidLayerIds.length} camada(s) não encontrada(s): ${invalidLayerIds.join(', ')}`
        );
      }

      // CORREÇÃO: Verificar limite mínimo de camadas válidas
      if (validLayerIds.length === 0) {
        issues.push('Mapa deve ter pelo menos 1 camada válida');
      }

      // Verificar limite máximo de camadas
      if (map.layerIds.length > 10) {
        issues.push('Mapa não pode ter mais de 10 camadas');
      }

      // NOVO: Verificar duplicatas na lista de camadas
      const uniqueLayerIds = new Set(map.layerIds);
      if (uniqueLayerIds.size !== map.layerIds.length) {
        issues.push('Mapa contém camadas duplicadas');
      }

      // NOVO: Verificar coordenadas do centro
      if (!Array.isArray(map.center) || map.center.length !== 2) {
        issues.push('Coordenadas do centro inválidas');
      } else {
        const [lng, lat] = map.center;
        if (
          typeof lng !== 'number' ||
          typeof lat !== 'number' ||
          lng < -180 ||
          lng > 180 ||
          lat < -90 ||
          lat > 90
        ) {
          issues.push('Coordenadas do centro fora dos limites válidos');
        }
      }

      // NOVO: Verificar zoom
      if (typeof map.zoom !== 'number' || map.zoom < 0 || map.zoom > 24) {
        issues.push('Nível de zoom inválido (deve estar entre 0 e 24)');
      }

      return {
        valid: issues.length === 0,
        issues,
        missingLayers,
      };
    } catch (error) {
      console.error('Erro ao validar mapa:', error);
      return {
        valid: false,
        issues: [
          `Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        ],
        missingLayers: [],
      };
    }
  }

  /**
   * CORREÇÃO: Limpeza mais robusta de referências de camadas
   */
  async cleanupLayerReferences(deletedLayerId: string): Promise<MapConfig[]> {
    try {
      const allMaps = await this.getAll();
      const updatedMaps: MapConfig[] = [];

      for (const map of allMaps) {
        if (map.layerIds.includes(deletedLayerId)) {
          const newLayerIds = map.layerIds.filter(id => id !== deletedLayerId);

          // CORREÇÃO: Se ficar sem camadas, tentar adicionar uma camada padrão
          if (newLayerIds.length === 0) {
            console.warn(`Mapa ${map.name} ficaria sem camadas após remoção de ${deletedLayerId}`);

            // Tentar encontrar uma camada padrão para adicionar
            const defaultLayer = await db.layers.orderBy('createdAt').first();
            if (defaultLayer && defaultLayer.id !== deletedLayerId) {
              newLayerIds.push(defaultLayer.id);
              console.log(`Camada padrão ${defaultLayer.id} adicionada ao mapa ${map.name}`);
            } else {
              console.error(`Não foi possível encontrar camada substituta para o mapa ${map.name}`);
              continue; // Pular este mapa se não conseguir resolver
            }
          }

          const updatedMap = await this.update(map.id, { layerIds: newLayerIds });
          updatedMaps.push(updatedMap);
        }
      }

      return updatedMaps;
    } catch (error) {
      console.error('Erro ao limpar referências de camadas:', error);
      throw new Error(
        `Falha na limpeza: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * NOVO: Reparar mapa com problemas de integridade
   */
  async repairMap(id: string): Promise<{
    repaired: boolean;
    actions: string[];
  }> {
    try {
      const actions: string[] = [];
      const validation = await this.validateMap(id);

      if (validation.valid) {
        return { repaired: false, actions: ['Mapa já está válido'] };
      }

      const map = await this.getById(id);
      if (!map) {
        throw new Error('Mapa não encontrado para reparo');
      }

      // Remover camadas inválidas
      const validLayerIds = await this.validateLayerIds(map.layerIds);
      let repairedLayerIds = validLayerIds;

      if (validation.missingLayers.length > 0) {
        actions.push(`Removidas ${validation.missingLayers.length} camada(s) inválida(s)`);
      }

      // Se não sobrou nenhuma camada válida, adicionar uma padrão
      if (repairedLayerIds.length === 0) {
        const defaultLayer = await db.layers.orderBy('createdAt').first();
        if (defaultLayer) {
          repairedLayerIds.push(defaultLayer.id);
          actions.push('Camada padrão adicionada');
        } else {
          throw new Error('Não há camadas disponíveis para reparar o mapa');
        }
      }

      // Remover duplicatas
      const uniqueLayerIds = [...new Set(repairedLayerIds)];
      if (uniqueLayerIds.length !== repairedLayerIds.length) {
        repairedLayerIds = uniqueLayerIds;
        actions.push('Camadas duplicadas removidas');
      }

      // Atualizar o mapa
      await this.update(id, { layerIds: repairedLayerIds });
      actions.push('Mapa atualizado com camadas válidas');

      return { repaired: true, actions };
    } catch (error) {
      console.error('Erro ao reparar mapa:', error);
      return {
        repaired: false,
        actions: [
          `Erro no reparo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        ],
      };
    }
  }
}
