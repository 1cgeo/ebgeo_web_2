export interface TextAttributesPanelProps {
  properties: {
    id: string;
    text: string;
    size: number;
    fillColor: string;
    backgroundColor: string;
    rotation: number;
    align: "left" | "center" | "right";
  };
  onUpdate: (properties: TextAttributesPanelProps["properties"]) => void;
  onDelete: (labelId: string) => void;
  onClose: () => void;
}
