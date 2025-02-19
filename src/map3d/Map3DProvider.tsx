// Path: map3d\Map3DProvider.tsx
import { type FC, type ReactNode, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { useMap3DInteraction } from '@/map3d/hooks';
import { useMap3DSetup } from '@/map3d/hooks/useMap3DSetup';
import { useMap3DStore } from '@/map3d/store';
import { schemas } from '@/map3d/types';
import { getCameraPosition } from '@/map3d/utils/cameraUtils';
import { EventEmitter } from '@/map3d/utils/events';

interface Map3DProviderProps {
  children: ReactNode;
  containerId?: string;
}

export const Map3DProvider: FC<Map3DProviderProps> = ({
  children,
  containerId = 'map-3d',
}) => {
  // Usar o hook de setup para inicialização do mapa
  const cesiumMap = useMap3DSetup({
    containerId,
  });

  const { setCameraPosition: storeCameraPosition } = useMap3DStore();

  // Configurar rastreamento global da posição da câmera
  useEffect(() => {
    if (!cesiumMap) return;

    const updateCameraInterval = setInterval(() => {
      const position = getCameraPosition();
      if (position) {
        storeCameraPosition(position);
      }
    }, 1000);

    return () => clearInterval(updateCameraInterval);
  }, [cesiumMap, storeCameraPosition]);

  // Configurar manipulador de interação do mapa para escolher objetos
  useMap3DInteraction({
    enabled: !!cesiumMap,
    onPickEntity: entity => {
      if (entity) {
        EventEmitter.dispatch('map3d:entity-picked', entity);
      }
    },
  });

  // Validar modelos quando carregados usando schemas
  useEffect(() => {
    const handleModelLoaded = (model: any) => {
      try {
        // Validar dados do modelo contra o schema
        schemas.model3DSchema.parse(model);
      } catch (error) {
        console.error('Dados de modelo inválidos:', error);
      }
    };

    EventEmitter.subscribe('model:loaded', handleModelLoaded);
    return () => EventEmitter.unsubscribe('model:loaded', handleModelLoaded);
  }, []);

  return <>{children}</>;
};
