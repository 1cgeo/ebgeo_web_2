import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import {
  StoreState,
  Feature,
  MapData,
  MapFeatures,
} from "../../ts/interfaces/mapSig.interfaces";
import {
  FeatureType,
  BaseLayer,
  UndoRedoAction,
} from "../../ts/types/mapSig.types";

const initialState: StoreState = {
  maps: {
    Principal: {
      baseLayer: "Carta",
      features: {
        polygons: [],
        linestrings: [],
        points: [],
        texts: [],
        images: [],
        los: [],
        visibility: [],
        processed_los: [],
        processed_visibility: [],
      },
      undoStack: [],
      redoStack: [],
      zoom: null,
      center_lat: null,
      center_long: null,
    },
  },
  currentMap: "Principal",
};

const MapContext = createContext<
  | {
      state: StoreState;
      addFeature: (featureType: FeatureType, feature: Feature) => void;
      updateFeature: (
        featureType: FeatureType,
        oldFeature: Feature,
        newFeature: Feature
      ) => void;
      removeFeature: (featureType: FeatureType, feature: Feature) => void;
      addMap: (mapName: string, mapData?: MapData) => void;
      removeMap: (mapName: string) => void;
      renameMap: (oldName: string, newName: string) => void;
      setCurrentMap: (mapName: string) => void;
      setBaseLayer: (layer: BaseLayer) => void;
      updateMapPosition: (
        center_lat: number,
        center_long: number,
        zoom: number
      ) => void;
      undo: () => void;
      redo: () => void;
      setMap: (map: any) => void;
    }
  | undefined
