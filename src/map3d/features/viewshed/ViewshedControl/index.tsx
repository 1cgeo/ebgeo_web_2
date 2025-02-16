// Path: map3d\features\viewshed\ViewshedControl\index.tsx
import { type FC, useCallback } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DStore } from '@/map3d/store';

import { useViewshedStore } from '../store';

interface ViewshedControlProps {
  disabled?: boolean;
}

export const ViewshedControl: FC<ViewshedControlProps> = ({ disabled }) => {
  const { activeTool, setActiveTool, clearActiveTool } = useMap3DStore();
  const { startNewViewshed, reset } = useViewshedStore();

  const handleClick = useCallback(() => {
    const isActive = activeTool === 'viewshed';

    if (isActive) {
      clearActiveTool();
      reset();
    } else {
      setActiveTool('viewshed');
      startNewViewshed();
    }
  }, [activeTool, setActiveTool, clearActiveTool, startNewViewshed, reset]);

  return (
    <Tool
      image="/images/icon-viewshed.svg"
      active={true}
      inUse={activeTool === 'viewshed'}
      disabled={disabled}
      tooltip="Analisar visibilidade"
      onClick={handleClick}
    />
  );
};
