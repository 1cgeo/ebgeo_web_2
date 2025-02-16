// Path: map3d\features\area\AreaResult\index.tsx
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';

import { type FC } from 'react';

import { useAreaStore } from '../store';
import { ResultContainer, ResultText } from './styles';

interface AreaResultProps {
  areaId: string;
  area: number;
}

export const AreaResult: FC<AreaResultProps> = ({ areaId, area }) => {
  const { removeArea } = useAreaStore();

  const formatArea = (area: number): string => {
    if (area >= 1000000) {
      return `${(area / 1000000).toFixed(2)} km²`;
    }
    return `${area.toFixed(2)} m²`;
  };

  return (
    <ResultContainer>
      <ResultText>{formatArea(area)}</ResultText>
      <IconButton
        size="small"
        onClick={() => removeArea(areaId)}
        sx={{ color: 'inherit' }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </ResultContainer>
  );
};
