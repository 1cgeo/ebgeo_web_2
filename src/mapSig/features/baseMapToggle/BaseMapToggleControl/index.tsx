// Path: mapSig\features\baseMapToggle\BaseMapToggleControl\index.tsx
import { Tooltip } from '@mui/material';

import { type FC } from 'react';

import { useBaseMapStore } from '../store';
import { StyledIconButton } from './styles';

interface BaseMapToggleControlProps {
  disabled?: boolean;
}

export const BaseMapToggleControl: FC<BaseMapToggleControlProps> = ({
  disabled,
}) => {
  const { currentStyle, toggleBaseMap } = useBaseMapStore();

  const getTooltipText = () =>
    `Alternar para mapa ${currentStyle === 'orto' ? 'topográfico' : 'ortoimagem'}`;

  const getIconName = () => (currentStyle === 'orto' ? 'topo' : 'orto');

  return (
    <Tooltip title={getTooltipText()} placement="left">
      <StyledIconButton onClick={toggleBaseMap} disabled={disabled}>
        <img
          src={`/images/icon-${getIconName()}.svg`}
          alt="Toggle base map"
          width={24}
          height={24}
        />
      </StyledIconButton>
    </Tooltip>
  );
};
