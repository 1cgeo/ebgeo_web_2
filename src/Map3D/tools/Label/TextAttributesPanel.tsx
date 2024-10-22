import React, { useState } from "react";
import { TextField, Slider, Select, MenuItem, Typography } from "@mui/material";
import FeaturePanel from "../../../components/FeaturePanel";
import { TextAttributesPanelProps } from "../../../ts/interfaces/map3D.interfaces";

const TextAttributesPanel: React.FC<TextAttributesPanelProps> = ({
  properties,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [localProperties, setLocalProperties] = useState<any | null>(null);

  const handleChange = (
    property: keyof TextAttributesPanelProps["properties"],
    value: any
  ) => {
    setLocalProperties({
      ...properties,
      ...localProperties,
      [property]: value,
    });
  };

  return (
    <FeaturePanel
      title="Propriedades do Texto"
      onUpdate={() => onUpdate(localProperties ? localProperties : properties)}
      onDelete={() => onDelete(properties.id)}
      onClose={onClose}
      sx={{
        position: "fixed",
        bottom: 10,
        right: 60,
        width: 300,
        bgcolor: "background.paper",
        border: "1px solid grey",
        borderRadius: 1,
        p: 2,
        zIndex: 1002,
      }}
    >
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Texto"
        defaultValue={properties.text}
        onChange={(e) => handleChange("text", e.target.value)}
        margin="normal"
      />
      <Typography gutterBottom>Tamanho</Typography>
      <Slider
        defaultValue={properties.size}
        onChange={(_, value) => handleChange("size", value as number)}
        min={1}
        max={100}
        step={1}
      />
      <TextField
        fullWidth
        type="color"
        label="Cor"
        defaultValue={properties.fillColor}
        onChange={(e) => handleChange("fillColor", e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        type="color"
        label="Cor de Fundo"
        defaultValue={properties.backgroundColor}
        onChange={(e) => handleChange("backgroundColor", e.target.value)}
        margin="normal"
      />
      <Select
        fullWidth
        defaultValue={properties.align}
        onChange={(e) =>
          handleChange("align", e.target.value as "left" | "center" | "right")
        }
      >
        <MenuItem value="left">Esquerda</MenuItem>
        <MenuItem value="center">Centro</MenuItem>
        <MenuItem value="right">Direita</MenuItem>
      </Select>
    </FeaturePanel>
  );
};

export default TextAttributesPanel;
