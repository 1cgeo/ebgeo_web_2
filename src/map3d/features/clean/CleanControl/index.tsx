// Path: map3d\features\clean\CleanControl\index.tsx
import { type FC, useCallback } from 'react';

import { Tool } from '@/map3d/components/Tool';

import { useCleanStore } from '../store';

interface CleanControlProps {
  disabled?: boolean;
}

export const CleanControl: FC<CleanControlProps> = ({ disabled }) => {
  const { clearAll } = useCleanStore();

  const handleClick = useCallback(() => {
    clearAll();
  }, [clearAll]);

  return (
    <Tool
      image="/images/icon-clear.svg"
      active={true}
      disabled={disabled}
      tooltip="Limpar medições e análises"
      onClick={handleClick}
    />
  );
};
