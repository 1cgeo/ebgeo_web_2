export interface Tiles3D {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    url: string;
    lon: number;
    lat: number;
    height: number;
    heightOffset: number;
    maximumScreenSpaceError: number;
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
  
  export type CatalogItem = Tiles3D | Modelos3D;