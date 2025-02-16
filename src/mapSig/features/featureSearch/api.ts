// Path: mapSig\features\featureSearch\api.ts
import { env } from '@/shared/config/env';

import {
  type SearchParams,
  type SearchResult,
  searchResultSchema,
} from './types';

export async function searchFeatures(
  params: SearchParams,
): Promise<SearchResult> {
  const { query, page, pageSize } = params;

  const response = await fetch(
    `${env.VITE_API_URL}/busca?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`,
  );

  if (!response.ok) {
    throw new Error('Falha ao buscar features');
  }

  const data = await response.json();
  return searchResultSchema.parse(data);
}
