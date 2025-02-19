// Path: map3d\components\Map3DView\index.tsx
import { FC, memo, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { Model3DLayerList } from '../../features/catalog/ModelList';
import { useMap3DSetup } from '../../hooks/useMap3DSetup';
import { useMap3DStore } from '../../store';
import { type Map3DState } from '../../types';
import { RightSideToolBar } from '../RightSideToolBar';
import { MapContainer } from './styles';

interface Map3DViewProps {
  initialState?: Partial<Map3DState>;
}

const Map3DView: FC<Map3DViewProps> = ({ initialState }) => {
  const cesiumMap = useMapsStore(state => state.cesiumMap);
  const { setToolsEnabled } = useMap3DStore();

  // Setup do mapa 3D
  useMap3DSetup({
    containerId: 'map-3d',
    initialState,
  });

  // Habilita ferramentas quando modelos estiverem carregados
  useEffect(() => {
    if (!cesiumMap) return;

    const checkModelsLoaded = () => {
      // Verifica se existem modelos carregados
      const modelsLoaded =
        cesiumMap.entities?.values?.length > 0 ||
        cesiumMap.scene?.primitives?.length > 0;

      setToolsEnabled(modelsLoaded);
    };

    // Checa inicialmente
    checkModelsLoaded();

    // Configura verificação periódica
    const interval = setInterval(checkModelsLoaded, 1000);
    return () => clearInterval(interval);
  }, [cesiumMap, setToolsEnabled]);

  // Renderiza conteúdo apenas quando cesiumMap estiver disponível
  if (!cesiumMap) {
    return null;
  }

  return (
    <MapContainer id="map-3d">
      <RightSideToolBar />
      <Model3DLayerList />
    </MapContainer>
  );
};

export default memo(Map3DView);
