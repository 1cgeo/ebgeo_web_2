// Path: map3d\features\clean\CleanControl\index.tsx
import { type FC, useCallback } from 'react';

import { Tool } from '@/map3d/components/Tool';

import { useCleanStore } from '../store';

interface CleanControlProps {
  disabled?: boolean;
}

export const CleanControl: FC<CleanControlProps> = ({ disabled }) => {
  const { clearAll, config, isEnabled } = useCleanStore();

  const handleClick = useCallback(() => {
    clearAll();
  }, [clearAll]);

  // Se o componente estiver desabilitado externamente ou o store indicar que não está habilitado
  const isDisabled = disabled || !isEnabled;

  return (
    <Tool
      image={config.icon}
      active={true}
      disabled={isDisabled}
      tooltip={config.tooltip}
      onClick={handleClick}
    />
  );
};
