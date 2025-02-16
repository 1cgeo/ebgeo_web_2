// Path: mapSig\features\textTool\TextControl\index.tsx
import { type FC } from 'react';

import { Tool } from '@/mapSig/components/Tool';

import { TextAttributesPanel } from '../TextAttributesPanel';
import { useTextToolStore } from '../store';

interface TextControlProps {
  disabled?: boolean;
}

export const TextControl: FC<TextControlProps> = ({ disabled }) => {
  const { isPanelOpen } = useTextToolStore();

  return (
    <>
      <Tool
        id="textTool"
        image="/images/icon_text_black.svg"
        tooltip="Adicionar texto"
        disabled={disabled}
      />

      <TextAttributesPanel open={isPanelOpen} />
    </>
  );
};
