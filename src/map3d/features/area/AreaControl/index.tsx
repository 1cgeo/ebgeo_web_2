// Path: map3d\features\area\AreaControl\index.tsx
import { type FC, useCallback, useEffect } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DStore } from '@/map3d/store';

import { useAreaStore } from '../store';
import { useAreaDraw } from '../useAreaDraw';

interface AreaControlProps {
  disabled?: boolean;
  active?: boolean;
}

export const AreaControl: FC<AreaControlProps> = ({
  disabled,
  active = true,
}) => {
  const { activeTool, setActiveTool, clearActiveTool } = useMap3DStore();
  const { startNewArea, reset } = useAreaStore();

  // Initialize area drawing functionality
  const { calculateArea } = useAreaDraw();

  const handleClick = useCallback(() => {
    const isActive = activeTool === 'area';

    if (isActive) {
      clearActiveTool();
      reset();
    } else {
      setActiveTool('area');
      startNewArea();
    }
  }, [activeTool, setActiveTool, clearActiveTool, startNewArea, reset]);

  // Ensure the area calculation is available
  useEffect(() => {
    if (activeTool === 'area') {
      // The useAreaDraw hook is now active and handling interactions
    }
  }, [activeTool, calculateArea]);

  return (
    <Tool
      image="/images/icon-area.svg"
      active={active}
      inUse={activeTool === 'area'}
      disabled={disabled}
      tooltip="Medir área"
      onClick={handleClick}
    />
  );
};
