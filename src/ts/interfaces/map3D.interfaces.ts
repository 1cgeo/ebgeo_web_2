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


export interface Tiles3D {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  url: string;
  lon: number;
  lat: number;
  height: number;
  heightoffset: number;
  maximumscreenspaceerror: number;
  type: 'Tiles 3D';
  data_criacao: string;
  municipio: string;
  estado: string;
  palavras_chave: string[];
}

export interface Modelos3D {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  url: string;
  lon: number;
  lat: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
  type: 'Modelos 3D';
  data_criacao: string;
  municipio: string;
  estado: string;
  palavras_chave: string[];
}

export interface PointCloud {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  url: string;
  lon: number;
  lat: number;
  height: number;
  heightoffset: number;
  maximumscreenspaceerror: number;
  type: 'Nuvem de Pontos';
  data_criacao: string;
  municipio: string;
  estado: string;
  palavras_chave: string[];
  style: object
}