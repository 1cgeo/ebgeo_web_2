// Path: features\data-access\repositories\implementations\MapRepository.ts

import { db } from '../../db';
import { MapConfig, validateMapConfig } from '../../schemas/map.schema';
import { IMapRepository } from '../interfaces/IRepositoryInterfaces';

export class MapRepository implements IMapRepository {
  async create(map: MapConfig): Promise<MapConfig> {
    const validated = validateMapConfig(map);
    await db.maps.add(validated);
    return validated;
  }

  async createMany(maps: MapConfig[]): Promise<MapConfig[]> {
    const validated = maps.map(m => validateMapConfig(m));
    await db.maps.bulkAdd(validated);
    return validated;
  }

  async getById(id: string): Promise<MapConfig | null> {
    return (await db.maps.get(id)) || null;
  }

  async getAll(): Promise<MapConfig[]> {
    return await db.maps.orderBy('updatedAt').reverse().toArray();
  }

  async update(id: string, updates: Partial<MapConfig>): Promise<MapConfig> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Mapa não encontrado');
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const validated = validateMapConfig(updated);
    await db.maps.update(id, validated);
    return validated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await db.maps.delete(id);
    if (deleted === 0) {
      throw new Error('Mapa não encontrado');
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    await db.maps.bulkDelete(ids);
  }

  async addLayer(mapId: string, layerId: string): Promise<MapConfig> {
    const map = await this.getById(mapId);
    if (!map) {
      throw new Error('Mapa não encontrado');
    }

    if (!map.layerIds.includes(layerId)) {
      const updatedLayerIds = [...map.layerIds, layerId];
      return await this.update(mapId, { layerIds: updatedLayerIds });
    }

    return map;
  }

  async removeLayer(mapId: string, layerId: string): Promise<MapConfig> {
    const map = await this.getById(mapId);
    if (!map) {
      throw new Error('Mapa não encontrado');
    }

    const updatedLayerIds = map.layerIds.filter(id => id !== layerId);
    return await this.update(mapId, { layerIds: updatedLayerIds });
  }

  async reorderLayers(mapId: string, layerIds: string[]): Promise<MapConfig> {
    return await this.update(mapId, { layerIds });
  }

  async updateViewport(id: string, center: [number, number], zoom: number): Promise<MapConfig> {
    return await this.update(id, { center, zoom });
  }

  async count(): Promise<number> {
    return await db.maps.count();
  }

  async exists(id: string): Promise<boolean> {
    return (await db.maps.get(id)) !== undefined;
  }
}
