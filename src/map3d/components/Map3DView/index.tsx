// Path: map3d\components\Map3DView\index.tsx
import { type FC, useEffect } from 'react';

import { config } from '../../config';
import { useMap3D } from '../../hooks/useMap3D';
import { MapContainer } from './styles';

interface Map3DViewProps {
  onViewerReady?: () => void;
  onError?: (error: Error) => void;
}

export const Map3DView: FC<Map3DViewProps> = ({ onViewerReady, onError }) => {
  const { isReady, error } = useMap3D(config, {
    onViewerReady,
    onError,
  });

  useEffect(() => {
    if (error) {
      console.error('Erro ao inicializar mapa 3D:', error);
    }
  }, [error]);

  return (
    <MapContainer id="map-3d" role="application" aria-label="Visualização 3D" />
  );
};
