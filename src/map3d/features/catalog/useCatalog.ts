// Path: map3d\features\catalog\useCatalog.ts
import { useCallback, useEffect, useRef } from 'react';

import { useMap3DStore } from '../../store';
import { useMap3DToolState } from '../../store';
import { fetchCatalogItems } from './api';
import { useCatalogStore } from './store';
import { type CatalogItem, CatalogToolState } from './types';

export function useCatalog() {
  const { setToolsEnabled } = useMap3DStore();
  const { isActive } = useMap3DToolState('catalog');
  const {
    toolState,
    loadedModels,
    searchTerm,
    totalItems,
    currentPage,
    hasMore,
    catalogItems,
    isBlinking,

    openCatalog,
    closeCatalog,

    setSearchTerm,
    setCurrentPage,
    updateCatalogItems,
    updateSearchMetadata,

    addModel,
    removeModel,
    zoomToModel,
    toggleModelVisibility,
    isModelVisible,
    isModelLoaded,
    setToolState,
  } = useCatalogStore();

  // Keep tool state in sync with map state
  useEffect(() => {
    if (isActive && toolState === CatalogToolState.CLOSED) {
      openCatalog();
    } else if (!isActive && toolState !== CatalogToolState.CLOSED) {
      closeCatalog();
    }
  }, [isActive, toolState, openCatalog, closeCatalog]);

  // Update tool enablement state based on loaded models
  useEffect(() => {
    setToolsEnabled(loadedModels.size > 0);
  }, [loadedModels, setToolsEnabled]);

  // Fetch initial catalog data when opened
  useEffect(() => {
    if (toolState === CatalogToolState.OPEN && catalogItems.length === 0) {
      fetchCatalogItems({ page: 1 })
        .then(response => {
          updateCatalogItems(response.data);
          updateSearchMetadata({
            totalItems: response.total,
            currentPage: response.page,
            hasMore: response.data.length < response.total,
          });
          setToolState(CatalogToolState.OPEN);
        })
        .catch(error => {
          console.error('Failed to fetch catalog data:', error);
          setToolState(CatalogToolState.ERROR);
        });
    }
  }, [
    toolState,
    catalogItems.length,
    setToolState,
    updateCatalogItems,
    updateSearchMetadata,
  ]);

  // Toggle catalog open/closed
  const toggleCatalog = useCallback(() => {
    if (toolState === CatalogToolState.OPEN) {
      closeCatalog();
    } else {
      openCatalog();
    }
  }, [toolState, openCatalog, closeCatalog]);

  // Reset search and fetch fresh catalog data
  const handleResetSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);

    setToolState(CatalogToolState.LOADING);
    fetchCatalogItems({ page: 1, q: '' })
      .then(response => {
        updateCatalogItems(response.data);
        updateSearchMetadata({
          totalItems: response.total,
          currentPage: response.page,
          hasMore: response.data.length < response.total,
        });
        setToolState(CatalogToolState.OPEN);
      })
      .catch(error => {
        console.error('Failed to reset search:', error);
        setToolState(CatalogToolState.ERROR);
      });
  }, [
    setSearchTerm,
    setCurrentPage,
    setToolState,
    updateCatalogItems,
    updateSearchMetadata,
  ]);

  // Debounced search implementation
  const searchTimeoutRef = useRef<number | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (value.length >= 2 || value.length === 0) {
        setToolState(CatalogToolState.LOADING);

        searchTimeoutRef.current = window.setTimeout(() => {
          fetchCatalogItems({ q: value, page: 1 })
            .then(response => {
              updateCatalogItems(response.data);
              updateSearchMetadata({
                totalItems: response.total,
                currentPage: response.page,
                hasMore: response.data.length < response.total,
              });
              setToolState(CatalogToolState.OPEN);
            })
            .catch(error => {
              console.error('Search failed:', error);
              setToolState(CatalogToolState.ERROR);
            });

          searchTimeoutRef.current = null;
        }, 300);

        return () => {
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
          }
        };
      }

      return undefined;
    },
    [setSearchTerm, setToolState, updateCatalogItems, updateSearchMetadata],
  );

  // Load next page of results
  const loadNextPage = useCallback(() => {
    if (!hasMore) return;

    setToolState(CatalogToolState.LOADING);
    fetchCatalogItems({ q: searchTerm, page: currentPage + 1 })
      .then(response => {
        updateCatalogItems([...catalogItems, ...response.data]);
        updateSearchMetadata({
          totalItems: response.total,
          currentPage: response.page,
          hasMore: catalogItems.length + response.data.length < response.total,
        });
        setToolState(CatalogToolState.OPEN);
      })
      .catch(error => {
        console.error('Failed to load next page:', error);
        setToolState(CatalogToolState.ERROR);
      });
  }, [
    hasMore,
    searchTerm,
    currentPage,
    catalogItems,
    setToolState,
    updateCatalogItems,
    updateSearchMetadata,
  ]);

  // Add model and close catalog
  const handleAddModelAndClose = useCallback(
    (model: CatalogItem) => {
      addModel(model);
      closeCatalog();
    },
    [addModel, closeCatalog],
  );

  return {
    // State
    isOpen: toolState === CatalogToolState.OPEN,
    isLoading: toolState === CatalogToolState.LOADING,
    hasError: toolState === CatalogToolState.ERROR,
    searchTerm,
    models: catalogItems,
    loadedModels: Array.from(loadedModels.values()),
    totalItems,
    currentPage,
    hasMore,
    isBlinking,

    // Catalog actions
    openCatalog,
    closeCatalog,
    toggleCatalog,

    // Search actions
    handleSearchChange,
    handleResetSearch,
    loadNextPage,

    // Model actions
    addModel,
    handleAddModelAndClose,
    removeModel,
    zoomToModel,
    toggleModelVisibility,
    isModelVisible,
    isModelLoaded,
  };
}
