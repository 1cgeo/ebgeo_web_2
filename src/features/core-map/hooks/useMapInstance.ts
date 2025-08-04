// Path: features\core-map\hooks\useMapInstance.ts

import { useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useMapContext } from '../context/MapProvider';
import { ExtendedFeature } from '../../data-access/schemas/feature.schema';

export const useMapInstance = () => {
  const { map, isMapLoaded } = useMapContext();

  // Atualizar source de features frias (persistidas)
  const updateColdFeatures = useCallback(
    (features: ExtendedFeature[]) => {
      if (!map || !isMapLoaded) return;

      const source = map.getSource('cold-features') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: features,
        });
      }
    },
    [map, isMapLoaded]
  );

  // Atualizar source de features quentes (sendo editadas)
  const updateHotFeatures = useCallback(
    (features: ExtendedFeature[]) => {
      if (!map || !isMapLoaded) return;

      const source = map.getSource('hot-features') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: features,
        });
      }
    },
    [map, isMapLoaded]
  );

  // Atualizar features selecionadas
  const updateSelectedFeatures = useCallback(
    (features: ExtendedFeature[]) => {
      if (!map || !isMapLoaded) return;

      const source = map.getSource('selected-features') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: features,
        });
      }
    },
    [map, isMapLoaded]
  );

  // Obter features no ponto clicado
  const queryRenderedFeatures = useCallback(
    (
      point: maplibregl.Point,
      options?: {
        layers?: string[];
        filter?: any[];
        radius?: number;
      }
    ) => {
      if (!map || !isMapLoaded) return [];

      const defaultLayers = [
        'cold-features-points',
        'cold-features-lines',
        'selected-features-points',
        'selected-features-lines',
      ];

      return map.queryRenderedFeatures(point, {
        layers: options?.layers || defaultLayers,
        filter: options?.filter,
        radius: options?.radius || 5,
      });
    },
    [map, isMapLoaded]
  );

  // Converter coordenadas de tela para geográficas
  const unproject = useCallback(
    (point: maplibregl.Point): maplibregl.LngLat | null => {
      if (!map || !isMapLoaded) return null;
      return map.unproject(point);
    },
    [map, isMapLoaded]
  );

  // Converter coordenadas geográficas para tela
  const project = useCallback(
    (lngLat: maplibregl.LngLatLike): maplibregl.Point | null => {
      if (!map || !isMapLoaded) return null;
      return map.project(lngLat);
    },
    [map, isMapLoaded]
  );

  // Ajustar vista para mostrar features
  const fitBounds = useCallback(
    (bounds: maplibregl.LngLatBoundsLike, options?: maplibregl.FitBoundsOptions) => {
      if (!map || !isMapLoaded) return;

      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 18,
        ...options,
      });
    },
    [map, isMapLoaded]
  );

  // Voar para localização
  const flyTo = useCallback(
    (options: maplibregl.FlyToOptions) => {
      if (!map || !isMapLoaded) return;
      map.flyTo(options);
    },
    [map, isMapLoaded]
  );

  // Obter centro e zoom atuais
  const getViewState = useCallback(() => {
    if (!map || !isMapLoaded) return null;

    return {
      center: map.getCenter(),
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    };
  }, [map, isMapLoaded]);

  // Adicionar event listener
  const on = useCallback(
    (type: string, listener: (...args: any[]) => void) => {
      if (!map || !isMapLoaded) return;
      map.on(type as any, listener);
    },
    [map, isMapLoaded]
  );

  // Remover event listener
  const off = useCallback(
    (type: string, listener: (...args: any[]) => void) => {
      if (!map || !isMapLoaded) return;
      map.off(type as any, listener);
    },
    [map, isMapLoaded]
  );

  // Alterar cursor
  const setCursor = useCallback(
    (cursor: string) => {
      if (!map || !isMapLoaded) return;
      map.getCanvas().style.cursor = cursor;
    },
    [map, isMapLoaded]
  );

  // Obter bounds visíveis
  const getBounds = useCallback(() => {
    if (!map || !isMapLoaded) return null;
    return map.getBounds();
  }, [map, isMapLoaded]);

  // Verificar se um ponto está visível
  const isPointVisible = useCallback(
    (lngLat: maplibregl.LngLatLike): boolean => {
      if (!map || !isMapLoaded) return false;
      const bounds = map.getBounds();
      const point =
        typeof lngLat === 'object' && 'lng' in lngLat ? lngLat : { lng: lngLat[0], lat: lngLat[1] };
      return bounds.contains(point);
    },
    [map, isMapLoaded]
  );

  // Animar feature (efeito visual)
  const animateFeature = useCallback(
    (featureId: string, duration: number = 1000) => {
      if (!map || !isMapLoaded) return;

      // Implementação simples de animação
      const canvas = map.getCanvas();
      canvas.classList.add('pulse');

      setTimeout(() => {
        canvas.classList.remove('pulse');
      }, duration);
    },
    [map, isMapLoaded]
  );

  return {
    // Instância do mapa
    map,
    isMapLoaded,

    // Métodos de atualização de dados
    updateColdFeatures,
    updateHotFeatures,
    updateSelectedFeatures,

    // Métodos de consulta
    queryRenderedFeatures,

    // Métodos de conversão de coordenadas
    unproject,
    project,

    // Métodos de navegação
    fitBounds,
    flyTo,
    getViewState,
    getBounds,
    isPointVisible,

    // Métodos de eventos
    on,
    off,

    // Métodos de UI
    setCursor,
    animateFeature,
  };
};

// Hook especializado para operações de desenho
export const useMapDrawing = () => {
  const mapInstance = useMapInstance();

  // Adicionar ponto temporário enquanto desenha
  const addTemporaryPoint = useCallback(
    (lngLat: maplibregl.LngLatLike) => {
      if (!mapInstance.map || !mapInstance.isMapLoaded) return;

      // Implementar lógica para mostrar ponto temporário
      const tempFeature: ExtendedFeature = {
        type: 'Feature',
        id: 'temp-point',
        geometry: {
          type: 'Point',
          coordinates: Array.isArray(lngLat) ? lngLat : [lngLat.lng, lngLat.lat],
        },
        properties: {
          id: 'temp-point',
          layerId: 'temp',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          style: {
            markerColor: '#4caf50',
            markerSize: 6,
          },
        },
      };

      mapInstance.updateHotFeatures([tempFeature]);
    },
    [mapInstance]
  );

  // Limpar pontos temporários
  const clearTemporary = useCallback(() => {
    mapInstance.updateHotFeatures([]);
  }, [mapInstance]);

  return {
    ...mapInstance,
    addTemporaryPoint,
    clearTemporary,
  };
};
