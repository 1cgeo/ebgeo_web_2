// Path: map3d\features\viewshed\ViewshedControl\index.tsx
import { type FC, useCallback, useEffect } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DStore } from '@/map3d/store';

import { useViewshedStore } from '../store';
import { useViewshedDraw } from '../useViewshedDraw';

interface ViewshedControlProps {
  disabled?: boolean;
  active?: boolean;
}

export const ViewshedControl: FC<ViewshedControlProps> = ({
  disabled,
  active = true,
}) => {
  const { activeTool, setActiveTool, clearActiveTool } = useMap3DStore();
  const { startNewViewshed, reset } = useViewshedStore();

  // Initialize viewshed drawing functionality
  const { viewshedRefs } = useViewshedDraw();

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

  // Save viewshed refs to map store when active
  useEffect(() => {
    if (activeTool === 'viewshed') {
      // The useViewshedDraw hook is now active and handling interactions
    }
  }, [activeTool, viewshedRefs]);

  return (
    <Tool
      image="/images/icon-viewshed.svg"
      active={active}
      inUse={activeTool === 'viewshed'}
      disabled={disabled}
      tooltip="Analisar visibilidade"
      onClick={handleClick}
    />
  );
};
