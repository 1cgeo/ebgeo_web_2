import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';

// Types
type FeatureType = 'polygons' | 'linestrings' | 'points' | 'texts' | 'images' | 'los' | 'visibility' | 'processed_los' | 'processed_visibility';
type BaseLayer = 'Carta' | 'Satellite' | 'Terrain';

interface Feature {
    id: string;
    [key: string]: any;
}

interface MapFeatures {
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
    undoStack: Action[];
    redoStack: Action[];
    zoom: number | null;
    center_lat: number | null;
    center_long: number | null;
}

interface StoreState {
    maps: { [key: string]: MapData };
    currentMap: string;
    isUndoing: boolean;
    isRedoing: boolean;
}

type Action =
    | { type: 'ADD_FEATURE'; featureType: FeatureType; feature: Feature }
    | { type: 'UPDATE_FEATURE'; featureType: FeatureType; oldFeature: Feature; newFeature: Feature }
    | { type: 'REMOVE_FEATURE'; featureType: FeatureType; feature: Feature }
    | { type: 'ADD_MAP'; mapName: string; mapData?: MapData }
    | { type: 'REMOVE_MAP'; mapName: string }
    | { type: 'RENAME_MAP'; oldName: string; newName: string }
    | { type: 'SET_CURRENT_MAP'; mapName: string }
    | { type: 'SET_BASE_LAYER'; layer: BaseLayer }
    | { type: 'UPDATE_MAP_POSITION'; center_lat: number; center_long: number; zoom: number }
    | { type: 'UNDO' }
    | { type: 'REDO' };

// Initial state
const initialState: StoreState = {
    maps: {
        'Principal': {
            baseLayer: 'Carta',
            features: {
                polygons: [],
                linestrings: [],
                points: [],
                texts: [],
                images: [],
                los: [],
                visibility: [],
                processed_los: [],
                processed_visibility: []
            },
            undoStack: [],
            redoStack: [],
            zoom: null,
            center_lat: null,
            center_long: null
        }
    },
    currentMap: 'Principal',
    isUndoing: false,
    isRedoing: false,
};

