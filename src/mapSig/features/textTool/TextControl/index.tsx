// Path: mapSig\features\textTool\TextControl\index.tsx
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { Tooltip } from '@mui/material';

import { type FC, useEffect } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { TextAttributesPanel } from '../TextAttributesPanel';
import { useTextToolStore } from '../store';
import { StyledIconButton } from './styles';

export const TextControl: FC = () => {
  const { isActive, setActive, addText, isPanelOpen } = useTextToolStore();

  const map = useMapsStore(state => state.map);

  useEffect(() => {
    if (!map || !isActive) return;

    const handleClick = (e: any) => {
      addText({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
      });
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, isActive, addText]);

  return (
    <>
      <Tooltip title="Adicionar texto" placement="left">
        <StyledIconButton
          onClick={() => setActive(!isActive)}
          $active={isActive}
        >
          <TextFieldsIcon />
        </StyledIconButton>
      </Tooltip>

      <TextAttributesPanel open={isPanelOpen} />
    </>
  );
};
