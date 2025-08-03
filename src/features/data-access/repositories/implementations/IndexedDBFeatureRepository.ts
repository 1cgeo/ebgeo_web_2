// Path: features/data-access/repositories/implementations/IndexedDBFeatureRepository.ts

import { db } from '../../db';
import { ExtendedFeature, validateFeature } from '../../schemas/feature.schema';
import { IFeatureRepository, FeatureFilters, FeatureSortOptions } from '../interfaces/IFeatureRepository';
import * as turf from '@turf/turf';

export class IndexedDBFeatureRepository implements IFeatureRepository {
  
  async create(feature: ExtendedFeature): Promise<ExtendedFeature> {
    try {
      const validatedFeature = validateFeature(feature);
      await db.features.add(validatedFeature);
      return validatedFeature;
    } catch (error) {
      console.error('Erro ao criar feature:', error);
      throw new Error(`Falha ao criar feature: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getById(id: string): Promise<ExtendedFeature | null> {
    try {
      const feature = await db.features.get(id);
      return feature || null;
    } catch (error) {
      console.error('Erro ao buscar feature por ID:', error);
      throw new Error(`Falha ao buscar feature: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getAll(): Promise<ExtendedFeature[]> {
    try {
      return await db.features.toArray();
    } catch (error) {
      console.error('Erro ao buscar todas as features:', error);
      throw new Error(`Falha ao buscar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

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
      throw new Error(`Falha ao atualizar feature: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deleted = await db.features.delete(id);
      if (deleted === 0) {
        throw new Error('Feature não encontrada');
      }
    } catch (error) {
      console.error('Erro ao deletar feature:', error);
      throw new Error(`Falha ao deletar feature: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createMany(features: ExtendedFeature[]): Promise<ExtendedFeature[]> {
    try {
      const validatedFeatures = features.map(feature => validateFeature(feature));
      await db.features.bulkAdd(validatedFeatures);
      return validatedFeatures;
    } catch (error) {
      console.error('Erro ao criar múltiplas features:', error);
      throw new Error(`Falha ao criar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    try {
      await db.features.bulkDelete(ids);
    } catch (error) {
      console.error('Erro ao deletar múltiplas features:', error);
      throw new Error(`Falha ao deletar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await db.features.count();
    } catch (error) {
      console.error('Erro ao contar features:', error);
      throw new Error(`Falha ao contar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const feature = await db.features.get(id);
      return !!feature;
    } catch (error) {
      console.error('Erro ao verificar existência da feature:', error);
      return false;
    }
  }

  async search(query: string): Promise<ExtendedFeature[]> {
    try {
      const lowerQuery = query.toLowerCase();
      return await db.features
        .filter(feature => 
          feature.properties.name?.toLowerCase().includes(lowerQuery) ||
          feature.properties.description?.toLowerCase().includes(lowerQuery)
        )
        .toArray();
    } catch (error) {
      console.error('Erro ao buscar features:', error);
      throw new Error(`Falha na busca: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getByLayerId(layerId: string): Promise<ExtendedFeature[]> {
    try {
      return await db.features
        .where('properties.layerId')
        .equals(layerId)
        .toArray();
    } catch (error) {
      console.error('Erro ao buscar features por camada:', error);
      throw new Error(`Falha ao buscar por camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getByLayerIds(layerIds: string[]): Promise<ExtendedFeature[]> {
    try {
      return await db.features
        .where('properties.layerId')
        .anyOf(layerIds)
        .toArray();
    } catch (error) {
      console.error('Erro ao buscar features por múltiplas camadas:', error);
      throw new Error(`Falha ao buscar por camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getByBoundingBox(
    minLng: number,
    minLat: number,
    maxLng: number,
    maxLat: number
  ): Promise<ExtendedFeature[]> {
    try {
      const allFeatures = await this.getAll();
      
      // Filtrar usando Turf.js para busca espacial
      const bbox = turf.bboxPolygon([minLng, minLat, maxLng, maxLat]);
      
      return allFeatures.filter(feature => {
        try {
          return turf.booleanIntersects(feature as any, bbox);
        } catch {
          // Em caso de erro na geometria, incluir na busca por segurança
          return true;
        }
      });
    } catch (error) {
      console.error('Erro ao buscar features por bounding box:', error);
      throw new Error(`Falha na busca espacial: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getByRadius(
    centerLng: number,
    centerLat: number,
    radiusMeters: number
  ): Promise<ExtendedFeature[]> {
    try {
      const allFeatures = await this.getAll();
      const center = turf.point([centerLng, centerLat]);
      
      return allFeatures.filter(feature => {
        try {
          const distance = turf.distance(center, turf.center(feature as any), { units: 'meters' });
          return distance <= radiusMeters;
        } catch {
          // Em caso de erro na geometria, excluir da busca
          return false;
        }
      });
    } catch (error) {
      console.error('Erro ao buscar features por raio:', error);
      throw new Error(`Falha na busca por proximidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getByGeometryType(geometryType: string): Promise<ExtendedFeature[]> {
    try {
      return await db.features
        .filter(feature => feature.geometry.type === geometryType)
        .toArray();
    } catch (error) {
      console.error('Erro ao buscar features por tipo de geometria:', error);
      throw new Error(`Falha ao buscar por geometria: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async moveToLayer(featureIds: string[], targetLayerId: string): Promise<ExtendedFeature[]> {
    try {
      const updatedFeatures: ExtendedFeature[] = [];
      
      for (const featureId of featureIds) {
        const updatedFeature = await this.update(featureId, {
          properties: {
            layerId: targetLayerId,
            updatedAt: new Date().toISOString(),
          },
        } as Partial<ExtendedFeature>);
        
        updatedFeatures.push(updatedFeature);
      }
      
      return updatedFeatures;
    } catch (error) {
      console.error('Erro ao mover features para camada:', error);
      throw new Error(`Falha ao mover para camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async duplicate(featureIds: string[], targetLayerId?: string): Promise<ExtendedFeature[]> {
    try {
      const originalFeatures = await Promise.all(
        featureIds.map(id => this.getById(id))
      );
      
      const validFeatures = originalFeatures.filter(Boolean) as ExtendedFeature[];
      
      if (validFeatures.length === 0) {
        throw new Error('Nenhuma feature válida encontrada para duplicar');
      }
      
      const now = new Date().toISOString();
      
      const duplicatedFeatures: ExtendedFeature[] = validFeatures.map(feature => {
        const duplicatedId = `${feature.id}_copy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          ...feature,
          id: duplicatedId,
          properties: {
            ...feature.properties,
            id: duplicatedId,
            layerId: targetLayerId || feature.properties.layerId,
            name: feature.properties.name ? 
              `${feature.properties.name} (Cópia)` : undefined,
            createdAt: now,
            updatedAt: now,
          },
        };
      });

      await db.features.bulkAdd(duplicatedFeatures);
      return duplicatedFeatures;
    } catch (error) {
      console.error('Erro ao duplicar features:', error);
      throw new Error(`Falha ao duplicar features: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getLayerStats(layerId: string): Promise<{
    count: number;
    geometryTypes: Record<string, number>;
    boundingBox?: [number, number, number, number];
  }> {
    try {
      const features = await this.getByLayerId(layerId);
      const count = features.length;
      
      const geometryTypes: Record<string, number> = {};
      features.forEach(feature => {
        const type = feature.geometry.type;
        geometryTypes[type] = (geometryTypes[type] || 0) + 1;
      });

      let boundingBox: [number, number, number, number] | undefined;
      if (features.length > 0) {
        try {
          const featureCollection = turf.featureCollection(features as any);
          const bbox = turf.bbox(featureCollection);
          boundingBox = bbox as [number, number, number, number];
        } catch {
          // Ignorar erro de bbox se houver features inválidas
        }
      }

      return { count, geometryTypes, boundingBox };
    } catch (error) {
      console.error('Erro ao obter estatísticas da camada:', error);
      throw new Error(`Falha ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async validateFeature(feature: ExtendedFeature): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      validateFeature(feature);
    } catch (error) {
      errors.push(`Erro de validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    // Verificar se a camada existe
    try {
      const layerExists = await db.layers.get(feature.properties.layerId);
      if (!layerExists) {
        errors.push('Camada de destino não existe');
      }
    } catch (error) {
      errors.push('Erro ao verificar camada de destino');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // NOVO: Método para obter features órfãs
  async getOrphanedFeatures(): Promise<ExtendedFeature[]> {
    try {
      const features = await this.getAll();
      const layers = await db.layers.toArray();
      const validLayerIds = new Set(layers.map(layer => layer.id));
      
      return features.filter(
        feature => !validLayerIds.has(feature.properties.layerId)
      );
    } catch (error) {
      console.error('Erro ao buscar features órfãs:', error);
      throw new Error(`Falha ao buscar órfãs: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async cleanOrphanedFeatures(): Promise<string[]> {
    try {
      const orphanedFeatures = await this.getOrphanedFeatures();
      const orphanedIds = orphanedFeatures.map(feature => feature.id);
      
      if (orphanedIds.length > 0) {
        await this.deleteMany(orphanedIds);
      }
      
      return orphanedIds;
    } catch (error) {
      console.error('Erro ao limpar features órfãs:', error);
      throw new Error(`Falha na limpeza: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}