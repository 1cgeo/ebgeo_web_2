// Path: map3d\features\catalog\useQueries.ts
import { useQuery } from '@tanstack/react-query';

import { fetchCatalog } from './api';
import { useCatalogStore } from './store';
import { type CatalogResponse } from './types';

export function useCatalogQuery() {
  const { searchParams } = useCatalogStore();

  return useQuery({
    queryKey: ['catalog', searchParams],
    queryFn: () => fetchCatalog(searchParams),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Interface estendida para retornar dados paginados
export interface UsePaginatedCatalogResult {
  data: CatalogResponse | undefined;
  isLoading: boolean;
  error: unknown;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export function usePaginatedCatalog(): UsePaginatedCatalogResult {
  const { searchParams, setPage } = useCatalogStore();
  const { data, isLoading, error } = useCatalogQuery();

  const totalPages = data ? Math.ceil(data.total / searchParams.por_pagina) : 0;

  return {
    data,
    isLoading,
    error,
    hasNextPage: data ? searchParams.pagina < totalPages : false,
    hasPreviousPage: searchParams.pagina > 1,
    page: searchParams.pagina,
    totalPages,
    setPage,
  };
}
