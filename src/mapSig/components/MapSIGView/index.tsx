import { memo } from 'react';
import { styled } from '@mui/material/styles';
import { RightSideToolBar } from '../RightSideToolBar';
import { BaseMapToggleControl } from '../../features/baseMapToggle/components/BaseMapToggleControl';
import { FeatureSearchControl } from '../../features/featureSearch/components/FeatureSearchControl';
import { ResetNorthControl } from '../../features/resetNorth/components/ResetNorthControl';
import { TextControl } from '../../features/textTool/components/TextControl';
import { VectorInfoControl } from '../../features/vectorInfo/components/VectorInfoControl';
import { useMapsStore } from '@/shared/store/mapsStore';

const MapContainer = styled('div')({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  top: 0,
  left: 0,
  height: '100vh',
  cursor: 'default',
});

function MapSIGView() {
  const { map } = useMapsStore();

  if (!map) return null;

  return (
    <MapContainer id="map-sig">
      <RightSideToolBar
        tools={[
          () => <BaseMapToggleControl key="BaseMap" />,
          () => <FeatureSearchControl key="FeatureSearch" />,
          () => <ResetNorthControl key="ResetNorth" />,
          () => <TextControl key="Text" />,
          () => <VectorInfoControl key="VectorInfo" />,
        ]}
      />
    </MapContainer>
  );
}

export default memo(MapSIGView);