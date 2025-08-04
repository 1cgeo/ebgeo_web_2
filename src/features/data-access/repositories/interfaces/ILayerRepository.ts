// Path: features\data-access\repositories\interfaces\ILayerRepository.ts

import { LayerConfig } from '../../schemas/layer.schema';
import { IRepository } from './IRepository';

// Interface específica para o repository de camadas
export interface ILayerRepository extends IRepository<LayerConfig> {
  // Busca por nome
  getByName(name: string): Promise<LayerConfig | null>;

  // Verificar se nome existe
  nameExists(name: string, excludeId?: string): Promise<boolean>;

  // Reordenar camadas (zIndex)
  reorder(layerIds: string[]): Promise<LayerConfig[]>;

  // Alternar visibilidade
  toggleVisibility(id: string): Promise<LayerConfig>;

  // Atualizar opacidade
  updateOpacity(id: string, opacity: number): Promise<LayerConfig>;

  // Obter camadas visíveis ordenadas por zIndex
  getVisibleLayers(): Promise<LayerConfig[]>;

  // Obter próximo zIndex disponível
  getNextZIndex(): Promise<number>;

  // Duplicar camada (sem features)
  duplicate(id: string, newName: string): Promise<LayerConfig>;

  // Estatísticas da camada
  getLayerStats(id: string): Promise<{
    featureCount: number;
    lastModified: string;
    geometryTypes: Record<string, number>;
  }>;

  // Validar antes de deletar (verificar se há features)
  canDelete(id: string): Promise<{
    canDelete: boolean;
    featureCount: number;
    reason?: string;
  }>;

  // Deletar camada e suas features
  deleteWithFeatures(id: string): Promise<void>;
}

// Opções para criação de camada
export interface CreateLayerOptions {
  name: string;
  visible?: boolean;
  opacity?: number;
  insertAtIndex?: number;
}

// Resultado de reordenação
export interface ReorderResult {
  success: boolean;
  layers: LayerConfig[];
  error?: string;
}
