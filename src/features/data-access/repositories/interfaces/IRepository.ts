// Path: features\data-access\repositories\interfaces\IRepository.ts

import { ExtendedFeature } from '../../schemas/feature.schema';
import { LayerConfig } from '../../schemas/layer.schema';
import { MapConfig } from '../../schemas/map.schema';

// Base Repository Interface
export interface IBaseRepository<T, K = string> {
  create(entity: T): Promise<T>;
  getById(id: K): Promise<T | null>;
  getAll(): Promise<T[]>;
  update(id: K, updates: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
  createMany(entities: T[]): Promise<T[]>;
  deleteMany(ids: K[]): Promise<void>;
  count(): Promise<number>;
  exists(id: K): Promise<boolean>;
}

// Feature Repository Interface
export interface IFeatureRepository extends IBaseRepository<ExtendedFeature, string> {
  getByLayerId(layerId: string): Promise<ExtendedFeature[]>;
  deleteByLayerId(layerId: string): Promise<void>;
  moveToLayer(featureIds: string[], targetLayerId: string): Promise<ExtendedFeature[]>;
  countByLayerId(layerId: string): Promise<number>;
}

// Layer Repository Interface
export interface ILayerRepository extends IBaseRepository<LayerConfig, string> {
  reorder(layerOrders: Array<{ id: string; zIndex: number }>): Promise<LayerConfig[]>;
  getNextZIndex(): Promise<number>;
  toggleVisibility(id: string): Promise<LayerConfig>;
  canDelete(id: string): Promise<boolean>;
}

// Map Repository Interface
export interface IMapRepository extends IBaseRepository<MapConfig, string> {
  addLayer(mapId: string, layerId: string): Promise<MapConfig>;
  removeLayer(mapId: string, layerId: string): Promise<MapConfig>;
  reorderLayers(mapId: string, layerIds: string[]): Promise<MapConfig>;
  updateViewport(id: string, center: [number, number], zoom: number): Promise<MapConfig>;
}

// Repository Factory
export interface IRepositoryFactory {
  feature(): IFeatureRepository;
  layer(): ILayerRepository;
  map(): IMapRepository;
}
