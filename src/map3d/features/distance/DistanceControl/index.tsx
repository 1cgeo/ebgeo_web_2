// Path: map3d\features\distance\DistanceControl\index.tsx
import { type FC, useCallback } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DStore } from '@/map3d/store';

import { useDistanceStore } from '../store';

interface DistanceControlProps {
  disabled?: boolean;
}

export const DistanceControl: FC<DistanceControlProps> = ({ disabled }) => {
  const { activeTool, setActiveTool, clearActiveTool } = useMap3DStore();
  const { startNewLine, reset } = useDistanceStore();

  const handleClick = useCallback(() => {
    const isActive = activeTool === 'distance';

    if (isActive) {
      clearActiveTool();
      reset();
    } else {
      setActiveTool('distance');
      startNewLine();
    }
  }, [activeTool, setActiveTool, clearActiveTool, startNewLine, reset]);

  return (
    <Tool
      image="/images/icon-distance.svg"
      active={true}
      inUse={activeTool === 'distance'}
      disabled={disabled}
      tooltip="Medir distância"
      onClick={handleClick}
    />
  );
};
