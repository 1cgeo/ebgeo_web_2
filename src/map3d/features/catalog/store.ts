// Path: map3d\features\catalog\store.ts
import { create } from 'zustand';

import { getCesium } from '../../store';
import { getModelUrl } from './api';
import {
  type CatalogItem,
  CatalogToolState,
  ModelLoadingState,
  type Modelos3D,
  type PointCloud,
  type Tiles3D,
} from './types';

interface CatalogState {
  // UI State
  toolState: CatalogToolState;

  // Data state
  catalogItems: CatalogItem[];
  loadedModels: Map<string, CatalogItem>;
  loadingStates: Map<string, ModelLoadingState>;

  // Search state
  searchTerm: string;
  currentPage: number;
  totalItems: number;
  hasMore: boolean;
  itemsPerPage: number;

  // Indicator state
  isBlinking: boolean;

  // UI Actions
  openCatalog: () => void;
  closeCatalog: () => void;
  setToolState: (state: CatalogToolState) => void;

  // Data actions
  updateCatalogItems: (items: CatalogItem[]) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  updateSearchMetadata: (metadata: {
    totalItems: number;
    currentPage: number;
    hasMore: boolean;
  }) => void;

  // Model actions
  addModel: (model: CatalogItem) => Promise<void>;
  removeModel: (modelId: string) => void;
  zoomToModel: (modelId: string) => void;
  toggleModelVisibility: (modelId: string) => void;
  isModelVisible: (modelId: string) => boolean;
  isModelLoaded: (modelId: string) => boolean;
  setModelLoadingState: (modelId: string, state: ModelLoadingState) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  // Initial state
  toolState: CatalogToolState.CLOSED,
  catalogItems: [],
  loadedModels: new Map(),
  loadingStates: new Map(),
  searchTerm: '',
  currentPage: 1,
  totalItems: 0,
  hasMore: true,
  itemsPerPage: 12,
  isBlinking: false,

  // UI actions
  openCatalog: () => set({ toolState: CatalogToolState.OPEN }),

  closeCatalog: () => set({ toolState: CatalogToolState.CLOSED }),

  setToolState: state => set({ toolState: state }),

  // Data actions
  updateCatalogItems: items => set({ catalogItems: items }),

  setSearchTerm: term => set({ searchTerm: term }),

  setCurrentPage: page => set({ currentPage: page }),

  updateSearchMetadata: metadata =>
    set({
      totalItems: metadata.totalItems,
      currentPage: metadata.currentPage,
      hasMore: metadata.hasMore,
    }),

  // Model actions
  addModel: async model => {
    const { loadedModels, setModelLoadingState } = get();

    // Check if model is already loaded
    if (loadedModels.has(model.id)) {
      return;
    }

    setModelLoadingState(model.id, ModelLoadingState.LOADING);

    try {
      const cesium = getCesium();
      if (!cesium) {
        throw new Error('Cesium not initialized');
      }

      const { Cesium, viewer } = cesium;

      // Load model based on type
      switch (model.type) {
        case 'Tiles 3D':
          await loadTiles3D(Cesium, viewer, model as Tiles3D);
          break;
        case 'Modelos 3D':
          await loadModelos3D(Cesium, viewer, model as Modelos3D);
          break;
        case 'Nuvem de Pontos':
          await loadPointCloud(Cesium, viewer, model as PointCloud);
          break;
      }

      // Update state
      set(state => {
        const newLoadedModels = new Map(state.loadedModels);
        newLoadedModels.set(model.id, model);

        return {
          loadedModels: newLoadedModels,
          isBlinking: false,
        };
      });

      setModelLoadingState(model.id, ModelLoadingState.LOADED);
    } catch (error) {
      console.error(`Error loading model ${model.id}:`, error);
      setModelLoadingState(model.id, ModelLoadingState.ERROR);
    }
  },

  removeModel: modelId => {
    const { loadedModels } = get();
    const model = loadedModels.get(modelId);
    if (!model) return;

    const cesium = getCesium();
    if (!cesium) return;

    const { viewer } = cesium;

    try {
      // Remove model based on type
      const entityId = `model-${modelId}`;
      const entity = viewer.entities.getById(entityId);

      if (entity) {
        viewer.entities.remove(entity);
      } else {
        // For tilesets that aren't entities
        const primitiveCollection = viewer.scene.primitives;
        for (let i = 0; i < primitiveCollection.length; i++) {
          const primitive = primitiveCollection.get(i);
          if (primitive.id === entityId) {
            primitiveCollection.remove(primitive);
            break;
          }
        }
      }

      // Update state
      set(state => {
        const newLoadedModels = new Map(state.loadedModels);
        newLoadedModels.delete(modelId);

        const newLoadingStates = new Map(state.loadingStates);
        newLoadingStates.delete(modelId);

        return {
          loadedModels: newLoadedModels,
          loadingStates: newLoadingStates,
          isBlinking: newLoadedModels.size === 0,
        };
      });
    } catch (error) {
      console.error(`Error removing model ${modelId}:`, error);
    }
  },

