// Path: map3d\features\viewshed\ViewshedOptions\index.tsx
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Slider, Typography } from '@mui/material';

import { type FC } from 'react';

import { useViewshedStore } from '../store';
import { OptionGroup, OptionsContainer } from './styles';

interface ViewshedOptionsProps {
  viewshedId: string;
}

export const ViewshedOptions: FC<ViewshedOptionsProps> = ({ viewshedId }) => {
  const { viewsheds, updateViewshedOptions, removeViewshed } =
    useViewshedStore();

  const viewshed = viewsheds.find(vs => vs.id === viewshedId);
  if (!viewshed) return null;

  return (
    <OptionsContainer>
      <Typography variant="subtitle2" gutterBottom>
        Configurações de Visibilidade
      </Typography>

      <OptionGroup>
        <Typography variant="body2">
          Ângulo Horizontal: {viewshed.horizontalAngle}°
        </Typography>
        <Slider
          value={viewshed.horizontalAngle}
          onChange={(_, value) =>
            updateViewshedOptions({
              horizontalAngle: value as number,
            })
          }
          min={0}
          max={360}
          step={1}
        />
      </OptionGroup>

      <OptionGroup>
        <Typography variant="body2">
          Ângulo Vertical: {viewshed.verticalAngle}°
        </Typography>
        <Slider
          value={viewshed.verticalAngle}
          onChange={(_, value) =>
            updateViewshedOptions({
              verticalAngle: value as number,
            })
          }
          min={0}
          max={180}
          step={1}
        />
      </OptionGroup>

      <OptionGroup>
        <Typography variant="body2">Distância: {viewshed.distance}m</Typography>
        <Slider
          value={viewshed.distance}
          onChange={(_, value) =>
            updateViewshedOptions({
              distance: value as number,
            })
          }
          min={1}
          max={100}
          step={1}
        />
      </OptionGroup>

      <IconButton
        size="small"
        onClick={() => removeViewshed(viewshedId)}
        color="error"
      >
        <DeleteIcon />
      </IconButton>
    </OptionsContainer>
  );
};
