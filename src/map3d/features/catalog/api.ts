// Path: map3d\features\catalog\api.ts
import { apiEndpoints, env } from '@/shared/config/env';

import {
  type CatalogItem,
  type CatalogResponse,
  type CatalogSearchParams,
  type Modelos3D,
  type PointCloud,
  type Tiles3D,
  catalogResponseSchema,
  catalogSearchParamsSchema,
} from './types';

export async function fetchCatalogItems(
  params: Partial<CatalogSearchParams> = {},
): Promise<CatalogResponse> {
  // Set default values and validate
  const searchParams = catalogSearchParamsSchema.parse({
    q: params.q || '',
    page: params.page || 1,
    nr_records: params.nr_records || 12,
  });

  // Build query string
  const url = new URL(apiEndpoints.modelCatalog);
  if (searchParams.q) url.searchParams.append('q', searchParams.q);
  url.searchParams.append('page', searchParams.page.toString());
  url.searchParams.append('nr_records', searchParams.nr_records.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Falha ao buscar catálogo: ${response.statusText}`);
  }

  const data = await response.json();
  return catalogResponseSchema.parse(data);
}

export function getModelUrl(modelType: string): string {
  const baseUrl = env.VITE_SOURCE_MODELS_URL || '';

  switch (modelType) {
    case 'Tiles 3D':
      return `${baseUrl}/3d/`;
    case 'Modelos 3D':
      return `${baseUrl}/3d/`;
    case 'Nuvem de Pontos':
      return `${baseUrl}/point-cloud/`;
    default:
      return `${baseUrl}/3d/`;
  }
}

export function getModelThumbnailUrl(model: CatalogItem): string {
  const baseUrl = env.VITE_SOURCE_MODELS_URL || '';
  return `${baseUrl}/thumbnails/${model.thumbnail}`;
}

// Type guard functions
export function isTiles3D(model: CatalogItem): model is Tiles3D {
  return model.type === 'Tiles 3D';
}

export function isModelos3D(model: CatalogItem): model is Modelos3D {
  return model.type === 'Modelos 3D';
}

export function isPointCloud(model: CatalogItem): model is PointCloud {
  return model.type === 'Nuvem de Pontos';
}