// Reducer
const reducer = (state: StoreState, action: Action): StoreState => {
    const currentMap = state.maps[state.currentMap];

    switch (action.type) {
        case 'ADD_FEATURE':
            return {
                ...state,
                maps: {
                    ...state.maps,
                    [state.currentMap]: {
                        ...currentMap,
                        features: {
                            ...currentMap.features,
                            [action.featureType]: [...currentMap.features[action.featureType], action.feature]
                        },
                        undoStack: [...currentMap.undoStack, action],
                        redoStack: []
                    }
                }
            };

        case 'UPDATE_FEATURE':
            return {
                ...state,
                maps: {
                    ...state.maps,
                    [state.currentMap]: {
                        ...currentMap,
                        features: {
                            ...currentMap.features,
                            [action.featureType]: currentMap.features[action.featureType].map(
                                feature => feature.id === action.newFeature.id ? action.newFeature : feature
                            )
                        },
                        undoStack: [...currentMap.undoStack, action],
                        redoStack: []
                    }
                }
            };

        case 'REMOVE_FEATURE':
            return {
                ...state,
                maps: {
                    ...state.maps,
                    [state.currentMap]: {
                        ...currentMap,
                        features: {
                            ...currentMap.features,
                            [action.featureType]: currentMap.features[action.featureType].filter(
                                feature => feature.id !== action.feature.id
                            )
                        },
                        undoStack: [...currentMap.undoStack, action],
                        redoStack: []
                    }
                }
            };

        case 'ADD_MAP':
            return {
                ...state,
                maps: {
                    ...state.maps,
                    [action.mapName]: action.mapData || {
                        baseLayer: 'Carta',
                        features: {
                            polygons: [],
                            linestrings: [],
                            points: [],
                            texts: [],
                            images: [],
                            los: [],
                            visibility: [],
                            processed_los: [],
                            processed_visibility: []
                        },
                        undoStack: [],
                        redoStack: [],
                        zoom: null,
                        center_lat: null,
                        center_long: null
                    }
                }
            };

        case 'REMOVE_MAP':
            const { [action.mapName]: removedMap, ...remainingMaps } = state.maps;
            return {
                ...state,
                maps: remainingMaps,
                currentMap: action.mapName === state.currentMap ? Object.keys(remainingMaps)[0] || '' : state.currentMap
            };

        case 'RENAME_MAP':
            const { [action.oldName]: oldMap, ...otherMaps } = state.maps;
            return {
                ...state,
                maps: {
                    ...otherMaps,
                    [action.newName]: oldMap
                },
                currentMap: state.currentMap === action.oldName ? action.newName : state.currentMap
            };

        case 'SET_CURRENT_MAP':
            return {
                ...state,
                currentMap: action.mapName
            };

        case 'SET_BASE_LAYER':
            return {
                ...state,
                maps: {
                    ...state.maps,
                    [state.currentMap]: {
                        ...currentMap,
                        baseLayer: action.layer
                    }
                }
            };

        case 'UPDATE_MAP_POSITION':
            return {
                ...state,
                maps: {
                    ...state.maps,
                    [state.currentMap]: {
                        ...currentMap,
                        zoom: action.zoom,
                        center_lat: action.center_lat,
                        center_long: action.center_long
                    }
                }
            };

        case 'UNDO':
            if (currentMap.undoStack.length === 0) return state;
            const lastAction = currentMap.undoStack[currentMap.undoStack.length - 1];
            let newState = { ...state };

            switch (lastAction.type) {
                case 'ADD_FEATURE':
                    newState = reducer(state, { type: 'REMOVE_FEATURE', featureType: lastAction.featureType, feature: lastAction.feature });
                    break;
                case 'REMOVE_FEATURE':
                    newState = reducer(state, { type: 'ADD_FEATURE', featureType: lastAction.featureType, feature: lastAction.feature });
                    break;
                case 'UPDATE_FEATURE':
                    newState = reducer(state, { type: 'UPDATE_FEATURE', featureType: lastAction.featureType, oldFeature: lastAction.newFeature, newFeature: lastAction.oldFeature });
                    break;
            }

            return {
                ...newState,
                maps: {
                    ...newState.maps,
                    [state.currentMap]: {
                        ...newState.maps[state.currentMap],
                        undoStack: newState.maps[state.currentMap].undoStack.slice(0, -1),
                        redoStack: [...newState.maps[state.currentMap].redoStack, lastAction]
                    }
                },
                isUndoing: true
            };

        case 'REDO':
            if (currentMap.redoStack.length === 0) return state;
            const nextAction = currentMap.redoStack[currentMap.redoStack.length - 1];
            let redoState = { ...state };

            switch (nextAction.type) {
                case 'ADD_FEATURE':
                    redoState = reducer(state, nextAction);
                    break;
                case 'REMOVE_FEATURE':
                    redoState = reducer(state, nextAction);
                    break;
                case 'UPDATE_FEATURE':
                    redoState = reducer(state, nextAction);
                    break;
            }

            return {
                ...redoState,
                maps: {
                    ...redoState.maps,
                    [state.currentMap]: {
                        ...redoState.maps[state.currentMap],
                        undoStack: [...redoState.maps[state.currentMap].undoStack, nextAction],
                        redoStack: redoState.maps[state.currentMap].redoStack.slice(0, -1)
                    }
                },
                isRedoing: true
            };

        default:
            return state;
    }
};

const MapContext = createContext<{
    state: StoreState;
    dispatch: React.Dispatch<Action>;
    map: any | null;
} | undefined>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const mapRef = useRef<any | null>(null);

    // Load state from localStorage on initial render
    useEffect(() => {
        const savedState = localStorage.getItem('mapState');
        if (savedState) {
            dispatch({ type: 'SET_CURRENT_MAP', mapName: JSON.parse(savedState).currentMap });
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('mapState', JSON.stringify(state));
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
                    type: 'FeatureCollection',
                    features: featureList
                });
            } else {
                map.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: featureList
                    }
                });
            }

            // Add layer if it doesn't exist
            if (!map.getLayer(layerId)) {
                map.addLayer({
                    id: layerId,
                    type: getLayerType(featureType as FeatureType),
                    source: sourceId,
                    paint: getLayerPaint(featureType as FeatureType),
                    layout: getLayerLayout(featureType as FeatureType)
                });
            }
        });

        // Remove any layers and sources that are no longer needed
        map.getStyle().layers.forEach((layer: any) => {
            if (layer.id.endsWith('-layer') && !features.hasOwnProperty(layer.id.replace('-layer', ''))) {
                map.removeLayer(layer.id);
                map.removeSource(layer.source as string);
            }
        });

    }, [state.maps[state.currentMap].features]);

    return (
        <MapContext.Provider value={{ state, dispatch, map: mapRef.current }}>
            {children}
        </MapContext.Provider>
    );
};

