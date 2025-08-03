// Path: features\core-map\context\MapProvider.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import maplibregl from 'maplibre-gl';
import { initializeDatabase } from '../../data-access/db';

// Interface do contexto do mapa
interface MapContextType {
  map: maplibregl.Map | null;
  isMapLoaded: boolean;
  mapContainer: HTMLDivElement | null;
  setMapContainer: (container: HTMLDivElement | null) => void;
  initializeMap: () => void;
  destroyMap: () => void;
}

// Contexto do mapa
const MapContext = createContext<MapContextType | undefined>(undefined);

// Hook para usar o contexto do mapa
export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext deve ser usado dentro de um MapProvider');
  }
  return context;
};

// Props do provider
interface MapProviderProps {
  children: ReactNode;
}

// Provider do mapa
export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);

  // Configuração padrão do mapa
  const defaultMapConfig = {
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster' as const,
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster' as const,
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    },
    center: [-51.2177, -30.0346] as [number, number], // Porto Alegre
    zoom: 10,
    attributionControl: false,
    logoPosition: 'bottom-left' as const,
  };

  // Inicializar o mapa
  const initializeMap = () => {
    if (!mapContainer || map) {
      return;
    }

    try {
      console.log('Inicializando mapa...');
      
      const newMap = new maplibregl.Map({
        container: mapContainer,
        ...defaultMapConfig,
      });

      // Adicionar controles
      newMap.addControl(new maplibregl.NavigationControl(), 'top-right');
      newMap.addControl(new maplibregl.ScaleControl(), 'bottom-left');
      newMap.addControl(
        new maplibregl.AttributionControl({
          compact: true,
        }),
        'bottom-right'
      );

      // Event listeners
      newMap.on('load', () => {
        console.log('Mapa carregado com sucesso');
        setIsMapLoaded(true);
        
        // Adicionar sources que serão usadas para features
        newMap.addSource('cold-features', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });

        newMap.addSource('hot-features', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });

        newMap.addSource('selected-features', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });

        // Adicionar layers para renderização das features
        // Layer para features normais (pontos)
        newMap.addLayer({
          id: 'cold-features-points',
          type: 'circle',
          source: 'cold-features',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': [
              'case',
              ['has', 'markerSize', ['get', 'style']],
              ['get', 'markerSize', ['get', 'style']],
              8
            ],
            'circle-color': [
              'case',
              ['has', 'markerColor', ['get', 'style']],
              ['get', 'markerColor', ['get', 'style']],
              '#1976d2'
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Layer para features normais (linhas)
        newMap.addLayer({
          id: 'cold-features-lines',
          type: 'line',
          source: 'cold-features',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-width': [
              'case',
              ['has', 'strokeWidth', ['get', 'style']],
              ['get', 'strokeWidth', ['get', 'style']],
              3
            ],
            'line-color': [
              'case',
              ['has', 'strokeColor', ['get', 'style']],
              ['get', 'strokeColor', ['get', 'style']],
              '#1976d2'
            ],
            'line-opacity': [
              'case',
              ['has', 'strokeOpacity', ['get', 'style']],
              ['get', 'strokeOpacity', ['get', 'style']],
              1
            ],
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
        });

        // Layer para features selecionadas (pontos)
        newMap.addLayer({
          id: 'selected-features-points',
          type: 'circle',
          source: 'selected-features',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': [
              'case',
              ['has', 'markerSize', ['get', 'style']],
              ['*', ['get', 'markerSize', ['get', 'style']], 1.2],
              10
            ],
            'circle-color': '#ff6b35',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Layer para features selecionadas (linhas)
        newMap.addLayer({
          id: 'selected-features-lines',
          type: 'line',
          source: 'selected-features',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-width': [
              'case',
              ['has', 'strokeWidth', ['get', 'style']],
              ['+', ['get', 'strokeWidth', ['get', 'style']], 2],
              5
            ],
            'line-color': '#ff6b35',
            'line-opacity': 0.8,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
        });

        // Layer para features sendo editadas (hot)
        newMap.addLayer({
          id: 'hot-features-points',
          type: 'circle',
          source: 'hot-features',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 8,
            'circle-color': '#4caf50',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        newMap.addLayer({
          id: 'hot-features-lines',
          type: 'line',
          source: 'hot-features',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-width': 3,
            'line-color': '#4caf50',
            'line-opacity': 0.8,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
        });
      });

      newMap.on('error', (e) => {
        console.error('Erro no mapa:', e.error);
      });

      setMap(newMap);
      
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
    }
  };

  // Destruir o mapa
  const destroyMap = () => {
    if (map) {
      console.log('Destruindo mapa...');
      map.remove();
      setMap(null);
      setIsMapLoaded(false);
    }
  };

  // Inicializar banco de dados ao montar o componente
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  // Inicializar mapa quando o container estiver disponível
  useEffect(() => {
    if (mapContainer && !map) {
      initializeMap();
    }

    return () => {
      if (map) {
        destroyMap();
      }
    };
  }, [mapContainer]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      destroyMap();
    };
  }, []);

  const value: MapContextType = {
    map,
    isMapLoaded,
    mapContainer,
    setMapContainer,
    initializeMap,
    destroyMap,
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};