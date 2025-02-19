// Path: map3d\features\distance\DistanceControl\index.tsx
import { type FC, useCallback, useEffect } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DStore } from '@/map3d/store';

import { useDistanceStore } from '../store';
import { useDistanceDraw } from '../useDistanceDraw';

interface DistanceControlProps {
  disabled?: boolean;
  active?: boolean;
}

export const DistanceControl: FC<DistanceControlProps> = ({
  disabled,
  active = true,
}) => {
  const { activeTool, setActiveTool, clearActiveTool } = useMap3DStore();
  const { startNewLine, reset } = useDistanceStore();

  // Initialize distance drawing functionality
  const { calculateDistance } = useDistanceDraw();

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

  // Ensure the distance calculation is available
  useEffect(() => {
    if (activeTool === 'distance') {
      // The useDistanceDraw hook is now active and handling interactions
    }
  }, [activeTool, calculateDistance]);

  return (
    <Tool
      image="/images/icon-distance.svg"
      active={active}
      inUse={activeTool === 'distance'}
      disabled={disabled}
      tooltip="Medir distância"
      onClick={handleClick}
    />
  );
};
