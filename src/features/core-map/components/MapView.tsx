// Path: features\core-map\components\MapView.tsx

import React, { useRef, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useMapContext } from '../context/MapProvider';
import { useMapInstance } from '../hooks/useMapInstance';
import { useFeatures } from '../../data-access/hooks/useFeatures';
import { useDrawingStore } from '../../drawing/store/drawing.store';
import { useSelectionStore } from '../../selection/store/selection.store';

interface MapViewProps {
  className?: string;
  style?: React.CSSProperties;
}

export const MapView: React.FC<MapViewProps> = ({ className, style }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { setMapContainer, isMapLoaded } = useMapContext();
  const { updateColdFeatures, updateSelectedFeatures } = useMapInstance();

  // Dados das features
  const { data: features = [], isLoading: featuresLoading, error: featuresError } = useFeatures();

  // Estados globais
  const selectedFeatureIds = useSelectionStore(state => state.selectedFeatureIds);
  const activeTool = useDrawingStore(state => state.activeTool);

  // Configurar container do mapa
  useEffect(() => {
    if (mapContainerRef.current) {
      setMapContainer(mapContainerRef.current);
    }

    return () => {
      setMapContainer(null);
    };
  }, [setMapContainer]);

  // Atualizar features no mapa quando os dados mudarem
  useEffect(() => {
    if (isMapLoaded && features.length > 0) {
      updateColdFeatures(features);
    }
  }, [isMapLoaded, features, updateColdFeatures]);

  // Atualizar features selecionadas no mapa
  useEffect(() => {
    if (isMapLoaded) {
      const selectedFeatures = features.filter(feature => selectedFeatureIds.includes(feature.id));
      updateSelectedFeatures(selectedFeatures);
    }
  }, [isMapLoaded, features, selectedFeatureIds, updateSelectedFeatures]);

  // Renderizar loading state
  if (featuresLoading) {
    return (
      <Box
        ref={mapContainerRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: '#f5f5f5',
          ...style,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Carregando mapa...
        </Typography>
      </Box>
    );
  }

  // Renderizar error state
  if (featuresError) {
    return (
      <Box
        ref={mapContainerRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: '#ffebee',
          ...style,
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Erro ao carregar o mapa
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {featuresError instanceof Error ? featuresError.message : 'Erro desconhecido'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={mapContainerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...style,
      }}
      sx={{
        '& .maplibregl-canvas': {
          cursor: activeTool === 'select' ? 'pointer' : 'crosshair',
        },
        '& .maplibregl-ctrl-top-right': {
          top: '70px', // Evitar sobreposição com toolbar
        },
      }}
    >
      {/* Overlay de loading quando o mapa não estiver carregado */}
      {!isMapLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: 'rgba(245, 245, 245, 0.9)',
            zIndex: 1000,
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Inicializando mapa...
          </Typography>
        </Box>
      )}

      {/* Informações de debug (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && isMapLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: 1,
            borderRadius: 1,
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 999,
            pointerEvents: 'none',
          }}
        >
          <div>Features: {features.length}</div>
          <div>Selecionadas: {selectedFeatureIds.length}</div>
          <div>Ferramenta: {activeTool}</div>
        </Box>
      )}
    </Box>
  );
};
