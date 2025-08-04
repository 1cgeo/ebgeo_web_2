// Path: features\data-access\repositories\interfaces\ILayerRepository.ts
import { LayerConfig } from '../../schemas/layer.schema';

/**
 * Interface simplificada para repository de camadas
 */
export interface ILayerRepository {
  // CRUD básico
  create(layer: LayerConfig): Promise<LayerConfig>;
  getById(id: string): Promise<LayerConfig | null>;
  getAll(): Promise<LayerConfig[]>;
  update(id: string, updates: Partial<LayerConfig>): Promise<LayerConfig>;
  delete(id: string): Promise<void>;

  // Operações específicas de camadas
  reorder(layerOrders: Array<{ id: string; zIndex: number }>): Promise<LayerConfig[]>;
  canDelete(id: string): Promise<{
    canDelete: boolean;
    featureCount: number;
    reason?: string;
  }>;
  deleteWithFeatures(id: string): Promise<void>;

  // Utilitários básicos
  count(): Promise<number>;
  exists(id: string): Promise<boolean>;
  getNextZIndex(): Promise<number>;

  // Visibilidade
  getVisible(): Promise<LayerConfig[]>;
  toggleVisibility(id: string): Promise<LayerConfig>;
}
