import { searchResultSchema, type SearchResult } from './types';
import { env } from '@/shared/config/env';

export async function searchFeatures(
  query: string,
  page: number = 1
): Promise<SearchResult> {
  const response = await fetch(
    `${env.VITE_API_URL}/busca?q=${encodeURIComponent(query)}&page=${page}`
  );

  if (!response.ok) {
    throw new Error('Falha ao buscar features');
  }

  const data = await response.json();
  return searchResultSchema.parse(data);
}