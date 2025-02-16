import { catalogResponseSchema, type CatalogResponse } from './types';
import { env } from '@/shared/config/env';

export async function fetchCatalog(
  query: string = '',
  page: number = 1,
  pageSize: number = 10
): Promise<CatalogResponse> {
  const searchParam = query ? `&q=${encodeURIComponent(query)}` : '';
  
  const response = await fetch(
    `${env.VITE_API_URL}/catalogo3d?nr_records=${pageSize}&page=${page}${searchParam}`
  );

  if (!response.ok) {
    throw new Error('Falha ao buscar catálogo de modelos');
  }

  const data = await response.json();
  return catalogResponseSchema.parse(data);
}

export function getModelUrl(type: string, path: string): string {
  return `${env.VITE_SOURCE_MODELS_URL}/3d/${path}`;
}