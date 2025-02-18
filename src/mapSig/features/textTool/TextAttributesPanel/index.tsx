// Path: mapSig\features\textTool\TextAttributesPanel\index.tsx
import {
  Box,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from '@mui/material';

import { type FC } from 'react';

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
  const {
    selectedText,
    updateText,
    deleteText,
    closePanel,
    discardChanges,
    setAsDefault,
  } = useTextToolStore();

  if (!open || !selectedText) return null;

  const handleSetAsDefault = () => {
    if (selectedText) {
      const { id, coordinates, ...attributesToSet } = selectedText;
      setAsDefault(attributesToSet);
    }
  };

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
        min={1}
        max={100}
        step={1}
        marks={[
          { value: 1, label: '1' },
          { value: 50, label: '50' },
          { value: 100, label: '100' },
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

      <Typography gutterBottom>Rotação</Typography>
      <Slider
        value={selectedText.rotation}
        onChange={(_, value) =>
          updateText(selectedText.id, { rotation: value as number })
        }
        min={-180}
        max={180}
        step={1}
        marks={[
          { value: -180, label: '-180°' },
          { value: 0, label: '0°' },
          { value: 180, label: '180°' },
        ]}
      />

      <Select
        fullWidth
        value={selectedText.justify}
        onChange={e =>
          updateText(selectedText.id, {
            justify: e.target.value as 'left' | 'center' | 'right',
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
          color="warning"
          onClick={discardChanges}
        >
          Descartar
        </StyledButton>

        <StyledButton
          variant="outlined"
          color="error"
          onClick={() => deleteText(selectedText.id)}
        >
          Excluir
        </StyledButton>
      </ActionButtons>

      <Box mt={2}>
        <StyledButton
          variant="text"
          color="secondary"
          onClick={handleSetAsDefault}
          fullWidth
        >
          Definir como Padrão
        </StyledButton>
      </Box>
    </PanelContainer>
  );
};
