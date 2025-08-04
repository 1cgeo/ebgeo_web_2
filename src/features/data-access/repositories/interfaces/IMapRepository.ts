// Path: features\data-access\repositories\interfaces\IMapRepository.ts
import { MapConfig } from '../../schemas/map.schema';
import { LayerConfig } from '../../schemas/layer.schema';

/**
 * Interface simplificada para repository de mapas
 */
export interface IMapRepository {
  // CRUD básico
  create(map: MapConfig): Promise<MapConfig>;
  getById(id: string): Promise<MapConfig | null>;
  getAll(): Promise<MapConfig[]>;
  update(id: string, updates: Partial<MapConfig>): Promise<MapConfig>;
  delete(id: string): Promise<void>;

  // Operações com camadas
  getWithLayers(id: string): Promise<{
    map: MapConfig;
    layers: LayerConfig[];
  } | null>;
  addLayer(mapId: string, layerId: string): Promise<MapConfig>;
  removeLayer(mapId: string, layerId: string): Promise<MapConfig>;
  reorderLayers(mapId: string, layerIds: string[]): Promise<MapConfig>;

  // Operações específicas de mapas
  updateViewport(id: string, center: [number, number], zoom: number): Promise<MapConfig>;
  duplicate(id: string, newName?: string): Promise<MapConfig>;

  // Utilitários básicos
  count(): Promise<number>;
  exists(id: string): Promise<boolean>;
  getMapsByLayerId(layerId: string): Promise<MapConfig[]>;
}
