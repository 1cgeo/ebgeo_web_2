// Path: mapSig\components\MapSIGView\index.tsx
import { type FC, memo } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { MouseCoordinatesDisplay } from '@/mapSig/features/mouseCoordinates/MouseCoordinatesDisplay';

import { useMapSetup } from '../../hooks/useMapSetup';
import { type MapState } from '../../types';
import { RightSideToolBar } from '../RightSideToolBar';
import { MapContainer } from './styles';

interface MapSIGViewProps {
  initialState?: Partial<MapState>;
}

const MapSIGView: FC<MapSIGViewProps> = ({ initialState }) => {
  const map = useMapsStore.getState().map;

  useMapSetup({
    containerId: 'map-sig',
    initialState,
  });

  if (!map) return null;

  return (
    <MapContainer id="map-sig">
      <RightSideToolBar />
      <MouseCoordinatesDisplay />
    </MapContainer>
  );
};

export default memo(MapSIGView);
