// Path: mapSig\features\textTool\TextAttributesPanel\index.tsx
import {
  Box,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from '@mui/material';

import React, { type FC } from 'react';

import { useTextToolStore } from '../store';
import {
  ActionButtons,
  ColorInput,
  PanelContainer,
  StyledButton,
} from './styles';

interface TextAttributesPanelProps {
  open: boolean;
}

export const TextAttributesPanel: FC<TextAttributesPanelProps> = ({ open }) => {
  const { selectedText, updateText, deleteText, closePanel } =
    useTextToolStore();

  if (!open || !selectedText) return null;

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
        value={selectedText.text}
        onChange={e => updateText(selectedText.id, { text: e.target.value })}
        margin="normal"
      />

      <Typography gutterBottom>Tamanho</Typography>
      <Slider
        value={selectedText.size}
        onChange={(_, value) =>
          updateText(selectedText.id, { size: value as number })
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
        value={selectedText.color}
        onChange={e => updateText(selectedText.id, { color: e.target.value })}
        margin="normal"
      />

      <ColorInput
        fullWidth
        label="Cor de fundo"
        type="color"
        value={selectedText.backgroundColor}
        onChange={e =>
          updateText(selectedText.id, { backgroundColor: e.target.value })
        }
        margin="normal"
      />

      <Select
        fullWidth
        value={selectedText.align}
        onChange={e =>
          updateText(selectedText.id, {
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
          onClick={() => deleteText(selectedText.id)}
        >
          Excluir
        </StyledButton>
      </ActionButtons>
    </PanelContainer>
  );
};
