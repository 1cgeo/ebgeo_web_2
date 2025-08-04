// Path: features\data-access\repositories\interfaces\IFeatureRepository.ts
import { ExtendedFeature } from '../../schemas/feature.schema';

/**
 * Interface simplificada para repository de features
 */
export interface IFeatureRepository {
  // CRUD básico
  create(feature: ExtendedFeature): Promise<ExtendedFeature>;
  createMany(features: ExtendedFeature[]): Promise<ExtendedFeature[]>;
  getById(id: string): Promise<ExtendedFeature | null>;
  getAll(): Promise<ExtendedFeature[]>;
  update(id: string, updates: Partial<ExtendedFeature>): Promise<ExtendedFeature>;
  updateMany(
    updates: Array<{ id: string; data: Partial<ExtendedFeature> }>
  ): Promise<ExtendedFeature[]>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;

  // Operações por camada
  getByLayerId(layerId: string): Promise<ExtendedFeature[]>;
  getByLayerIds(layerIds: string[]): Promise<ExtendedFeature[]>;
  deleteByLayerId(layerId: string): Promise<void>;

  // Utilitários básicos
  count(): Promise<number>;
  countByLayerId(layerId: string): Promise<number>;
  exists(id: string): Promise<boolean>;
  moveToLayer(featureIds: string[], targetLayerId: string): Promise<ExtendedFeature[]>;
}
