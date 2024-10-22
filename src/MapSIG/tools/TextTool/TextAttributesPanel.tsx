import React, { useState, useEffect } from 'react';
import { TextField, Slider, Select, MenuItem, Typography } from '@mui/material';
import FeaturePanel from '../../../components/FeaturePanel';
import { useSelection } from '../../contexts/SelectionContext';
import {
  TextAttributesPanelProps,
  TextFeature
} from "../../../ts/interfaces/mapSig.interfaces";

const TextAttributesPanel: React.FC<TextAttributesPanelProps> = ({
  updateFeatures,
  deleteFeatures,
  onClose
}) => {
  const { selectedFeatures } = useSelection();
  const [localFeatures, setLocalFeatures] = useState<TextFeature[]>([]);

  useEffect(() => {
    setLocalFeatures(selectedFeatures as TextFeature[]);
  }, [selectedFeatures]);

  const handleChange = (property: keyof TextFeature['properties'], value: any) => {
    setLocalFeatures(prev => prev.map(feature => ({
      ...feature,
      properties: { ...feature.properties, [property]: value }
    })));
  };

  return (
    <FeaturePanel
      title="Propriedades do Texto"
      onUpdate={()=> updateFeatures(localFeatures)}
      onDelete={()=> deleteFeatures(localFeatures)}
      onClose={onClose}
    >
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Texto"
        value={localFeatures[0]?.properties.text || ''}
        onChange={(e) => handleChange('text', e.target.value)}
        margin="normal"
      />
      <Typography gutterBottom>Tamanho</Typography>
      <Slider
        value={localFeatures[0]?.properties.size || 16}
        onChange={(_, value) => handleChange('size', value as number)}
        min={1}
        max={100}
        step={1}
      />
      <TextField
        fullWidth
        type="color"
        label="Cor"
        value={localFeatures[0]?.properties.color || '#000000'}
        onChange={(e) => handleChange('color', e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        type="color"
        label="Cor de Fundo"
        value={localFeatures[0]?.properties.backgroundColor || '#ffffff'}
        onChange={(e) => handleChange('backgroundColor', e.target.value)}
        margin="normal"
      />
      <Typography gutterBottom>Rotação</Typography>
      <Slider
        value={localFeatures[0]?.properties.rotation || 0}
        onChange={(_, value) => handleChange('rotation', value as number)}
        min={-180}
        max={180}
        step={1}
      />
      <Select
        fullWidth
        value={localFeatures[0]?.properties.justify || 'center'}
        onChange={(e) => handleChange('justify', e.target.value as 'left' | 'center' | 'right')}
      >
        <MenuItem value="left">Esquerda</MenuItem>
        <MenuItem value="center">Centro</MenuItem>
        <MenuItem value="right">Direita</MenuItem>
      </Select>
    </FeaturePanel>
  );
};

export default TextAttributesPanel;