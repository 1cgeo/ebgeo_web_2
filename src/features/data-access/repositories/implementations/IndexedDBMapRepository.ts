// Path: features\data-access\repositories\implementations\IndexedDBMapRepository.ts
import { db } from '../../db';
import { MapConfig, validateMapConfig } from '../../schemas/map.schema';
import { LayerConfig } from '../../schemas/layer.schema';
import { IMapRepository } from '../interfaces/IMapRepository';

export class IndexedDBMapRepository implements IMapRepository {
  /**
   * Criar novo mapa
   */
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

  /**
   * Buscar mapa por ID
   */
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

  /**
   * Buscar todos os mapas
   */
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

  /**
   * Atualizar mapa
   */
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

  /**
   * Deletar mapa
   */
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

  /**
   * Buscar mapa com suas camadas
   */
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

      // Ordenar camadas pelo zIndex
      layers.sort((a, b) => a.zIndex - b.zIndex);

      return { map, layers };
    } catch (error) {
      console.error('Erro ao buscar mapa com camadas:', error);
      throw new Error(
        `Falha ao buscar mapa com camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Adicionar camada ao mapa
   */
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

      // Adicionar camada se não estiver presente
      if (!map.layerIds.includes(layerId)) {
        const updatedLayerIds = [...map.layerIds, layerId];
        return await this.update(mapId, { layerIds: updatedLayerIds });
      }

      return map;
    } catch (error) {
      console.error('Erro ao adicionar camada ao mapa:', error);
      throw new Error(
        `Falha ao adicionar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Remover camada do mapa
   */
  async removeLayer(mapId: string, layerId: string): Promise<MapConfig> {
    try {
      const map = await this.getById(mapId);
      if (!map) {
        throw new Error('Mapa não encontrado');
      }

      const updatedLayerIds = map.layerIds.filter(id => id !== layerId);
      return await this.update(mapId, { layerIds: updatedLayerIds });
    } catch (error) {
      console.error('Erro ao remover camada do mapa:', error);
      throw new Error(
        `Falha ao remover camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Reordenar camadas no mapa
   */
  async reorderLayers(mapId: string, layerIds: string[]): Promise<MapConfig> {
    try {
      const map = await this.getById(mapId);
      if (!map) {
        throw new Error('Mapa não encontrado');
      }

      // Verificar se todos os IDs são válidos
      const validIds = layerIds.filter(id => map.layerIds.includes(id));

      if (validIds.length !== layerIds.length) {
        throw new Error('Alguns IDs de camada são inválidos');
      }

      return await this.update(mapId, { layerIds: layerIds });
    } catch (error) {
      console.error('Erro ao reordenar camadas do mapa:', error);
      throw new Error(
        `Falha ao reordenar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Atualizar viewport do mapa
   */
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
   * Duplicar mapa
   */
  async duplicate(id: string, newName?: string): Promise<MapConfig> {
    try {
      const originalMap = await this.getById(id);
      if (!originalMap) {
        throw new Error('Mapa não encontrado');
      }

      const duplicatedMap: MapConfig = {
        ...originalMap,
        id: crypto.randomUUID(),
        name: newName || `${originalMap.name} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return await this.create(duplicatedMap);
    } catch (error) {
      console.error('Erro ao duplicar mapa:', error);
      throw new Error(
        `Falha ao duplicar mapa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Contar mapas
   */
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

  /**
   * Verificar se mapa existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const map = await db.maps.get(id);
      return !!map;
    } catch (error) {
      console.error('Erro ao verificar existência do mapa:', error);
      return false;
    }
  }

  /**
   * Buscar mapas que contêm uma camada específica
   */
  async getMapsByLayerId(layerId: string): Promise<MapConfig[]> {
    try {
      const allMaps = await this.getAll();
      return allMaps.filter(map => map.layerIds.includes(layerId));
    } catch (error) {
      console.error('Erro ao buscar mapas por camada:', error);
      throw new Error(
        `Falha ao buscar mapas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }
}
