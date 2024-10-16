import {
  FeatureType,
  BaseLayer,
  PanelType,
  ToolType,
  GenericMapGeoJSONFeature,
} from "../../ts/types/mapSig.types";

export interface Feature {
  id: string;
  type: "Feature";
  properties: {
    [key: string]: any;
    source: FeatureType;
  };
  geometry: {
    type: string;
    coordinates: number[];
  };
}

export interface MapFeatures {
  polygons: Feature[];
  linestrings: Feature[];
  points: Feature[];
  texts: Feature[];
  images: Feature[];
  los: Feature[];
  visibility: Feature[];
  processed_los: Feature[];
  processed_visibility: Feature[];
}

export interface MapData {
  baseLayer: BaseLayer;
  features: MapFeatures;
  undoStack: any[];
  redoStack: any[];
  zoom: number | null;
  center_lat: number | null;
  center_long: number | null;
}

export interface StoreState {
  maps: { [key: string]: MapData };
  currentMap: string;
}

export interface PanelContextProps {
  openPanel: PanelType;
  setOpenPanel: (panel: PanelType) => void;
}

export interface PanelProviderProps {
  children: React.ReactNode;
}

export interface SelectionContextProps {
  selectedFeatures: Feature[];
  selectFeature: (feature: Feature, isMultiSelect: boolean) => void;
  deselectFeature: (featureId: string) => void;
  clearSelection: () => void;
  moveSelectedFeatures: (dx: number, dy: number) => void;
}

export interface SelectionProviderProps {
  children: React.ReactNode;
}

export interface ToolContextProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export interface ToolProviderProps {
  children: React.ReactNode;
}

export interface DrawerContentProps {
  onSelect: () => void;
}

export interface DrawerItemProps {
  name: string;
  component: any;
}

export interface FeatureSearchPanelProps {
  feature: {
    nome: string;
    latitude: number;
    longitude: number;
    tipo: string;
    municipio: string;
    estado: string;
  };
  onClose: () => void;
}

export interface SaveData {
  maps: { [key: string]: Omit<MapData, "undoStack" | "redoStack"> };
  currentMap: string;
}

export interface TextFeature extends Omit<Feature, "properties"> {
  properties: {
    text: string;
    size: number;
    color: string;
    backgroundColor: string;
    rotation: number;
    justify: "left" | "center" | "right";
    source: FeatureType;
  };
}

export interface TextAttributesPanelProps {
  updateFeatures: (features: TextFeature[]) => void;
  deleteFeatures: (features: TextFeature[]) => void;
  onClose: () => void;
}

export interface TextAttributesPanelProps {
  updateFeatures: (features: TextFeature[]) => void;
  deleteFeatures: (features: TextFeature[]) => void;
  onClose: () => void;
}

export interface VectorTileInfoPanelProps {
  feature: GenericMapGeoJSONFeature | null;
  onClose: () => void;
}

export interface FeaturePanelProps<T> {
  title: string;
  features: T[];
  onUpdate: (features: T[]) => void;
  onDelete: (features: T[]) => void;
  onClose: () => void;
  children: React.ReactNode;
}

export interface StyledIconButtonProps {
  $inUse?: boolean;
}

export interface ToolProps {
  image: string;
  active: boolean;
  inUse?: boolean;
  onClick: () => void;
  tooltip: string;
  id: string;
}


export interface ToolControlProps {
    name: ToolType;
    icon: string;
    tooltip: string;
    children?: React.ReactNode;
    onActivate?: () => void;
    onDeactivate?: () => void;
  }
  