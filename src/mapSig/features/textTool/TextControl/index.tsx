// Path: mapSig\features\textTool\TextControl\index.tsx
import { type FC, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { Tool } from '@/mapSig/components/Tool';

import { TextAttributesPanel } from '../TextAttributesPanel';
import { useTextToolStore } from '../store';
import { useTextLayer } from '../useTextLayer';

export const TextControl: FC = () => {
  const { map } = useMapsStore();
  const { isActive, isPanelOpen, texts, setActive, addText } =
    useTextToolStore();
  const { updateLayer } = useTextLayer();

  // Atualiza a camada sempre que os textos mudarem
  useEffect(() => {
    updateLayer(texts);
  }, [texts, updateLayer]);

  // Gerencia clicks no mapa
  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e: any) => {
      if (!isActive) return;

      const coordinates = map.unproject([e.originalEvent.x, e.originalEvent.y]);
      addText(coordinates);
      setActive(false);
    };

    if (isActive) {
      map.on('click', handleMapClick);
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isActive, addText, setActive]);

  return (
    <>
      <Tool
        id="textTool"
        image="/images/icon_text_black.svg"
        tooltip="Adicionar texto"
        onClick={() => setActive(!isActive)}
      />

      <TextAttributesPanel open={isPanelOpen} />
    </>
  );
};
