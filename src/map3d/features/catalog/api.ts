// Path: map3d\features\catalog\api.ts
import { env } from '@/shared/config/env';

import {
  type CatalogResponse,
  type Model3D,
  type SearchParams,
  catalogResponseSchema,
  searchParamsSchema,
} from '../types';

const CATALOG_ENDPOINT = `${env.VITE_API_URL}/catalogo3d`;
const MODELS_BASE_URL = env.VITE_SOURCE_MODELS_URL;

export async function fetchCatalog(
  params: SearchParams,
): Promise<CatalogResponse> {
  // Valida parâmetros de busca
  const validatedParams = searchParamsSchema.parse(params);

  const searchParams = new URLSearchParams();
  if (validatedParams.query) {
    searchParams.append('q', validatedParams.query);
  }
  searchParams.append('pagina', validatedParams.pagina.toString());
  searchParams.append('por_pagina', validatedParams.por_pagina.toString());

  const response = await fetch(
    `${CATALOG_ENDPOINT}?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error('Falha ao buscar catálogo de modelos');
  }

  const data = await response.json();
  return catalogResponseSchema.parse(data);
}

export function getModelUrl(model: Model3D): string {
  switch (model.tipo) {
    case 'Tiles 3D':
      return `${MODELS_BASE_URL}/3d/${model.url}`;
    case 'Modelos 3D':
      return `${MODELS_BASE_URL}/3d/${model.url}`;
    case 'Nuvem de Pontos':
      return `${MODELS_BASE_URL}/point-cloud/${model.url}`;
  }
}

export function getModelThumbnailUrl(model: Model3D): string {
  return `${MODELS_BASE_URL}/thumbnails/${model.thumbnail}`;
}

// Permite testar se um modelo é de um tipo específico
export function isTiles3D(model: Model3D): model is Tiles3D {
  return model.tipo === 'Tiles 3D';
}

export function isModelos3D(model: Model3D): model is Modelos3D {
  return model.tipo === 'Modelos 3D';
}

export function isNuvemPontos(model: Model3D): model is NuvemPontos {
  return model.tipo === 'Nuvem de Pontos';
}
