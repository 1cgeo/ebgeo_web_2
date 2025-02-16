// Path: map3d\features\label\LabelPanel\index.tsx
import { MenuItem, Select, Slider, TextField, Typography } from '@mui/material';

import { type FC } from 'react';

import { useLabelStore } from '../store';
import {
  ActionButtons,
  ColorInput,
  PanelContainer,
  StyledButton,
} from './styles';

export const LabelPanel: FC = () => {
  const { selectedLabel, updateLabel, removeLabel, closePanel } =
    useLabelStore();

  if (!selectedLabel) return null;

  return (
    <PanelContainer>
      <Typography variant="h6" gutterBottom>
        Propriedades do Texto
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Texto"
        value={selectedLabel.properties.text}
        onChange={e => updateLabel(selectedLabel.id, { text: e.target.value })}
        margin="normal"
      />

      <Typography gutterBottom>Tamanho</Typography>
      <Slider
        value={selectedLabel.properties.size}
        onChange={(_, value) =>
          updateLabel(selectedLabel.id, { size: value as number })
        }
        min={8}
        max={72}
        step={1}
        marks={[
          { value: 8, label: '8' },
          { value: 38, label: '38' },
          { value: 72, label: '72' },
        ]}
      />

      <ColorInput
        fullWidth
        label="Cor do texto"
        type="color"
        value={selectedLabel.properties.fillColor}
        onChange={e =>
          updateLabel(selectedLabel.id, { fillColor: e.target.value })
        }
        margin="normal"
      />

      <ColorInput
        fullWidth
        label="Cor de fundo"
        type="color"
        value={selectedLabel.properties.backgroundColor}
        onChange={e =>
          updateLabel(selectedLabel.id, { backgroundColor: e.target.value })
        }
        margin="normal"
      />

      <Select
        fullWidth
        value={selectedLabel.properties.align}
        onChange={e =>
          updateLabel(selectedLabel.id, {
            align: e.target.value as 'left' | 'center' | 'right',
          })
        }
        margin="dense"
      >
        <MenuItem value="left">Esquerda</MenuItem>
        <MenuItem value="center">Centro</MenuItem>
        <MenuItem value="right">Direita</MenuItem>
      </Select>

      <ActionButtons>
        <StyledButton variant="contained" color="primary" onClick={closePanel}>
          Concluir
        </StyledButton>
        <StyledButton
          variant="outlined"
          color="error"
          onClick={() => {
            removeLabel(selectedLabel.id);
          }}
        >
          Excluir
        </StyledButton>
      </ActionButtons>
    </PanelContainer>
  );
};
