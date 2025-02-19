// Path: map3d\utils\cesiumUtils.ts
import { useMapsStore } from '@/shared/store/mapsStore';

import { type Cartesian } from '../types';

interface PickResult {
  position: Cartesian;
  feature?: any;
  primitive?: any;
}

export function pickPosition(screenPosition: {
  x: number;
  y: number;
}): PickResult | null {
  const { cesium, cesiumMap } = useMapsStore.getState();
  if (!cesium || !cesiumMap) return null;

  const scene = cesiumMap.scene;
  const cartesian = scene.pickPosition(screenPosition);
  if (!cartesian) return null;

  const pickedObject = scene.pick(screenPosition);

  return {
    position: {
      x: cartesian.x,
      y: cartesian.y,
      z: cartesian.z,
    },
    feature: pickedObject?.id,
    primitive: pickedObject?.primitive,
  };
}

export function cartesianToLatLng(cartesian: Cartesian) {
  const { cesium } = useMapsStore.getState();
  if (!cesium) return null;

  const cartographic = cesium.Cartographic.fromCartesian(
    new cesium.Cartesian3(cartesian.x, cartesian.y, cartesian.z),
  );

  return {
    lat: cesium.Math.toDegrees(cartographic.latitude),
    lon: cesium.Math.toDegrees(cartographic.longitude),
    height: cartographic.height,
  };
}

export function latLngToCartesian(
  lat: number,
  lng: number,
  height: number = 0,
) {
  const { cesium } = useMapsStore.getState();
  if (!cesium) return null;

  const cartesian = cesium.Cartesian3.fromDegrees(lng, lat, height);

  return {
    x: cartesian.x,
    y: cartesian.y,
    z: cartesian.z,
  };
}

export function calculateDistance(start: Cartesian, end: Cartesian) {
  const { cesium } = useMapsStore.getState();
  if (!cesium) return 0;

  const startCartographic = cesium.Cartographic.fromCartesian(
    new cesium.Cartesian3(start.x, start.y, start.z),
  );

  const endCartographic = cesium.Cartographic.fromCartesian(
    new cesium.Cartesian3(end.x, end.y, end.z),
  );

  const geodesic = new cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(startCartographic, endCartographic);

  const surfaceDistance = geodesic.surfaceDistance;
  const heightDifference = endCartographic.height - startCartographic.height;

  return Math.sqrt(
    Math.pow(surfaceDistance, 2) + Math.pow(heightDifference, 2),
  );
}
