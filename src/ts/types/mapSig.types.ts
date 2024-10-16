import { Feature } from "../../ts/interfaces/mapSig.interfaces";

export type FeatureType =
  | "polygons"
  | "linestrings"
  | "points"
  | "texts"
  | "images"
  | "los"
  | "visibility"
  | "processed_los"
  | "processed_visibility";
export type BaseLayer = "Carta" | "Satellite" | "Terrain";

export type UndoRedoAction =
  | { type: "ADD_FEATURE"; featureType: FeatureType; feature: Feature }
  | { type: "REMOVE_FEATURE"; featureType: FeatureType; feature: Feature }
  | {
      type: "UPDATE_FEATURE";
      featureType: FeatureType;
      oldFeature: Feature;
      newFeature: Feature;
    };

export type PanelType =
  | "featureSearch"
  | "vectorTileInfo"
  | "textAttributes"
  | null;

export type ToolType =
  | "text"
  | "resetNorth"
  | "featureSearch"
  | "vectorTileInfo"
  | null;

export type Suggestion = {
  tipo: string;
  nome: string;
  municipio: string;
  estado: string;
  latitude: number;
  longitude: number;
};

export type GenericMap = {
  getCenter: () => { lat: number; lng: number };
  flyTo: (options: {
    center: [number, number];
    zoom: number;
    essential: boolean;
  }) => void;
};

export type GenericMarker = {
  setLngLat: (coords: [number, number]) => GenericMarker;
  addTo: (map: GenericMap) => GenericMarker;
  remove: () => void;
};

export type GenericMapMouseEvent = {
  point: { x: number; y: number };
};

export type GenericMapGeoJSONFeature = {
  source?: string;
  geometry: {
    type: string;
  };
  properties: Record<string, any>;
};