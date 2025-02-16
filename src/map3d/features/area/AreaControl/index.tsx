// Path: map3d\features\area\AreaControl\index.tsx
import { type FC, useCallback } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DStore } from '@/map3d/store';

import { useAreaStore } from '../store';

interface AreaControlProps {
  disabled?: boolean;
}

export const AreaControl: FC<AreaControlProps> = ({ disabled }) => {
  const { activeTool, setActiveTool, clearActiveTool } = useMap3DStore();
  const { startNewArea, reset } = useAreaStore();

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

  return (
    <Tool
      image="/images/icon-area.svg"
      active={true}
      inUse={activeTool === 'area'}
      disabled={disabled}
      tooltip="Medir área"
      onClick={handleClick}
    />
  );
};
