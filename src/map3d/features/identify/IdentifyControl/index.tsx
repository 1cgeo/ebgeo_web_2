// Path: map3d\features\identify\IdentifyControl\index.tsx
import { type FC, useEffect } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DToolState } from '@/map3d/store';

import { FeatureInfoPanel } from '../IdentifyPanel';
import { useIdentifyStore } from '../store';
import { IdentifyToolState } from '../types';
import { useIdentify } from '../useIdentify';

export const IdentifyControl: FC = () => {
  const { isActive, isEnabled } = useMap3DToolState('identify');
  const { activateTool, deactivateTool } = useIdentify();
  const toolState = useIdentifyStore(state => state.toolState);

  // Sincroniza o estado da ferramenta com o estado do mapa
  useEffect(() => {
    if (isActive && toolState === IdentifyToolState.INACTIVE) {
      activateTool();
    } else if (!isActive && toolState !== IdentifyToolState.INACTIVE) {
      deactivateTool();
    }
  }, [isActive, toolState, activateTool, deactivateTool]);

  return (
    <>
      <Tool
        id="identify"
        image="/images/information_circle.svg"
        tooltip="Identificar elementos"
        active={isActive}
        disabled={!isEnabled}
      />
      <FeatureInfoPanel />
    </>
  );
};
