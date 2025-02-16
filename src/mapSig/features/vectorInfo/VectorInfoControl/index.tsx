// Path: mapSig\features\vectorInfo\VectorInfoControl\index.tsx
import LayersIcon from '@mui/icons-material/Layers';
import { Tooltip } from '@mui/material';

import { type FC, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { VectorInfoPanel } from '../VectorInfoPanel';
import { useVectorInfoStore } from '../store';
import { StyledIconButton } from './styles';

export const VectorInfoControl: FC = () => {
  const { isActive, setActive, selectFeature, refreshLayers, isPanelOpen } =
    useVectorInfoStore();

  const map = useMapsStore(state => state.map);

  useEffect(() => {
    if (!map) return;

    refreshLayers();

    const handleStyleData = () => {
      refreshLayers();
    };

    map.on('styledata', handleStyleData);

    return () => {
      map.off('styledata', handleStyleData);
    };
  }, [map, refreshLayers]);

  useEffect(() => {
    if (!map || !isActive) return;

    const handleClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point);

      if (features.length > 0) {
        const feature = features[0];
        selectFeature({
          id: feature.id as string,
          layerId: feature.layer.id,
          properties: feature.properties,
          geometry: feature.geometry,
        });
      } else {
        selectFeature(null);
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, isActive, selectFeature]);

  return (
    <>
      <Tooltip title="Informações das camadas" placement="left">
        <StyledIconButton
          onClick={() => setActive(!isActive)}
          $active={isActive}
        >
          <LayersIcon />
        </StyledIconButton>
      </Tooltip>

      <VectorInfoPanel open={isPanelOpen} />
    </>
  );
};
