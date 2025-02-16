// Path: map3d\features\identify\IdentifyControl\index.tsx
import { type FC, useCallback } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DStore } from '@/map3d/store';

import { useIdentifyStore } from '../store';

interface IdentifyControlProps {
  disabled?: boolean;
}

export const IdentifyControl: FC<IdentifyControlProps> = ({ disabled }) => {
  const { activeTool, setActiveTool, clearActiveTool } = useMap3DStore();
  const { reset } = useIdentifyStore();

  const handleClick = useCallback(() => {
    const isActive = activeTool === 'identify';

    if (isActive) {
      clearActiveTool();
      reset();
    } else {
      setActiveTool('identify');
    }
  }, [activeTool, setActiveTool, clearActiveTool, reset]);

  return (
    <Tool
      image="/images/information_circle.svg"
      active={true}
      inUse={activeTool === 'identify'}
      disabled={disabled}
      tooltip="Identificar elementos"
      onClick={handleClick}
    />
  );
};
