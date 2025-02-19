// Path: map3d\features\clean\CleanControl\index.tsx
import { FC } from 'react';

import { Tool } from '../../../components/Tool';
import { useMap3DToolState } from '../../../store';
import { useClean } from '../useClean';

export const CleanControl: FC = () => {
  const { isEnabled } = useMap3DToolState('clean');
  const { cleanAll } = useClean();

  return (
    <Tool
      id="clean"
      image="/images/icon-clear.svg"
      tooltip="Limpar medições e análises"
      onClick={cleanAll}
      disabled={!isEnabled}
    />
  );
};
