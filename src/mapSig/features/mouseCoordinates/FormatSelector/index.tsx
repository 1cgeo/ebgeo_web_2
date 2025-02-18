// Path: mapSig\features\mouseCoordinates\FormatSelector\index.tsx
import { List, Tooltip } from '@mui/material';

import { type FC, memo, useCallback } from 'react';

import { useMouseCoordinatesStore } from '../store';
import { type CoordinateFormat } from '../types';
import {
  FormatMenuItem,
  SelectorContainer,
  SelectorTitle,
  StyledPopover,
} from './styles';

interface FormatSelectorProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const formatOptions: {
  value: CoordinateFormat;
  label: string;
  description: string;
}[] = [
  {
    value: 'decimal',
    label: 'Decimal',
    description: 'Coordenadas em graus decimais (Lat/Lng)',
  },
  {
    value: 'dms',
    label: 'DMS',
    description: 'Graus, Minutos, Segundos',
  },
  {
    value: 'utm',
    label: 'UTM',
    description: 'Universal Transverse Mercator',
  },
  {
    value: 'mgrs',
    label: 'MGRS',
    description: 'Military Grid Reference System',
  },
];

const FormatSelectorComponent: FC<FormatSelectorProps> = ({
  anchorEl,
  onClose,
}) => {
  const { config, setFormat, closeFormatSelector } = useMouseCoordinatesStore();

  const handleFormatChange = useCallback(
    (format: CoordinateFormat) => {
      setFormat(format);
      closeFormatSelector();
    },
    [setFormat, closeFormatSelector],
  );

  return (
    <StyledPopover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      slotProps={{ paper: { elevation: 4 } }}
    >
      <SelectorContainer>
        <SelectorTitle>Formato de Coordenadas</SelectorTitle>
        <List disablePadding>
          {formatOptions.map(option => (
            <Tooltip
              key={option.value}
              title={option.description}
              placement="left"
              arrow
            >
              <FormatMenuItem
                onClick={() => handleFormatChange(option.value)}
                $selected={config.format === option.value}
              >
                {option.label}
              </FormatMenuItem>
            </Tooltip>
          ))}
        </List>
      </SelectorContainer>
    </StyledPopover>
  );
};

// Memorizamos o componente para evitar re-renders desnecessários
export const FormatSelector = memo(FormatSelectorComponent);
