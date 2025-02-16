import React, { type FC } from 'react';
import { Tooltip } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import { useResetNorthStore } from '../../store';
import { StyledIconButton } from './styles';

export const ResetNorthControl: FC = () => {
  const { resetBearing } = useResetNorthStore();

  return (
    <Tooltip title="Apontar para o Norte" placement="left">
      <StyledIconButton onClick={resetBearing}>
        <ExploreIcon />
      </StyledIconButton>
    </Tooltip>
  );
};