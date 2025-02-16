import { type FC, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { useTextToolStore } from '../../store';
import { useMapsStore } from '@/shared/store/mapsStore';
import { StyledIconButton } from './styles';
import { TextAttributesPanel } from '../TextAttributesPanel';

export const TextControl: FC = () => {
  const { 
    isActive, 
    setActive, 
    addText, 
    isPanelOpen 
  } = useTextToolStore();
  
  const map = useMapsStore(state => state.map);

  useEffect(() => {
    if (!map || !isActive) return;

    const handleClick = (e: any) => {
      addText({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat
      });
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, isActive, addText]);

  const handleToggle = () => {
    setActive(!isActive);
  };

  return (
    <>
      <Tooltip title="Adicionar texto" placement="left">
        <StyledIconButton 
          onClick={handleToggle}
          $active={isActive}
        >
          <TextFieldsIcon />
        </StyledIconButton>
      </Tooltip>

      <TextAttributesPanel open={isPanelOpen} />
    </>
  );
};