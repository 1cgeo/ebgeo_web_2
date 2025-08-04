// Path: features\data-access\repositories\implementations\IndexedDBFeatureRepository.ts
import { db } from '../../db';
import { ExtendedFeature, validateFeature } from '../../schemas/feature.schema';
import { IFeatureRepository } from '../interfaces/IFeatureRepository';

export class IndexedDBFeatureRepository implements IFeatureRepository {
  /**
   * Criar uma nova feature
   */
  async create(feature: ExtendedFeature): Promise<ExtendedFeature> {
    try {
      const validatedFeature = validateFeature(feature);
      await db.features.add(validatedFeature);
      return validatedFeature;
    } catch (error) {
      console.error('Erro ao criar feature:', error);
      throw new Error(
        `Falha ao criar feature: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Criar múltiplas features
   */
  async createMany(features: ExtendedFeature[]): Promise<ExtendedFeature[]> {
    try {
      const validatedFeatures = features.map(feature => validateFeature(feature));
      await db.features.bulkAdd(validatedFeatures);
      return validatedFeatures;
    } catch (error) {
      console.error('Erro ao criar features em lote:', error);
      throw new Error(
        `Falha ao criar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Buscar feature por ID
   */
  async getById(id: string): Promise<ExtendedFeature | null> {
    try {
      const feature = await db.features.get(id);
      return feature || null;
    } catch (error) {
      console.error('Erro ao buscar feature por ID:', error);
      throw new Error(
        `Falha ao buscar feature: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Buscar todas as features
   */
  async getAll(): Promise<ExtendedFeature[]> {
    try {
      return await db.features.orderBy('properties.createdAt').reverse().toArray();
    } catch (error) {
      console.error('Erro ao buscar todas as features:', error);
      throw new Error(
        `Falha ao buscar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Buscar features por camada
   */
  async getByLayerId(layerId: string): Promise<ExtendedFeature[]> {
    try {
      return await db.features.where('properties.layerId').equals(layerId).toArray();
    } catch (error) {
      console.error('Erro ao buscar features por camada:', error);
      throw new Error(
        `Falha ao buscar features da camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Buscar features por múltiplas camadas
   */
  async getByLayerIds(layerIds: string[]): Promise<ExtendedFeature[]> {
    try {
      return await db.features.where('properties.layerId').anyOf(layerIds).toArray();
    } catch (error) {
      console.error('Erro ao buscar features por camadas:', error);
      throw new Error(
        `Falha ao buscar features das camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Atualizar feature
   */
  async update(id: string, updates: Partial<ExtendedFeature>): Promise<ExtendedFeature> {
    try {
      const existingFeature = await this.getById(id);
      if (!existingFeature) {
        throw new Error('Feature não encontrada');
      }

      const updatedFeature = {
        ...existingFeature,
        ...updates,
        properties: {
          ...existingFeature.properties,
          ...updates.properties,
          updatedAt: new Date().toISOString(),
        },
      };

      const validatedFeature = validateFeature(updatedFeature);
      await db.features.update(id, validatedFeature);
      return validatedFeature;
    } catch (error) {
      console.error('Erro ao atualizar feature:', error);
      throw new Error(
        `Falha ao atualizar feature: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Atualizar múltiplas features
   */
  async updateMany(
    updates: Array<{ id: string; data: Partial<ExtendedFeature> }>
  ): Promise<ExtendedFeature[]> {
    try {
      const results: ExtendedFeature[] = [];

      await db.transaction('rw', [db.features], async () => {
        for (const { id, data } of updates) {
          const updatedFeature = await this.update(id, data);
          results.push(updatedFeature);
        }
      });

      return results;
    } catch (error) {
      console.error('Erro ao atualizar features em lote:', error);
      throw new Error(
        `Falha ao atualizar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Deletar feature
   */
  async delete(id: string): Promise<void> {
    try {
      const deleted = await db.features.delete(id);
      if (deleted === 0) {
        throw new Error('Feature não encontrada');
      }
    } catch (error) {
      console.error('Erro ao deletar feature:', error);
      throw new Error(
        `Falha ao deletar feature: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Deletar múltiplas features
   */
  async deleteMany(ids: string[]): Promise<void> {
    try {
      await db.features.bulkDelete(ids);
    } catch (error) {
      console.error('Erro ao deletar features em lote:', error);
      throw new Error(
        `Falha ao deletar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Deletar todas as features de uma camada
   */
  async deleteByLayerId(layerId: string): Promise<void> {
    try {
      await db.features.where('properties.layerId').equals(layerId).delete();
    } catch (error) {
      console.error('Erro ao deletar features da camada:', error);
      throw new Error(
        `Falha ao deletar features da camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Contar features total
   */
  async count(): Promise<number> {
    try {
      return await db.features.count();
    } catch (error) {
      console.error('Erro ao contar features:', error);
      throw new Error(
        `Falha ao contar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Contar features por camada
   */
  async countByLayerId(layerId: string): Promise<number> {
    try {
      return await db.features.where('properties.layerId').equals(layerId).count();
    } catch (error) {
      console.error('Erro ao contar features da camada:', error);
      throw new Error(
        `Falha ao contar features da camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Verificar se feature existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const feature = await db.features.get(id);
      return !!feature;
    } catch (error) {
      console.error('Erro ao verificar existência da feature:', error);
      return false;
    }
  }

  /**
   * Mover features para outra camada
   */
  async moveToLayer(featureIds: string[], targetLayerId: string): Promise<ExtendedFeature[]> {
    try {
      const results: ExtendedFeature[] = [];

      await db.transaction('rw', [db.features], async () => {
        for (const featureId of featureIds) {
          const updatedFeature = await this.update(featureId, {
            properties: { layerId: targetLayerId },
          });
          results.push(updatedFeature);
        }
      });

      return results;
    } catch (error) {
      console.error('Erro ao mover features para camada:', error);
      throw new Error(
        `Falha ao mover features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }
}