>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<StoreState>(initialState);
  const mapRef = useRef<any | null>(null);

  // Load state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem("mapState");
    if (savedState) {
      setState(JSON.parse(savedState));
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mapState", JSON.stringify(state));
  }, [state]);

  // Synchronize map features with maplibregl
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const features = getCurrentMapFeatures(state);

    // Update or add sources and layers for each feature type
    Object.entries(features).forEach(([featureType, featureList]) => {
      const sourceId = `${featureType}-source`;
      const layerId = `${featureType}-layer`;

      // Update or add source
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as any).setData({
          type: "FeatureCollection",
          features: featureList,
        });
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: featureList,
          },
        });
      }

      // Add layer if it doesn't exist
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: getLayerType(featureType as FeatureType),
          source: sourceId,
          paint: getLayerPaint(featureType as FeatureType),
          layout: getLayerLayout(featureType as FeatureType),
        });
      }
    });
  }, [state.maps[state.currentMap].features]);

  const addFeature = (featureType: FeatureType, feature: Feature) => {
    setState((prevState) => {
      const currentMap = prevState.maps[prevState.currentMap];
      return {
        ...prevState,
        maps: {
          ...prevState.maps,
          [prevState.currentMap]: {
            ...currentMap,
            features: {
              ...currentMap.features,
              [featureType]: [...currentMap.features[featureType], feature],
            },
            undoStack: [
              ...currentMap.undoStack,
              { type: "ADD_FEATURE", featureType, feature },
            ],
            redoStack: [],
          },
        },
      };
    });
  };

  const updateFeature = (
    featureType: FeatureType,
    oldFeature: Feature,
    newFeature: Feature
  ) => {
    setState((prevState) => {
      const currentMap = prevState.maps[prevState.currentMap];

      return {
        ...prevState,
        maps: {
          ...prevState.maps,
          [prevState.currentMap]: {
            ...currentMap,
            features: {
              ...currentMap.features,
              [featureType]: currentMap.features[featureType].map((feature) =>
                feature.id === newFeature.id ? newFeature : feature
              ),
            },
            undoStack: [
              ...currentMap.undoStack,
              { type: "UPDATE_FEATURE", featureType, oldFeature, newFeature },
            ],
            redoStack: [],
          },
        },
      };
    });
  };

  const removeFeature = (featureType: FeatureType, feature: Feature) => {
    setState((prevState) => {
      const currentMap = prevState.maps[prevState.currentMap];
      return {
        ...prevState,
        maps: {
          ...prevState.maps,
          [prevState.currentMap]: {
            ...currentMap,
            features: {
              ...currentMap.features,
              [featureType]: currentMap.features[featureType].filter(
                (f) => f.id !== feature.id
              ),
            },
            undoStack: [
              ...currentMap.undoStack,
              { type: "REMOVE_FEATURE", featureType, feature },
            ],
            redoStack: [],
          },
        },
      };
    });
  };

  const addMap = (mapName: string, mapData?: MapData) => {
    setState((prevState) => ({
      ...prevState,
      maps: {
        ...prevState.maps,
        [mapName]: mapData || {
          baseLayer: "Carta",
          features: {
            polygons: [],
            linestrings: [],
            points: [],
            texts: [],
            images: [],
            los: [],
            visibility: [],
            processed_los: [],
            processed_visibility: [],
          },
          undoStack: [],
          redoStack: [],
          zoom: null,
          center_lat: null,
          center_long: null,
        },
      },
    }));
  };

  const removeMap = (mapName: string) => {
    setState((prevState) => {
      const { [mapName]: removedMap, ...remainingMaps } = prevState.maps;
      return {
        ...prevState,
        maps: remainingMaps,
        currentMap:
          mapName === prevState.currentMap
            ? Object.keys(remainingMaps)[0] || ""
            : prevState.currentMap,
      };
    });
  };

  const renameMap = (oldName: string, newName: string) => {
    setState((prevState) => {
      const { [oldName]: oldMap, ...otherMaps } = prevState.maps;
      return {
        ...prevState,
        maps: {
          ...otherMaps,
          [newName]: oldMap,
        },
        currentMap:
          prevState.currentMap === oldName ? newName : prevState.currentMap,
      };
    });
  };

  const setCurrentMap = (mapName: string) => {
    setState((prevState) => ({
      ...prevState,
      currentMap: mapName,
    }));
  };

  const setBaseLayer = (layer: BaseLayer) => {
    setState((prevState) => ({
      ...prevState,
      maps: {
        ...prevState.maps,
        [prevState.currentMap]: {
          ...prevState.maps[prevState.currentMap],
          baseLayer: layer,
        },
      },
    }));
  };

  const updateMapPosition = (
    center_lat: number,
    center_long: number,
    zoom: number
  ) => {
    setState((prevState) => ({
      ...prevState,
      maps: {
        ...prevState.maps,
        [prevState.currentMap]: {
          ...prevState.maps[prevState.currentMap],
          zoom,
          center_lat,
          center_long,
        },
      },
    }));
  };

  const undo = () => {
    setState((prevState) => {
      const currentMap = prevState.maps[prevState.currentMap];
      if (currentMap.undoStack.length === 0) return prevState;

      const lastAction = currentMap.undoStack[
        currentMap.undoStack.length - 1
      ] as UndoRedoAction;
      let newFeatures = { ...currentMap.features };

      switch (lastAction.type) {
        case "ADD_FEATURE":
          newFeatures[lastAction.featureType] = newFeatures[
            lastAction.featureType
          ].filter((f) => f.id !== lastAction.feature.id);
          break;
        case "REMOVE_FEATURE":
          newFeatures[lastAction.featureType] = [
            ...newFeatures[lastAction.featureType],
            lastAction.feature,
          ];
          break;
        case "UPDATE_FEATURE":
          newFeatures[lastAction.featureType] = newFeatures[
            lastAction.featureType
          ].map((f) =>
            f.id === lastAction.oldFeature.id ? lastAction.oldFeature : f
          );
          break;
      }

      return {
        ...prevState,
        maps: {
          ...prevState.maps,
          [prevState.currentMap]: {
            ...currentMap,
            features: newFeatures,
            undoStack: currentMap.undoStack.slice(0, -1),
            redoStack: [...currentMap.redoStack, lastAction],
          },
        },
      };
    });
  };

  const redo = () => {
    setState((prevState) => {
      const currentMap = prevState.maps[prevState.currentMap];
      if (currentMap.redoStack.length === 0) return prevState;

      const nextAction = currentMap.redoStack[
        currentMap.redoStack.length - 1
      ] as UndoRedoAction;
      let newFeatures = { ...currentMap.features };

      switch (nextAction.type) {
        case "ADD_FEATURE":
          newFeatures[nextAction.featureType] = [
            ...newFeatures[nextAction.featureType],
            nextAction.feature,
          ];
          break;
        case "REMOVE_FEATURE":
          newFeatures[nextAction.featureType] = newFeatures[
            nextAction.featureType
          ].filter((f) => f.id !== nextAction.feature.id);
          break;
        case "UPDATE_FEATURE":
          newFeatures[nextAction.featureType] = newFeatures[
            nextAction.featureType
          ].map((f) =>
            f.id === nextAction.newFeature.id ? nextAction.newFeature : f
          );
          break;
      }

      return {
        ...prevState,
        maps: {
          ...prevState.maps,
          [prevState.currentMap]: {
            ...currentMap,
            features: newFeatures,
            undoStack: [...currentMap.undoStack, nextAction],
            redoStack: currentMap.redoStack.slice(0, -1),
          },
        },
      };
    });
  };

  const setMap = (map: any) => {
    mapRef.current = map;
  };

  return (
    <MapContext.Provider
      value={{
        state,
        addFeature,
        updateFeature,
        removeFeature,
        addMap,
        removeMap,
        renameMap,
        setCurrentMap,
        setBaseLayer,
        updateMapPosition,
        undo,
        redo,
        setMap,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapStore = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMapStore must be used within a MapProvider");
  }
  return context;
};

export const getLayerType = (featureType: FeatureType): string => {
  switch (featureType) {
    case "polygons":
    case "visibility":
    case "processed_visibility":
      return "fill";
    case "linestrings":
    case "los":
    case "processed_los":
      return "line";
    case "points":
      return "circle";
    case "texts":
    case "images":
      return "symbol";
    default:
      return "circle";
  }
};

export const getLayerPaint = (featureType: FeatureType): any => {
  switch (featureType) {
    case "polygons":
      return {
        "fill-color": ["get", "color"],
        "fill-opacity": ["get", "opacity"],
      };
    case "linestrings":
    case "los":
    case "processed_los":
      return {
        "line-color": ["get", "color"],
        "line-width": ["get", "width"],
        "line-opacity": ["get", "opacity"],
      };
    case "points":
      return {
        "circle-radius": ["get", "radius"],
        "circle-color": ["get", "color"],
        "circle-opacity": ["get", "opacity"],
      };
    case "texts":
      return {
        "text-color": ["get", "color"],
        "text-halo-color": ["get", "backgroundColor"],
        "text-halo-width": 2,
      };
    case "images":
      return {
        "icon-opacity": ["get", "opacity"],
      };
    case "visibility":
    case "processed_visibility":
      return {
        "fill-color": ["get", "color"],
        "fill-opacity": ["get", "opacity"],
      };
    default:
      return {};
  }
};

export const getLayerLayout = (featureType: FeatureType): any => {
  switch (featureType) {
    case "texts":
      return {
        "text-field": ["get", "text"],
        "text-size": ["get", "size"],
        "text-justify": ["get", "justify"],
        "text-anchor": "center",
        "text-rotate": ["get", "rotation"],
        "text-ignore-placement": true,
        "text-font": ["Noto Sans Regular"],
      };
    case "images":
      return {
        "icon-image": ["get", "imageId"],
        "icon-size": ["get", "size"],
        "icon-rotate": ["get", "rotation"],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      };
    default:
      return {};
  }
};

export const getCurrentMapFeatures = (state: StoreState): MapFeatures => {
  return state.maps[state.currentMap].features;
};

export const getCurrentBaseLayer = (state: StoreState): BaseLayer => {
  return state.maps[state.currentMap].baseLayer;
};