export const useMapStore = () => {
    const context = useContext(MapContext);
    if (context === undefined) {
        throw new Error('useMapStore must be used within a MapProvider');
    }
    return context;
};

// Helper functions for layer setup
function getLayerType(featureType: FeatureType): string {
    switch (featureType) {
        case 'polygons':
        case 'visibility':
        case 'processed_visibility':
            return 'fill';
        case 'linestrings':
        case 'los':
        case 'processed_los':
            return 'line';
        case 'points':
            return 'circle';
        case 'texts':
        case 'images':
            return 'symbol';
        default:
            return 'circle';
    }
}

function getLayerPaint(featureType: FeatureType): any {
    switch (featureType) {
        case 'polygons':
            return {
                'fill-color': ['get', 'color'],
                'fill-opacity': ['get', 'opacity']
            };
        case 'linestrings':
        case 'los':
        case 'processed_los':
            return {
                'line-color': ['get', 'color'],
                'line-width': ['get', 'width'],
                'line-opacity': ['get', 'opacity']
            };
        case 'points':
            return {
                'circle-radius': ['get', 'radius'],
                'circle-color': ['get', 'color'],
                'circle-opacity': ['get', 'opacity']
            };
        case 'texts':
            return {
                'text-color': ['get', 'color'],
                'text-halo-color': ['get', 'backgroundColor'],
                'text-halo-width': 2
            };
        case 'images':
            return {
                'icon-opacity': ['get', 'opacity']
            };
        case 'visibility':
        case 'processed_visibility':
            return {
                'fill-color': ['get', 'color'],
                'fill-opacity': ['get', 'opacity']
            };
        default:
            return {};
    }
}

function getLayerLayout(featureType: FeatureType): any {
    switch (featureType) {
        case 'texts':
            return {
                'text-field': ['get', 'text'],
                'text-size': ['get', 'size'],
                'text-justify': ['get', 'justify'],
                'text-anchor': 'center',
                'text-rotate': ['get', 'rotation'],
                'text-ignore-placement': true,
                'text-font': ['Noto Sans Regular']
            };
        case 'images':
            return {
                'icon-image': ['get', 'imageId'],
                'icon-size': ['get', 'size'],
                'icon-rotate': ['get', 'rotation'],
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
            };
        default:
            return {};
    }
}

export const addFeature = (dispatch: React.Dispatch<Action>, featureType: FeatureType, feature: Feature) => {
    dispatch({ type: 'ADD_FEATURE', featureType, feature });
};

export const updateFeature = (dispatch: React.Dispatch<Action>, featureType: FeatureType, oldFeature: Feature, newFeature: Feature) => {
    dispatch({ type: 'UPDATE_FEATURE', featureType, oldFeature, newFeature });
};

export const removeFeature = (dispatch: React.Dispatch<Action>, featureType: FeatureType, feature: Feature) => {
    dispatch({ type: 'REMOVE_FEATURE', featureType, feature });
};

export const addMap = (dispatch: React.Dispatch<Action>, mapName: string, mapData?: MapData) => {
    dispatch({ type: 'ADD_MAP', mapName, mapData });
};

export const removeMap = (dispatch: React.Dispatch<Action>, mapName: string) => {
    dispatch({ type: 'REMOVE_MAP', mapName });
};

export const renameMap = (dispatch: React.Dispatch<Action>, oldName: string, newName: string) => {
    dispatch({ type: 'RENAME_MAP', oldName, newName });
};

export const setCurrentMap = (dispatch: React.Dispatch<Action>, mapName: string) => {
    dispatch({ type: 'SET_CURRENT_MAP', mapName });
};

export const setBaseLayer = (dispatch: React.Dispatch<Action>, layer: BaseLayer) => {
    dispatch({ type: 'SET_BASE_LAYER', layer });
};

export const updateMapPosition = (dispatch: React.Dispatch<Action>, center_lat: number, center_long: number, zoom: number) => {
    dispatch({ type: 'UPDATE_MAP_POSITION', center_lat, center_long, zoom });
};

export const undo = (dispatch: React.Dispatch<Action>) => {
    dispatch({ type: 'UNDO' });
};

export const redo = (dispatch: React.Dispatch<Action>) => {
    dispatch({ type: 'REDO' });
};

export const getCurrentMapFeatures = (state: StoreState): MapFeatures => {
    return state.maps[state.currentMap].features;
};

export const getCurrentBaseLayer = (state: StoreState): BaseLayer => {
    return state.maps[state.currentMap].baseLayer;
};