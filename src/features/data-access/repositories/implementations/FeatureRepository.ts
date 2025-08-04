// Path: features\data-access\repositories\implementations\FeatureRepository.ts

import { db } from '../../db';
import { ExtendedFeature, validateFeature } from '../../schemas/feature.schema';
import { IFeatureRepository } from '../interfaces/IRepositoryInterfaces';

export class FeatureRepository implements IFeatureRepository {
  async create(feature: ExtendedFeature): Promise<ExtendedFeature> {
    const validatedFeature = validateFeature(feature);
    await db.features.add(validatedFeature);
    return validatedFeature;
  }

  async createMany(features: ExtendedFeature[]): Promise<ExtendedFeature[]> {
    const validatedFeatures = features.map(f => validateFeature(f));
    await db.features.bulkAdd(validatedFeatures);
    return validatedFeatures;
  }

  async getById(id: string): Promise<ExtendedFeature | null> {
    return (await db.features.get(id)) || null;
  }

  async getAll(): Promise<ExtendedFeature[]> {
    return await db.features.orderBy('properties.createdAt').reverse().toArray();
  }

  async update(id: string, updates: Partial<ExtendedFeature>): Promise<ExtendedFeature> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Feature não encontrada');
    }

    const updated = {
      ...existing,
      ...updates,
      properties: {
        ...existing.properties,
        ...updates.properties,
        updatedAt: new Date().toISOString(),
      },
    };

    const validated = validateFeature(updated);
    await db.features.update(id, validated);
    return validated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await db.features.delete(id);
    if (deleted === 0) {
      throw new Error('Feature não encontrada');
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    await db.features.bulkDelete(ids);
  }

  async getByLayerId(layerId: string): Promise<ExtendedFeature[]> {
    return await db.features.where('properties.layerId').equals(layerId).toArray();
  }

  async deleteByLayerId(layerId: string): Promise<void> {
    await db.features.where('properties.layerId').equals(layerId).delete();
  }

  async moveToLayer(featureIds: string[], targetLayerId: string): Promise<ExtendedFeature[]> {
    const results: ExtendedFeature[] = [];

    for (const id of featureIds) {
      const updated = await this.update(id, {
        properties: { layerId: targetLayerId },
      });
      results.push(updated);
    }

    return results;
  }

  async countByLayerId(layerId: string): Promise<number> {
    return await db.features.where('properties.layerId').equals(layerId).count();
  }

  async count(): Promise<number> {
    return await db.features.count();
  }

  async exists(id: string): Promise<boolean> {
    return (await db.features.get(id)) !== undefined;
  }
}
