import React, { type FC } from 'react';
import { 
  TextField,
  Slider,
  Select,
  MenuItem,
  Typography,
  Box
} from '@mui/material';
import { useTextToolStore } from '../../store';
import { StyledPanel, ColorInput } from './styles';

interface TextAttributesPanelProps {
  open: boolean;
}

export const TextAttributesPanel: FC<TextAttributesPanelProps> = ({ open }) => {
  const { 
    selectedText, 
    updateText, 
    deleteText, 
    closePanel 
  } = useTextToolStore();

  if (!open || !selectedText) return null;

  const handleUpdate = (field: string, value: string | number) => {
    updateText(selectedText.id, { [field]: value });
  };

  return (
    <StyledPanel>
      <Typography variant="h6" gutterBottom>
        Propriedades do Texto
      </Typography>

      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Texto"
          value={selectedText.text}
          onChange={(e) => handleUpdate('text', e.target.value)}
          margin="normal"
        />

        <Typography gutterBottom>Tamanho</Typography>
        <Slider
          value={selectedText.size}
          onChange={(_, value) => handleUpdate('size', value as number)}
          min={8}
          max={72}
          step={1}
        />

        <ColorInput
          fullWidth
          label="Cor do texto"
          type="color"
          value={selectedText.color}
          onChange={(e) => handleUpdate('color', e.target.value)}
          margin="normal"
        />

        <ColorInput
          fullWidth
          label="Cor de fundo"
          type="color"
          value={selectedText.backgroundColor}
          onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
          margin="normal"
        />

        <Select
          fullWidth
          value={selectedText.align}
          onChange={(e) => handleUpdate('align', e.target.value)}
          margin="dense"
        >
          <MenuItem value="left">Esquerda</MenuItem>
          <MenuItem value="center">Centro</MenuItem>
          <MenuItem value="right">Direita</MenuItem>
        </Select>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => deleteText(selectedText.id)}>
            Excluir
          </button>
          <button onClick={closePanel}>
            Fechar
          </button>
        </Box>
      </Box>
    </StyledPanel>
  );
};