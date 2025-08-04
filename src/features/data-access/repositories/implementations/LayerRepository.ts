// Path: features\data-access\repositories\implementations\LayerRepository.ts

import { db } from '../../db';
import { LayerConfig, validateLayerConfig } from '../../schemas/layer.schema';
import { ILayerRepository } from '../interfaces/IRepositoryInterfaces';

export class LayerRepository implements ILayerRepository {
  async create(layer: LayerConfig): Promise<LayerConfig> {
    const validated = validateLayerConfig(layer);
    await db.layers.add(validated);
    return validated;
  }

  async createMany(layers: LayerConfig[]): Promise<LayerConfig[]> {
    const validated = layers.map(l => validateLayerConfig(l));
    await db.layers.bulkAdd(validated);
    return validated;
  }

  async getById(id: string): Promise<LayerConfig | null> {
    return (await db.layers.get(id)) || null;
  }

  async getAll(): Promise<LayerConfig[]> {
    return await db.layers.orderBy('zIndex').toArray();
  }

  async update(id: string, updates: Partial<LayerConfig>): Promise<LayerConfig> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Camada não encontrada');
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const validated = validateLayerConfig(updated);
    await db.layers.update(id, validated);
    return validated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await db.layers.delete(id);
    if (deleted === 0) {
      throw new Error('Camada não encontrada');
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    await db.layers.bulkDelete(ids);
  }

  async reorder(layerOrders: Array<{ id: string; zIndex: number }>): Promise<LayerConfig[]> {
    const results: LayerConfig[] = [];

    for (const { id, zIndex } of layerOrders) {
      const updated = await this.update(id, { zIndex });
      results.push(updated);
    }

    return results;
  }

  async getNextZIndex(): Promise<number> {
    const layers = await this.getAll();
    const maxZIndex = Math.max(...layers.map(l => l.zIndex), -1);
    return maxZIndex + 1;
  }

  async toggleVisibility(id: string): Promise<LayerConfig> {
    const layer = await this.getById(id);
    if (!layer) {
      throw new Error('Camada não encontrada');
    }

    return await this.update(id, { visible: !layer.visible });
  }

  async canDelete(id: string): Promise<boolean> {
    const featureCount = await db.features.where('properties.layerId').equals(id).count();

    return featureCount === 0;
  }

  async count(): Promise<number> {
    return await db.layers.count();
  }

  async exists(id: string): Promise<boolean> {
    return (await db.layers.get(id)) !== undefined;
  }
}
