// Path: mapSig\features\resetNorth\ResetNorthControl\index.tsx
import ExploreIcon from '@mui/icons-material/Explore';
import { Tooltip } from '@mui/material';

import { type FC } from 'react';

import { useResetNorthStore } from '../store';
import { StyledIconButton } from './styles';

export const ResetNorthControl: FC = () => {
  const { resetBearing, isResetting } = useResetNorthStore();

  return (
    <Tooltip title="Apontar para o Norte" placement="left">
      <StyledIconButton
        onClick={resetBearing}
        disabled={isResetting}
        $isResetting={isResetting}
      >
        <ExploreIcon />
      </StyledIconButton>
    </Tooltip>
  );
};
