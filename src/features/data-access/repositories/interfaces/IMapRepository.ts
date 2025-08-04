// Path: features\data-access\repositories\interfaces\IMapRepository.ts

import { MapConfig } from '../../schemas/map.schema';
import { LayerConfig } from '../../schemas/layer.schema';
import { IRepository } from './IRepository';

// Interface específica para o repository de mapas
export interface IMapRepository extends IRepository<MapConfig> {
  // Busca por nome
  getByName(name: string): Promise<MapConfig | null>;

  // Verificar se nome existe
  nameExists(name: string, excludeId?: string): Promise<boolean>;

  // Obter mapa com suas camadas
  getWithLayers(id: string): Promise<{
    map: MapConfig;
    layers: LayerConfig[];
  } | null>;

  // Adicionar camada ao mapa
  addLayer(mapId: string, layerId: string): Promise<MapConfig>;

  // Remover camada do mapa
  removeLayer(mapId: string, layerId: string): Promise<MapConfig>;

  // Reordenar camadas no mapa
  reorderLayers(mapId: string, layerIds: string[]): Promise<MapConfig>;

  // Duplicar mapa (com ou sem features)
  duplicate(id: string, newName: string, includeFeatures?: boolean): Promise<MapConfig>;

  // Atualizar viewport (centro e zoom)
  updateViewport(id: string, center: [number, number], zoom: number): Promise<MapConfig>;

  // Obter estatísticas do mapa
  getMapStats(id: string): Promise<{
    layerCount: number;
    totalFeatures: number;
    lastModified: string;
    boundingBox?: [number, number, number, number];
  }>;

  // Validar integridade do mapa
  validateMap(id: string): Promise<{
    valid: boolean;
    issues: string[];
    missingLayers: string[];
  }>;

  // Limpar referências de camadas deletadas
  cleanupLayerReferences(deletedLayerId: string): Promise<MapConfig[]>;

  // Exportar dados do mapa
  exportMapData(id: string): Promise<{
    map: MapConfig;
    layers: LayerConfig[];
    featureCount: number;
  }>;
}

// Opções para criação de mapa
export interface CreateMapOptions {
  name: string;
  description?: string;
  center?: [number, number];
  zoom?: number;
  layerIds?: string[];
}

// Opções para duplicação de mapa
export interface DuplicateMapOptions {
  newName: string;
  includeFeatures: boolean;
  includeStyles: boolean;
}

// Resultado de validação de mapa
export interface MapValidationResult {
  valid: boolean;
  issues: {
    type: 'warning' | 'error';
    message: string;
    layerId?: string;
  }[];
}
