// Path: map3d\components\Map3DView\index.tsx
import { useMediaQuery, useTheme } from '@mui/material';

import { type FC, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { AreaResult } from '@/map3d/features/area/AreaResult';
import { CatalogPanel } from '@/map3d/features/catalog/Catalog';
import { ModelList } from '@/map3d/features/catalog/ModelList';
import { useCatalogStore } from '@/map3d/features/catalog/store';
import { DistanceResult } from '@/map3d/features/distance/DistanceResult';
import { IdentifyPanel } from '@/map3d/features/identify/IdentifyPanel';
import { LabelPanel } from '@/map3d/features/label/LabelPanel';
import { getFeatures } from '@/map3d/features/registry';
import { ViewshedOptions } from '@/map3d/features/viewshed/ViewshedOptions';
import { useMap3DStore } from '@/map3d/store';

import { RightSideToolBar } from '../RightSideToolBar';
// Import components
import { ToolbarContent } from '../ToolbarContent';
import { MapContainer } from './styles';

interface Map3DViewProps {
  onViewerReady?: () => void;
  onError?: (error: Error) => void;
}

const Map3DView: FC<Map3DViewProps> = ({ onViewerReady, onError }) => {
  const { cesiumMap } = useMapsStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { isPanelOpen } = useCatalogStore();
  const { models, activeTool } = useMap3DStore();

  // Obter listas filtradas para componentes de resultados
  const viewshedTools = useMap3DStore(
    state => state.viewsheds?.filter(v => v.isComplete) || [],
  );
  const areaTools = useMap3DStore(
    state => state.areas?.filter(a => a.isComplete) || [],
  );
  const distanceTools = useMap3DStore(
    state => state.lines?.filter(l => l.isComplete) || [],
  );

  const toolbarFeatures = getFeatures({ showInToolbar: true });

  // Notificar quando o visualizador estiver pronto
  useEffect(() => {
    if (cesiumMap && onViewerReady) {
      onViewerReady();
    }
  }, [cesiumMap, onViewerReady]);

  // Notificar erros se ocorrerem
  useEffect(() => {
    if (!cesiumMap && onError) {
      onError(new Error('Falha ao inicializar o mapa 3D'));
    }
  }, [cesiumMap, onError]);

  return (
    <MapContainer id="map-3d" role="application" aria-label="Visualização 3D">
      {cesiumMap && (
        <>
          {isMobile ? (
            <ToolbarContent />
          ) : (
            <RightSideToolBar
              features={toolbarFeatures}
              enabled={models.length > 0}
            />
          )}

          <ModelList />
          <IdentifyPanel />
          <LabelPanel />

          {isPanelOpen && <CatalogPanel />}

          {/* Renderizar resultados de medições ativas */}
          {viewshedTools.map(viewshed => (
            <ViewshedOptions key={viewshed.id} viewshedId={viewshed.id} />
          ))}

          {areaTools.map(area => (
            <AreaResult key={area.id} areaId={area.id} area={area.area || 0} />
          ))}

          {distanceTools.map(line => (
            <DistanceResult
              key={line.id}
              lineId={line.id}
              distance={line.distance || 0}
            />
          ))}
        </>
      )}
    </MapContainer>
  );
};

export default Map3DView;
