// Path: map3d\features\catalog\queries.ts
import { useQuery } from '@tanstack/react-query';

import { env } from '@/shared/config/env';

import { type CatalogResponse } from '@/map3d/schemas';

import { useCatalogStore } from './store';

async function fetchCatalog(
  query: string,
  page: number,
  pageSize: number,
): Promise<CatalogResponse> {
  const searchParam = query ? `&q=${encodeURIComponent(query)}` : '';

  const response = await fetch(
    `${env.VITE_API_URL}/catalogo3d?nr_records=${pageSize}&page=${page}${searchParam}`,
  );

  if (!response.ok) {
    throw new Error('Falha ao buscar catálogo de modelos');
  }

  return response.json();
}

export function useCatalogQuery() {
  const { searchTerm, page, pageSize, setTotalResults } = useCatalogStore();

  return useQuery({
    queryKey: ['catalog', searchTerm, page],
    queryFn: () => fetchCatalog(searchTerm, page, pageSize),
    onSuccess: data => {
      setTotalResults(data.total);
    },
    keepPreviousData: true,
  });
}
