// Path: map3d\features\label\LabelControl\index.tsx
import { type FC, useCallback } from 'react';

import { Tool } from '@/map3d/components/Tool';
import { useMap3DStore } from '@/map3d/store';

import { useLabelStore } from '../store';

interface LabelControlProps {
  disabled?: boolean;
}

export const LabelControl: FC<LabelControlProps> = ({ disabled }) => {
  const { activeTool, setActiveTool, clearActiveTool } = useMap3DStore();
  const { reset } = useLabelStore();

  const handleClick = useCallback(() => {
    const isActive = activeTool === 'label';

    if (isActive) {
      clearActiveTool();
      reset();
    } else {
      setActiveTool('label');
    }
  }, [activeTool, setActiveTool, clearActiveTool, reset]);

  return (
    <Tool
      image="/images/icon_text_black.svg"
      active={true}
      inUse={activeTool === 'label'}
      disabled={disabled}
      tooltip="Adicionar texto"
      onClick={handleClick}
    />
  );
};
