// Path: features\data-access\repositories\implementations\IndexedDBMapRepository.ts

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

  async removeLayer(mapId: string, layerId: string): Promise<MapConfig> {
    try {
      const map = await this.getById(mapId);
      if (!map) {
        throw new Error('Mapa não encontrado');
      }

      // Verificar se é a última camada
      if (map.layerIds.length <= 1) {
        throw new Error(
          'Não é possível remover a última camada do mapa. Deve haver pelo menos 1 camada.'
        );
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

  async reorderLayers(mapId: string, layerIds: string[]): Promise<MapConfig> {
    try {
      const map = await this.getById(mapId);
      if (!map) {
        throw new Error('Mapa não encontrado');
      }

      // Verificar se todos os IDs estão presentes
      if (
        layerIds.length !== map.layerIds.length ||
        !layerIds.every(id => map.layerIds.includes(id))
      ) {
        throw new Error('Lista de camadas inválida para reordenação');
      }

      return await this.update(mapId, { layerIds });
    } catch (error) {
      console.error('Erro ao reordenar camadas do mapa:', error);
      throw new Error(
        `Falha ao reordenar camadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
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

  async getMapStats(id: string): Promise<{
    layerCount: number;
    totalFeatures: number;
    lastModified: string;
    boundingBox?: [number, number, number, number];
  }> {
    try {
      const mapWithLayers = await this.getWithLayers(id);
      if (!mapWithLayers) {
        throw new Error('Mapa não encontrado');
      }

      const { map, layers } = mapWithLayers;

      // Contar features de todas as camadas
      let totalFeatures = 0;
      let lastModified = map.updatedAt;
      let allCoords: [number, number][] = [];

      for (const layer of layers) {
        const features = await db.features.where('properties.layerId').equals(layer.id).toArray();
        totalFeatures += features.length;

        // Verificar última modificação
        features.forEach(feature => {
          if (feature.properties.updatedAt > lastModified) {
            lastModified = feature.properties.updatedAt;
          }

          // Coletar coordenadas para bounding box
          if (feature.geometry.type === 'Point') {
            allCoords.push(feature.geometry.coordinates as [number, number]);
          } else if (feature.geometry.type === 'LineString') {
            allCoords.push(...(feature.geometry.coordinates as [number, number][]));
          } else if (feature.geometry.type === 'Polygon') {
            allCoords.push(...(feature.geometry.coordinates[0] as [number, number][]));
          }
        });
      }

      // Calcular bounding box
      let boundingBox: [number, number, number, number] | undefined;
      if (allCoords.length > 0) {
        const lngs = allCoords.map(coord => coord[0]);
        const lats = allCoords.map(coord => coord[1]);
        boundingBox = [
          Math.min(...lngs), // minLng
          Math.min(...lats), // minLat
          Math.max(...lngs), // maxLng
          Math.max(...lats), // maxLat
        ];
      }

      return {
        layerCount: layers.length,
        totalFeatures,
        lastModified,
        boundingBox,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do mapa:', error);
      throw new Error(
        `Falha ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

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

      // Verificar se as camadas referenciadas existem
      for (const layerId of map.layerIds) {
        const layer = await db.layers.get(layerId);
        if (!layer) {
          missingLayers.push(layerId);
          issues.push(`Camada ${layerId} não encontrada`);
        }
      }

      // Verificar limite mínimo de camadas
      const existingLayers = map.layerIds.length - missingLayers.length;
      if (existingLayers === 0) {
        issues.push('Mapa deve ter pelo menos 1 camada válida');
      }

      // Verificar limite máximo de camadas
      if (map.layerIds.length > 10) {
        issues.push('Mapa não pode ter mais de 10 camadas');
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

  async cleanupLayerReferences(deletedLayerId: string): Promise<MapConfig[]> {
    try {
      const allMaps = await this.getAll();
      const updatedMaps: MapConfig[] = [];

      for (const map of allMaps) {
        if (map.layerIds.includes(deletedLayerId)) {
          const newLayerIds = map.layerIds.filter(id => id !== deletedLayerId);

          // Se ficar sem camadas, pular (será tratado pela validação)
          if (newLayerIds.length === 0) {
            console.warn(`Mapa ${map.name} ficou sem camadas após remoção de ${deletedLayerId}`);
            continue;
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

  async exportMapData(id: string): Promise<{
    map: MapConfig;
    layers: LayerConfig[];
    featureCount: number;
  }> {
    try {
      const mapWithLayers = await this.getWithLayers(id);
      if (!mapWithLayers) {
        throw new Error('Mapa não encontrado');
      }

      const { map, layers } = mapWithLayers;

      // Contar features
      let featureCount = 0;
      for (const layer of layers) {
        const count = await db.features.where('properties.layerId').equals(layer.id).count();
        featureCount += count;
      }

      return {
        map,
        layers,
        featureCount,
      };
    } catch (error) {
      console.error('Erro ao exportar dados do mapa:', error);
      throw new Error(
        `Falha na exportação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Métodos auxiliares específicos para a aplicação
  async ensureDefaultMap(): Promise<MapConfig> {
    try {
      const mapCount = await this.count();

      if (mapCount === 0) {
        // Criar mapa padrão
        const now = new Date().toISOString();
        const defaultMap: MapConfig = {
          id: crypto.randomUUID(),
          name: 'Mapa Padrão',
          description: 'Mapa padrão criado automaticamente',
          layerIds: [],
          center: [-51.2177, -30.0346], // Porto Alegre
          zoom: 10,
          createdAt: now,
          updatedAt: now,
        };

        return await this.create(defaultMap);
      }

      // Retornar o primeiro mapa disponível
      const maps = await this.getAll();
      return maps[0];
    } catch (error) {
      console.error('Erro ao garantir mapa padrão:', error);
      throw new Error(
        `Falha ao criar mapa padrão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async canDelete(id: string): Promise<{
    canDelete: boolean;
    reason?: string;
    layerCount: number;
    featureCount: number;
  }> {
    try {
      const mapCount = await this.count();

      if (mapCount <= 1) {
        return {
          canDelete: false,
          reason: 'Não é possível deletar o último mapa. Deve haver pelo menos 1 mapa.',
          layerCount: 0,
          featureCount: 0,
        };
      }

      const stats = await this.getMapStats(id);

      return {
        canDelete: true,
        layerCount: stats.layerCount,
        featureCount: stats.totalFeatures,
      };
    } catch (error) {
      console.error('Erro ao verificar se pode deletar mapa:', error);
      return {
        canDelete: false,
        reason: 'Erro ao verificar dados do mapa',
        layerCount: 0,
        featureCount: 0,
      };
    }
  }
}
