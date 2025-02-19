// Path: global.d.ts
export {};

declare global {
  interface Window {
    maplibregl?: any;
    cesium?: any;
    turf?: any;
  }
}
