// Path: mapSig\features\featureSearch\api.ts
import { env } from '@/shared/config/env';
import { useMapsStore } from '@/shared/store/mapsStore';

import {
  type SearchParams,
  type SearchResult,
  searchResultSchema,
} from './types';

export async function searchFeatures(
  params: SearchParams,
): Promise<SearchResult> {
  const map = useMapsStore.getState().map;
  const center = map?.getCenter() || { lat: 0, lng: 0 };

  const { query, page, pageSize } = params;
  const url = new URL(`${env.VITE_API_URL}/busca`);

  url.searchParams.append('q', query);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('pageSize', pageSize.toString());
  url.searchParams.append('lat', center.lat.toString());
  url.searchParams.append('lon', center.lng.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Falha ao buscar features');
  }

  const data = await response.json();
  return searchResultSchema.parse(data);
}
