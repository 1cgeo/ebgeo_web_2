// Path: map3d\features\distance\DistanceResult\index.tsx
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';

import { type FC } from 'react';

import { useDistanceStore } from '../store';
import { ResultContainer, ResultText } from './styles';

interface DistanceResultProps {
  lineId: string;
  distance: number;
}

export const DistanceResult: FC<DistanceResultProps> = ({
  lineId,
  distance,
}) => {
  const { removeLine } = useDistanceStore();

  const formatDistance = (distance: number): string => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`;
    }
    return `${distance.toFixed(2)} m`;
  };

  return (
    <ResultContainer>
      <ResultText>{formatDistance(distance)}</ResultText>
      <IconButton
        size="small"
        onClick={() => removeLine(lineId)}
        sx={{ color: 'inherit' }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </ResultContainer>
  );
};
