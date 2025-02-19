// Path: map3d\features\distance\DistanceControl\index.tsx
import type { FC } from 'react';
import { useEffect } from 'react';

import { Tool } from '../../../components/Tool';
import { useMap3DToolState } from '../../../store';
import { useDistanceStore } from '../store';
import { DistanceToolState } from '../types';
import { useDistance } from '../useDistance';

export const DistanceControl: FC = () => {
  const { isActive, isEnabled } = useMap3DToolState('distance');
  const { startMeasuring, cancelMeasuring } = useDistance();
  const toolState = useDistanceStore(state => state.toolState);

  // Sincroniza o estado da ferramenta com o estado do mapa
  useEffect(() => {
    if (isActive && toolState !== DistanceToolState.MEASURING) {
      startMeasuring();
    } else if (!isActive && toolState === DistanceToolState.MEASURING) {
      cancelMeasuring();
    }
  }, [isActive, toolState, startMeasuring, cancelMeasuring]);

  return (
    <Tool
      id="distance"
      image="/images/icon-distance.svg"
      tooltip="Medir distância"
      active={isActive}
      disabled={!isEnabled}
    />
  );
};
