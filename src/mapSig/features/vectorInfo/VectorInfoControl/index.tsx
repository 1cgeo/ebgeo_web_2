// Path: mapSig\features\vectorInfo\VectorInfoControl\index.tsx
import { type FC, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { Tool } from '@/mapSig/components/Tool';

import { VectorInfoPanel } from '../VectorInfoPanel';
import { useVectorInfoStore } from '../store';
import { type VectorFeature } from '../types';

export const VectorInfoControl: FC = () => {
  const { map } = useMapsStore();
  const { isActive, isPanelOpen, setActive, selectFeature } =
    useVectorInfoStore();

  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e: any) => {
      if (!isActive) return;

      const features = map.queryRenderedFeatures(e.point) as VectorFeature[];
      if (features.length > 0) {
        selectFeature(features);
      }
    };

    if (isActive) {
      map.on('click', handleMapClick);
    } else {
      map.off('click', handleMapClick);
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isActive, selectFeature]);

  return (
    <>
      <Tool
        id="vectorInfo"
        image="/images/information_circle.svg"
        tooltip="Identificar elementos"
        disabled={false}
        onClick={() => setActive(!isActive)}
      />

      <VectorInfoPanel open={isPanelOpen} />
    </>
  );
};
