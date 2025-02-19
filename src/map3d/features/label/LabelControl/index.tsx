// Path: map3d\features\label\LabelControl\index.tsx
import { type FC, useCallback, useEffect } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DStore } from '@/map3d/store';

import { useLabelStore } from '../store';
import { useLabel } from '../useLabel';

interface LabelControlProps {
  disabled?: boolean;
  active?: boolean;
}

export const LabelControl: FC<LabelControlProps> = ({
  disabled,
  active = true,
}) => {
  const { activeTool, setActiveTool, clearActiveTool } = useMap3DStore();
  const { reset, selectLabel } = useLabelStore();

  // Initialize label functionality
  const labelUtils = useLabel();

  const handleClick = useCallback(() => {
    const isActive = activeTool === 'label';

    if (isActive) {
      clearActiveTool();
      reset();
    } else {
      setActiveTool('label');
    }
  }, [activeTool, setActiveTool, clearActiveTool, reset]);

  // Set up label selection handler
  useEffect(() => {
    if (activeTool === 'label') {
      const unsubscribe = labelUtils.onSelect(label => {
        selectLabel(label);
      });

      return unsubscribe;
    }
  }, [activeTool, labelUtils, selectLabel]);

  return (
    <Tool
      image="/images/icon_text_black.svg"
      active={active}
      inUse={activeTool === 'label'}
      disabled={disabled}
      tooltip="Adicionar texto"
      onClick={handleClick}
    />
  );
};
