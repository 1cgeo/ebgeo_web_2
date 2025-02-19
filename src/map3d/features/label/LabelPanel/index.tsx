// Path: map3d\features\label\LabelPanel\index.tsx
import {
  Box,
  Button,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from '@mui/material';

import { FC, useEffect, useState } from 'react';

import { type LabelProperties } from '../types';
import { PanelContainer } from './styles';

interface TextAttributesPanelProps {
  properties: LabelProperties;
  onUpdate: (properties: LabelProperties) => void;
  onDelete: (labelId: string) => void;
  onClose: () => void;
}

export const TextAttributesPanel: FC<TextAttributesPanelProps> = ({
  properties,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [localProperties, setLocalProperties] =
    useState<LabelProperties>(properties);

  // Atualiza as propriedades locais quando as propriedades mudam
  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  const handleChange = <K extends keyof LabelProperties>(
    property: K,
    value: LabelProperties[K],
  ) => {
    setLocalProperties(prev => ({
      ...prev,
      [property]: value,
    }));
  };

  const handleApply = () => {
    onUpdate(localProperties);
  };

  const handleDelete = () => {
    onDelete(properties.id);
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
        value={localProperties.text}
        onChange={e => handleChange('text', e.target.value)}
        margin="normal"
      />

      <Typography gutterBottom>Tamanho</Typography>
      <Slider
        value={localProperties.size}
        onChange={(_, value) => handleChange('size', value as number)}
        min={1}
        max={100}
        step={1}
        marks={[
          { value: 1, label: '1' },
          { value: 50, label: '50' },
          { value: 100, label: '100' },
        ]}
      />

      <TextField
        fullWidth
        type="color"
        label="Cor do texto"
        value={localProperties.fillColor}
        onChange={e => handleChange('fillColor', e.target.value)}
        margin="normal"
      />

      <TextField
        fullWidth
        type="color"
        label="Cor de fundo"
        value={localProperties.backgroundColor}
        onChange={e => handleChange('backgroundColor', e.target.value)}
        margin="normal"
      />

      <Typography gutterBottom>Alinhamento</Typography>
      <Select
        fullWidth
        value={localProperties.align}
        onChange={e =>
          handleChange('align', e.target.value as 'left' | 'center' | 'right')
        }
        margin="dense"
      >
        <MenuItem value="left">Esquerda</MenuItem>
        <MenuItem value="center">Centro</MenuItem>
        <MenuItem value="right">Direita</MenuItem>
      </Select>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" color="primary" onClick={handleApply}>
          Aplicar
        </Button>

        <Button variant="outlined" color="error" onClick={handleDelete}>
          Excluir
        </Button>

        <Button variant="outlined" onClick={onClose}>
          Fechar
        </Button>
      </Box>
    </PanelContainer>
  );
};
