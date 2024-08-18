import { create } from 'zustand';
import { Viewer, Ion, Terrain } from 'cesium';

const cesiumIonToken = import.meta.env.VITE_CESIUM_ION_TOKEN;

const use3DStore = create((set, get) => ({
  viewer: null,

  initializeViewer: (container) => {
    Ion.defaultAccessToken = cesiumIonToken;
    const viewer = new Viewer(container, {
      terrainProvider: Terrain.fromWorldTerrain(),
    });
    set({ viewer });
    return viewer;
  },


  loadTilesets: () => {
    const viewer = get().viewer;
    if (!viewer) return;

    // Load your 3D tilesets here
    // Example: viewer.scene.primitives.add(new Cesium3DTileset({...}));
  },

  cleanupViewer: () => {
    const viewer = get().viewer;
    if (viewer) {
      viewer.destroy();
      set({ viewer: null });
    }
  }
}));

export { use3DStore };