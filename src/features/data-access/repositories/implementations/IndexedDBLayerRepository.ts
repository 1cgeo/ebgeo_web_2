// Path: features\data-access\repositories\implementations\IndexedDBLayerRepository.ts
import { db } from '../../db';
import { LayerConfig, validateLayerConfig } from '../../schemas/layer.schema';
import { ILayerRepository } from '../interfaces/ILayerRepository';

export class IndexedDBLayerRepository implements ILayerRepository {
  /**
   * Criar nova camada
   */
  async create(layer: LayerConfig): Promise<LayerConfig> {
    try {
      const validatedLayer = validateLayerConfig(layer);
      await db.layers.add(validatedLayer);
      return validatedLayer;
    } catch (error) {
      console.error('Erro ao criar camada:', error);
      throw new Error(
        `Falha ao criar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Buscar camada por ID
   */
  async getById(id: string): Promise<LayerConfig | null> {
    try {
      const layer = await db.layers.get(id);
      return layer || null;
    } catch (error) {
      console.error('Erro ao buscar camada por ID:', error);
      throw new Error(
        `Falha ao buscar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Buscar todas as camadas
   */
  async getAll(): Promise<LayerConfig[]> {
    try {
      return await db.layers.orderBy('zIndex').toArray();
    } catch (error) {
      console.error('Erro ao buscar todas as camadas:', error);
      throw new Error(
        `Falha ao buscar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Atualizar camada
   */
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
      throw new Error(
        `Falha ao atualizar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Deletar camada
   */
  async delete(id: string): Promise<void> {
    try {
      const deleted = await db.layers.delete(id);
      if (deleted === 0) {
        throw new Error('Camada não encontrada');
      }
    } catch (error) {
      console.error('Erro ao deletar camada:', error);
      throw new Error(
        `Falha ao deletar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Reordenar camadas
   */
  async reorder(layerOrders: Array<{ id: string; zIndex: number }>): Promise<LayerConfig[]> {
    try {
      const results: LayerConfig[] = [];

      await db.transaction('rw', [db.layers], async () => {
        for (const { id, zIndex } of layerOrders) {
          const updatedLayer = await this.update(id, { zIndex });
          results.push(updatedLayer);
        }
      });

      // Retornar camadas ordenadas
      return results.sort((a, b) => a.zIndex - b.zIndex);
    } catch (error) {
      console.error('Erro ao reordenar camadas:', error);
      throw new Error(
        `Falha ao reordenar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Verificar se uma camada pode ser deletada (sem features)
   */
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

  /**
   * Deletar camada junto com suas features
   */
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
      throw new Error(
        `Falha ao deletar camada: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Contar camadas
   */
  async count(): Promise<number> {
    try {
      return await db.layers.count();
    } catch (error) {
      console.error('Erro ao contar camadas:', error);
      throw new Error(
        `Falha ao contar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Verificar se camada existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const layer = await db.layers.get(id);
      return !!layer;
    } catch (error) {
      console.error('Erro ao verificar existência da camada:', error);
      return false;
    }
  }

  /**
   * Obter próximo zIndex disponível
   */
  async getNextZIndex(): Promise<number> {
    try {
      const layers = await db.layers.orderBy('zIndex').reverse().limit(1).toArray();
      return layers.length > 0 ? layers[0].zIndex + 1 : 0;
    } catch (error) {
      console.error('Erro ao obter próximo zIndex:', error);
      return 0;
    }
  }

  /**
   * Buscar camadas visíveis
   */
  async getVisible(): Promise<LayerConfig[]> {
    try {
      return await db.layers.where('visible').equals(true).sortBy('zIndex');
    } catch (error) {
      console.error('Erro ao buscar camadas visíveis:', error);
      throw new Error(
        `Falha ao buscar camadas visíveis: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Alternar visibilidade da camada
   */
  async toggleVisibility(id: string): Promise<LayerConfig> {
    try {
      const layer = await this.getById(id);
      if (!layer) {
        throw new Error('Camada não encontrada');
      }

      return await this.update(id, { visible: !layer.visible });
    } catch (error) {
      console.error('Erro ao alternar visibilidade da camada:', error);
      throw new Error(
        `Falha ao alternar visibilidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }
}
