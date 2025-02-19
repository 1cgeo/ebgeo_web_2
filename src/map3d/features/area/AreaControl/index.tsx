// Path: map3d\features\area\AreaControl\index.tsx
import type { FC } from 'react';
import { useEffect } from 'react';

import { Tool } from '../../../components/Tool';
import { useMap3DToolState } from '../../../store';
import { useAreaStore } from '../store';
import { AreaToolState } from '../types';
import { useArea } from '../useArea';

export const AreaControl: FC = () => {
  const { isActive, isEnabled } = useMap3DToolState('area');
  const { startMeasuring, cancelMeasuring } = useArea();
  const toolState = useAreaStore(state => state.toolState);

  // Sincroniza o estado da ferramenta com o estado do mapa
  useEffect(() => {
    if (isActive && toolState !== AreaToolState.MEASURING) {
      startMeasuring();
    } else if (!isActive && toolState === AreaToolState.MEASURING) {
      cancelMeasuring();
    }
  }, [isActive, toolState, startMeasuring, cancelMeasuring]);

  return (
    <Tool
      id="area"
      image="/images/icon-area.svg"
      tooltip="Medir área"
      active={isActive}
      disabled={!isEnabled}
    />
  );
};
