// Path: features/data-access/repositories/interfaces/IFeatureRepository.ts

import { ExtendedFeature } from '../../schemas/feature.schema';
import { IRepository, ISearchableRepository } from './IRepository';
import { Geometry } from 'geojson';

// Interface específica para o repository de features
export interface IFeatureRepository extends ISearchableRepository<ExtendedFeature> {
  // Busca por camada
  getByLayerId(layerId: string): Promise<ExtendedFeature[]>;
  
  // Busca por múltiplas camadas
  getByLayerIds(layerIds: string[]): Promise<ExtendedFeature[]>;
  
  // Busca espacial
  getByBoundingBox(
    minLng: number,
    minLat: number,
    maxLng: number,
    maxLat: number
  ): Promise<ExtendedFeature[]>;
  
  // Busca por proximidade (ponto)
  getByRadius(
    centerLng: number,
    centerLat: number,
    radiusMeters: number
  ): Promise<ExtendedFeature[]>;
  
  // Busca por tipo de geometria
  getByGeometryType(geometryType: string): Promise<ExtendedFeature[]>;
  
  // Mover features entre camadas
  moveToLayer(featureIds: string[], targetLayerId: string): Promise<ExtendedFeature[]>;
  
  // Duplicar features
  duplicate(featureIds: string[], targetLayerId?: string): Promise<ExtendedFeature[]>;
  
  // Estatísticas por camada
  getLayerStats(layerId: string): Promise<{
    count: number;
    geometryTypes: Record<string, number>;
    boundingBox?: [number, number, number, number];
  }>;
  
  // Validação de integridade
  validateFeature(feature: ExtendedFeature): Promise<{
    valid: boolean;
    errors: string[];
  }>;
  
  // Obter features órfãs (sem camada válida)
  getOrphanedFeatures(): Promise<ExtendedFeature[]>;
  
  // Limpeza de features órfãs (sem camada)
  cleanOrphanedFeatures(): Promise<string[]>;
}

// Filtros para busca de features
export interface FeatureFilters {
  layerIds?: string[];
  geometryTypes?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  boundingBox?: [number, number, number, number];
  properties?: Record<string, any>;
}

// Opções de ordenação
export interface FeatureSortOptions {
  field: keyof ExtendedFeature['properties'];
  direction: 'asc' | 'desc';
}