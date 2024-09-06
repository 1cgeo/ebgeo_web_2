import React, { useState, useEffect } from 'react';
import { Box, Typography, Slider, Button, TextField, Select, MenuItem } from '@mui/material';

interface TextFeature {
  id: string;
  type: 'Feature';
  properties: {
    text: string;
    size: number;
    color: string;
    backgroundColor: string;
    rotation: number;
    justify: 'left' | 'center' | 'right';
    source: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface TextAttributesPanelProps {
  features: TextFeature[];
  updateFeatures: (features: TextFeature[]) => void;
  deleteFeatures: (features: TextFeature[]) => void;
  onClose: () => void;
}

const TextAttributesPanel: React.FC<TextAttributesPanelProps> = ({
  features,
  updateFeatures,
  deleteFeatures,
  onClose
}) => {
  const [localFeatures, setLocalFeatures] = useState<TextFeature[]>([]);

  useEffect(() => {
    setLocalFeatures(features);
  }, [features]);

  const handleChange = (property: keyof TextFeature['properties'], value: any) => {
    const updatedFeatures = localFeatures.map(feature => ({
      ...feature,
      properties: { ...feature.properties, [property]: value }
    }));
    setLocalFeatures(updatedFeatures);
  };

  const handleSave = () => {
    updateFeatures(localFeatures);
    onClose();
  };

  const handleDelete = () => {
    deleteFeatures(localFeatures);
  };

  // Use the first feature for single-selection properties, or default values if no features
  const currentProperties = localFeatures[0]?.properties || {
    text: '',
    size: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    rotation: 0,
    justify: 'center' as const
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        width: 300,
        bgcolor: 'background.paper',
        border: '1px solid grey',
        borderRadius: 1,
        p: 2,
        zIndex: 1002,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Text Properties
      </Typography>
      
      {localFeatures.length === 1 && (
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Text"
          value={currentProperties.text}
          onChange={(e) => handleChange('text', e.target.value)}
          margin="normal"
        />
      )}

      <Typography gutterBottom>Size</Typography>
      <Slider
        value={currentProperties.size}
        onChange={(_, value) => handleChange('size', value as number)}
        min={1}
        max={100}
        step={1}
      />

      <TextField
        fullWidth
        type="color"
        label="Color"
        value={currentProperties.color}
        onChange={(e) => handleChange('color', e.target.value)}
        margin="normal"
      />

      <TextField
        fullWidth
        type="color"
        label="Background Color"
        value={currentProperties.backgroundColor}
        onChange={(e) => handleChange('backgroundColor', e.target.value)}
        margin="normal"
      />

      <Typography gutterBottom>Rotation</Typography>
      <Slider
        value={currentProperties.rotation}
        onChange={(_, value) => handleChange('rotation', value as number)}
        min={-180}
        max={180}
        step={1}
      />

      <Select
        fullWidth
        value={currentProperties.justify}
        onChange={(e) => handleChange('justify', e.target.value as 'left' | 'center' | 'right')}
      >
        <MenuItem value="left">Left</MenuItem>
        <MenuItem value="center">Center</MenuItem>
        <MenuItem value="right">Right</MenuItem>
      </Select>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="outlined" color="error" onClick={handleDelete}>
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default TextAttributesPanel;