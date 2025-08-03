// Path: features\data-access\repositories\implementations\IndexedDBLayerRepository.ts

import { db } from '../../db';
import { LayerConfig, validateLayerConfig } from '../../schemas/layer.schema';
import { ILayerRepository, CreateLayerOptions, ReorderResult } from '../interfaces/ILayerRepository';

export class IndexedDBLayerRepository implements ILayerRepository {
  
  async create(layer: LayerConfig): Promise<LayerConfig> {
    try {
      const validatedLayer = validateLayerConfig(layer);
      await db.layers.add(validatedLayer);
      return validatedLayer;
    } catch (error) {
      console.error('Erro ao criar camada:', error);
      throw new Error(`Falha ao criar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getById(id: string): Promise<LayerConfig | null> {
    try {
      const layer = await db.layers.get(id);
      return layer || null;
    } catch (error) {
      console.error('Erro ao buscar camada por ID:', error);
      throw new Error(`Falha ao buscar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getAll(): Promise<LayerConfig[]> {
    try {
      return await db.layers.orderBy('zIndex').toArray();
    } catch (error) {
      console.error('Erro ao buscar todas as camadas:', error);
      throw new Error(`Falha ao buscar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async update(id: string, updates: Partial<LayerConfig>): Promise<LayerConfig> {
    try {
      const existingLayer = await this.getById(id);
      if (!existingLayer) {
        throw new Error('Camada não encontrada');
      }

      const updatedLayer = {
        ...existingLayer,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const validatedLayer = validateLayerConfig(updatedLayer);
      await db.layers.update(id, validatedLayer);
      return validatedLayer;
    } catch (error) {
      console.error('Erro ao atualizar camada:', error);
      throw new Error(`Falha ao atualizar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const deleted = await db.layers.delete(id);
      if (deleted === 0) {
        throw new Error('Camada não encontrada');
      }
    } catch (error) {
      console.error('Erro ao deletar camada:', error);
      throw new Error(`Falha ao deletar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createMany(layers: LayerConfig[]): Promise<LayerConfig[]> {
    try {
      const validatedLayers = layers.map(layer => validateLayerConfig(layer));
      await db.layers.bulkAdd(validatedLayers);
      return validatedLayers;
    } catch (error) {
      console.error('Erro ao criar múltiplas camadas:', error);
      throw new Error(`Falha ao criar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    try {
      await db.layers.bulkDelete(ids);
    } catch (error) {
      console.error('Erro ao deletar múltiplas camadas:', error);
      throw new Error(`Falha ao deletar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await db.layers.count();
    } catch (error) {
      console.error('Erro ao contar camadas:', error);
      throw new Error(`Falha ao contar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const layer = await db.layers.get(id);
      return !!layer;
    } catch (error) {
      console.error('Erro ao verificar existência da camada:', error);
      return false;
    }
  }

  async getByName(name: string): Promise<LayerConfig | null> {
    try {
      const layer = await db.layers.where('name').equals(name).first();
      return layer || null;
    } catch (error) {
      console.error('Erro ao buscar camada por nome:', error);
      throw new Error(`Falha ao buscar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      const layer = await this.getByName(name);
      return layer !== null && layer.id !== excludeId;
    } catch (error) {
      console.error('Erro ao verificar nome da camada:', error);
      return false;
    }
  }

  async reorder(layerIds: string[]): Promise<LayerConfig[]> {
    try {
      const layers = await db.layers.where('id').anyOf(layerIds).toArray();
      
      if (layers.length !== layerIds.length) {
        throw new Error('Algumas camadas não foram encontradas');
      }

      const updatedLayers = layerIds.map((id, index) => {
        const layer = layers.find(l => l.id === id)!;
        return {
          ...layer,
          zIndex: index,
          updatedAt: new Date().toISOString(),
        };
      });

      await db.layers.bulkPut(updatedLayers);
      return updatedLayers;
    } catch (error) {
      console.error('Erro ao reordenar camadas:', error);
      throw new Error(`Falha ao reordenar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async toggleVisibility(id: string): Promise<LayerConfig> {
    try {
      const layer = await this.getById(id);
      if (!layer) {
        throw new Error('Camada não encontrada');
      }

      return await this.update(id, { visible: !layer.visible });
    } catch (error) {
      console.error('Erro ao alternar visibilidade:', error);
      throw new Error(`Falha ao alternar visibilidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async updateOpacity(id: string, opacity: number): Promise<LayerConfig> {
    try {
      if (opacity < 0 || opacity > 1) {
        throw new Error('Opacidade deve estar entre 0 e 1');
      }

      return await this.update(id, { opacity });
    } catch (error) {
      console.error('Erro ao atualizar opacidade:', error);
      throw new Error(`Falha ao atualizar opacidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getVisibleLayers(): Promise<LayerConfig[]> {
    try {
      return await db.layers
        .where('visible')
        .equals(true)
        .sortBy('zIndex');
    } catch (error) {
      console.error('Erro ao buscar camadas visíveis:', error);
      throw new Error(`Falha ao buscar camadas visíveis: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getNextZIndex(): Promise<number> {
    try {
      const layers = await db.layers.orderBy('zIndex').reverse().limit(1).toArray();
      return layers.length > 0 ? layers[0].zIndex + 1 : 0;
    } catch (error) {
      console.error('Erro ao obter próximo zIndex:', error);
      return 0;
    }
  }

  async duplicate(id: string, newName: string): Promise<LayerConfig> {
    try {
      const layer = await this.getById(id);
      if (!layer) {
        throw new Error('Camada não encontrada');
      }

      if (await this.nameExists(newName)) {
        throw new Error('Nome da camada já existe');
      }

      const now = new Date().toISOString();
      const newLayer: LayerConfig = {
        ...layer,
        id: crypto.randomUUID(),
        name: newName,
        zIndex: await this.getNextZIndex(),
        createdAt: now,
        updatedAt: now,
      };

      return await this.create(newLayer);
    } catch (error) {
      console.error('Erro ao duplicar camada:', error);
      throw new Error(`Falha ao duplicar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getLayerStats(id: string): Promise<{
    featureCount: number;
    lastModified: string;
    geometryTypes: Record<string, number>;
  }> {
    try {
      const features = await db.features.where('properties.layerId').equals(id).toArray();
      const featureCount = features.length;
      
      const geometryTypes: Record<string, number> = {};
      features.forEach(feature => {
        const type = feature.geometry.type;
        geometryTypes[type] = (geometryTypes[type] || 0) + 1;
      });

      // Encontrar a data da última modificação
      let lastModified = '';
      if (features.length > 0) {
        const sortedFeatures = features.sort((a, b) => 
          new Date(b.properties.updatedAt).getTime() - new Date(a.properties.updatedAt).getTime()
        );
        lastModified = sortedFeatures[0].properties.updatedAt;
      }

      return { featureCount, lastModified, geometryTypes };
    } catch (error) {
      console.error('Erro ao obter estatísticas da camada:', error);
      throw new Error(`Falha ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async canDelete(id: string): Promise<{
    canDelete: boolean;
    featureCount: number;
    reason?: string;
  }> {
    try {
      const featureCount = await db.features.where('properties.layerId').equals(id).count();
      
      if (featureCount > 0) {
        return {
          canDelete: false,
          featureCount,
          reason: `A camada contém ${featureCount} feature(s). Delete as features primeiro ou use deleteWithFeatures().`,
        };
      }

      return {
        canDelete: true,
        featureCount: 0,
      };
    } catch (error) {
      console.error('Erro ao verificar se pode deletar camada:', error);
      return {
        canDelete: false,
        featureCount: 0,
        reason: 'Erro ao verificar features da camada',
      };
    }
  }

  async deleteWithFeatures(id: string): Promise<void> {
    try {
      await db.transaction('rw', [db.layers, db.features], async () => {
        // Deletar todas as features da camada
        await db.features.where('properties.layerId').equals(id).delete();
        
        // Deletar a camada
        await db.layers.delete(id);
      });
    } catch (error) {
      console.error('Erro ao deletar camada com features:', error);
      throw new Error(`Falha ao deletar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}