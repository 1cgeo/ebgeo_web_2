// Path: mapSig\features\vectorInfo\VectorInfoControl\index.tsx
import { type FC } from 'react';

import { Tool } from '@/mapSig/components/Tool';

import { VectorInfoPanel } from '../VectorInfoPanel';
import { useVectorInfoStore } from '../store';

interface VectorInfoControlProps {
  disabled?: boolean;
}

export const VectorInfoControl: FC<VectorInfoControlProps> = ({ disabled }) => {
  const { isPanelOpen } = useVectorInfoStore();

  return (
    <>
      <Tool
        id="vectorInfo"
        image="/images/information_circle.svg"
        tooltip="Identificar elementos"
        disabled={disabled}
      />

      <VectorInfoPanel open={isPanelOpen} />
    </>
  );
};