  zoomToModel: modelId => {
    const { loadedModels } = get();
    const model = loadedModels.get(modelId);
    if (!model) return;

    const cesium = getCesium();
    if (!cesium) return;

    const { Cesium, viewer } = cesium;

    try {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          model.lon,
          model.lat,
          model.height,
        ),
        duration: 1.5,
      });
    } catch (error) {
      console.error(`Error zooming to model ${modelId}:`, error);
    }
  },

  toggleModelVisibility: modelId => {
    const cesium = getCesium();
    if (!cesium) return;

    const { viewer } = cesium;
    const entityId = `model-${modelId}`;

    try {
      // Look for entity
      const entity = viewer.entities.getById(entityId);
      if (entity) {
        entity.show = !entity.show;
        return;
      }

      // Look for tileset (primitive)
      const primitiveCollection = viewer.scene.primitives;
      for (let i = 0; i < primitiveCollection.length; i++) {
        const primitive = primitiveCollection.get(i);
        if (primitive.id === entityId) {
          primitive.show = !primitive.show;
          return;
        }
      }
    } catch (error) {
      console.error(`Error toggling visibility for model ${modelId}:`, error);
    }
  },

  isModelVisible: modelId => {
    const cesium = getCesium();
    if (!cesium) return false;

    const { viewer } = cesium;
    const entityId = `model-${modelId}`;

    try {
      // Look for entity
      const entity = viewer.entities.getById(entityId);
      if (entity) {
        return entity.show;
      }

      // Look for tileset (primitive)
      const primitiveCollection = viewer.scene.primitives;
      for (let i = 0; i < primitiveCollection.length; i++) {
        const primitive = primitiveCollection.get(i);
        if (primitive.id === entityId) {
          return primitive.show;
        }
      }
    } catch (error) {
      console.error(`Error checking visibility for model ${modelId}:`, error);
    }

    return false;
  },

  isModelLoaded: modelId => {
    return get().loadedModels.has(modelId);
  },

  setModelLoadingState: (modelId, state) => {
    set(currentState => {
      const newLoadingStates = new Map(currentState.loadingStates);
      newLoadingStates.set(modelId, state);
      return { loadingStates: newLoadingStates };
    });
  },
}));

// Helper functions for loading different model types
async function loadTiles3D(Cesium: any, viewer: any, model: Tiles3D) {
  const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      id: `model-${model.id}`,
      url: `${getModelUrl(model.type)}${model.url}`,
      maximumScreenSpaceError: model.maximumscreenspaceerror,
      maximumMemoryUsage: 512,
      preferLeaves: true,
      dynamicScreenSpaceError: true,
      dynamicScreenSpaceErrorDensity: 0.00278,
      dynamicScreenSpaceErrorFactor: 4.0,
      dynamicScreenSpaceErrorHeightFalloff: 0.25,
    }),
  );

  return new Promise<void>((resolve, reject) => {
    tileset.readyPromise
      .then(() => {
        try {
          const boundingSphere = tileset.boundingSphere;
          const cartographic = Cesium.Cartographic.fromCartesian(
            boundingSphere.center,
          );
          const surface = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            0.0,
          );
          const offset = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            model.heightoffset,
          );
          const translation = Cesium.Cartesian3.subtract(
            offset,
            surface,
            new Cesium.Cartesian3(),
          );
          tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

          // Zoom to model
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              model.lon,
              model.lat,
              model.height,
            ),
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .catch(reject);
  });
}

async function loadModelos3D(Cesium: any, viewer: any, model: Modelos3D) {
  const position = Cesium.Cartesian3.fromDegrees(
    model.lon,
    model.lat,
    model.height,
  );
  const heading = Cesium.Math.toRadians(model.heading);
  const pitch = Cesium.Math.toRadians(model.pitch);
  const roll = Cesium.Math.toRadians(model.roll);
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr,
  );

  viewer.entities.add({
    id: `model-${model.id}`,
    name: model.name,
    position,
    orientation,
    model: {
      uri: `${getModelUrl(model.type)}${model.url}`,
    },
  });

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      model.lon,
      model.lat,
      model.height,
    ),
  });

  return Promise.resolve();
}

async function loadPointCloud(Cesium: any, viewer: any, model: PointCloud) {
  const pointCloudShading = new Cesium.PointCloudShading({
    attenuation: true,
    geometricErrorScale: 1.0,
    maximumAttenuation: 10.0,
    baseResolution: 0.05,
    eyeDomeLighting: true,
  });

  const tileset = new Cesium.Cesium3DTileset({
    id: `model-${model.id}`,
    url: `${getModelUrl(model.type)}${model.url}`,
  });

  viewer.scene.primitives.add(tileset);
  tileset.style = new Cesium.Cesium3DTileStyle(model.style);
  tileset.pointCloudShading = pointCloudShading;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      model.lon,
      model.lat,
      model.height,
    ),
  });

  return Promise.resolve();
}
