// Path: map3d\features\distance\useDistance.ts
import { useEffect, useRef } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { useDistanceStore } from './store';
import { DistanceToolState } from './types';

export function useDistance() {
  const cesiumMap = useMapsStore(state => state.cesiumMap);
  const cesium = useMapsStore(state => state.cesium);
  const {
    toolState,
    style,
    startMeasuring,
    cancelMeasuring,
    addPoint,
    completeMeasurement,
  } = useDistanceStore();

  // Refs para manter estado entre renders
  const handlerRef = useRef<any>(null);
  const drawLayerRef = useRef<any>(null);
  const positionsRef = useRef<any[]>([]);
  const lineEntityRef = useRef<any>(null);

  // Inicializa a camada de desenho
  useEffect(() => {
    if (!cesiumMap || !cesium) return;

    // Cria a camada se não existir
    if (!drawLayerRef.current) {
      drawLayerRef.current = new cesium.CustomDataSource(
        'measureDistanceLayer',
      );
      cesiumMap.dataSources.add(drawLayerRef.current);
    }

    // Cleanup na desmontagem
    return () => {
      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
    };
  }, [cesiumMap, cesium]);

  // Configura os handlers de evento quando toolState muda
  useEffect(() => {
    if (!cesiumMap || !cesium || !drawLayerRef.current) return;

    // Limpa handlers anteriores
    if (handlerRef.current) {
      handlerRef.current.destroy();
      handlerRef.current = null;
    }

    // Reset posições se não estiver medindo
    if (toolState !== DistanceToolState.MEASURING) {
      positionsRef.current = [];
      return;
    }

    // Prepara entidade para desenho da linha
    lineEntityRef.current = new cesium.Entity();
    lineEntityRef.current.polyline = {
      width: style.lineWidth,
      material: new cesium.Color.fromCssColorString(style.lineColor),
      clampToGround: true,
    };
    lineEntityRef.current.polyline.positions = new cesium.CallbackProperty(
      () => {
        return positionsRef.current;
      },
      false,
    );

    drawLayerRef.current.entities.add(lineEntityRef.current);

    // Configura eventos
    handlerRef.current = new cesium.ScreenSpaceEventHandler(
      cesiumMap.scene.canvas,
    );

    // Click esquerdo - adiciona ponto
    handlerRef.current.setInputAction((movement: any) => {
      const cartesian = getCatesian3FromPX(movement.position);
      if (cartesian && cartesian.x) {
        // Adiciona ponto às posições de desenho
        positionsRef.current.push(cartesian.clone());

        // Adiciona marcador de ponto
        addDistancePoint(cartesian);

        // Adiciona ao store
        addPoint(
          { x: cartesian.x, y: cartesian.y, z: cartesian.z },
          positionsRef.current.length > 1,
        );
      }
    }, cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Click direito - finaliza medição
    handlerRef.current.setInputAction((movement: any) => {
      if (positionsRef.current.length < 2) {
        cancelMeasuring();
        return;
      }

      const cartesian = getCatesian3FromPX(movement.position);
      if (cartesian && cartesian.x) {
        // Adiciona o último ponto
        positionsRef.current.push(cartesian.clone());

        // Adiciona marcador final com distância total
        addDistancePoint(cartesian, true);

        // Adiciona ao store e completa
        addPoint({ x: cartesian.x, y: cartesian.y, z: cartesian.z }, true);
        completeMeasurement();
      } else {
        completeMeasurement();
      }
    }, cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // Movimento do mouse - atualiza último ponto
    handlerRef.current.setInputAction((movement: any) => {
      const cartesian = getCatesian3FromPX(movement.endPosition);
      if (positionsRef.current.length >= 1) {
        if (cartesian && cartesian.x) {
          if (positionsRef.current.length === 1) {
            positionsRef.current.push(cartesian);
          } else {
            positionsRef.current.pop();
            positionsRef.current.push(cartesian);
          }
        }
      }
    }, cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }, [
    cesiumMap,
    cesium,
    toolState,
    style,
    cancelMeasuring,
    addPoint,
    completeMeasurement,
  ]);

  // Função para obter coordenadas 3D a partir de coordenadas de tela
  function getCatesian3FromPX(px: any) {
    if (!px || !cesiumMap || !cesium) return null;

    const picks = cesiumMap.scene.drillPick(px);
    let cartesian = null;
    let isOn3dtiles = false;
    let isOnTerrain = false;

    // Verifica se o pick está em um modelo 3D
    for (let i = 0; i < picks.length; i++) {
      const pick = picks[i];
      if (
        (pick && pick.primitive instanceof cesium.Cesium3DTileFeature) ||
        (pick && pick.primitive instanceof cesium.Cesium3DTileset) ||
        (pick && pick.primitive instanceof cesium.Model)
      ) {
        isOn3dtiles = true;
        break;
      }
    }

    // Se estiver em um modelo 3D
    if (isOn3dtiles) {
      cesiumMap.scene.pick(px);
      cartesian = cesiumMap.scene.pickPosition(px);
      if (cartesian) {
        const cartographic = cesium.Cartographic.fromCartesian(cartesian);
        if (cartographic.height < 0) cartographic.height = 0;
        const lon = cesium.Math.toDegrees(cartographic.longitude);
        const lat = cesium.Math.toDegrees(cartographic.latitude);
        cartesian = cesium.Cartesian3.fromDegrees(
          lon,
          lat,
          cartographic.height,
        );
      }
    }

    // Se não estiver em um modelo 3D, tenta no terreno
    const boolTerrain =
      cesiumMap.terrainProvider instanceof cesium.EllipsoidTerrainProvider;
    if (!isOn3dtiles && !boolTerrain) {
      const ray = cesiumMap.scene.camera.getPickRay(px);
      if (ray) {
        cartesian = cesiumMap.scene.globe.pick(ray, cesiumMap.scene);
        isOnTerrain = !!cartesian;
      }
    }

    // Se não estiver no terreno nem em um modelo 3D, obtém no elipsoide
    if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
      cartesian = cesiumMap.scene.camera.pickEllipsoid(
        px,
        cesiumMap.scene.globe.ellipsoid,
      );
    }

    // Corrige altura negativa
    if (cartesian) {
      const cartographic = cesium.Cartographic.fromCartesian(cartesian);
      if (cartographic.height < 0) {
        cartesian = cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0,
        );
      }
    }

    return cartesian;
  }

  // Converte Cartesian para WGS84
  function transformCartesianToWGS84(cartesian: any) {
    if (!cartesian || !cesium) return null;

    const ellipsoid = cesium.Ellipsoid.WGS84;
    const cartographic = ellipsoid.cartesianToCartographic(cartesian);
    return {
      lng: cesium.Math.toDegrees(cartographic.longitude),
      lat: cesium.Math.toDegrees(cartographic.latitude),
      alt: cartographic.height,
    };
  }

  // Converte array de Cartesian para array de WGS84
  function transformCartesianArrayToWGS84Array(cartesianArr: any[]) {
    return cartesianArr
      ? cartesianArr.map(item => transformCartesianToWGS84(item))
      : [];
  }

  // Converte WGS84 para Cartographic
  function transformWGS84ToCartographic(position: any) {
    if (!position || !cesium) return null;

    return cesium.Cartographic.fromDegrees(
      position.lng || position.lon,
      position.lat,
      position.alt,
    );
  }

  // Calcula distância conforme o original - usando EllipsoidGeodesic
  function getPositionDistance(positions: any[]) {
    if (!cesium || positions.length < 2) return 0;

    let distance = 0;
    const wgs84Positions = transformCartesianArrayToWGS84Array(positions);

    for (let i = 0; i < wgs84Positions.length - 1; i++) {
      const position1 = wgs84Positions[i];
      const position2 = wgs84Positions[i + 1];

      if (!position1 || !position2) continue;

      const point1cartographic = transformWGS84ToCartographic(position1);
      const point2cartographic = transformWGS84ToCartographic(position2);

      if (!point1cartographic || !point2cartographic) continue;

      const geodesic = new cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      let s = geodesic.surfaceDistance;

      // Adiciona a distância vertical
      s = Math.sqrt(
        Math.pow(s, 2) +
          Math.pow(point2cartographic.height - point1cartographic.height, 2),
      );

      distance += s;
    }

    return distance;
  }

  // Adiciona ponto da medição com label opcional
  function addDistancePoint(position: any, isFinal: boolean = false) {
    if (!cesium || !drawLayerRef.current) return;

    // Cria entidade para o ponto
    const pointEntity = new cesium.Entity();
    pointEntity.position = position;
    pointEntity.point = {
      pixelSize: style.pointSize,
      color: cesium.Color.fromCssColorString(style.pointColor),
      outlineWidth: 2,
      outlineColor: cesium.Color.WHITE,
    };

    // Se for o ponto final, adiciona label com a distância total
    if (isFinal && positionsRef.current.length >= 2) {
      // Calcula a distância total usando o método original
      const totalDistance = getPositionDistance(positionsRef.current);

      // Formata a distância conforme o original
      const distanceText =
        totalDistance < 1000
          ? `${(+totalDistance).toFixed(1)} m`
          : `${(+totalDistance / 1000).toFixed(1)} km`;

      // Adiciona label
      pointEntity.label = {
        text: distanceText.replace('.', ','),
        show: true,
        showBackground: true,
        backgroundColor: cesium.Color.fromCssColorString(
          style.labelBackgroundColor,
        ),
        fillColor: cesium.Color.fromCssColorString(style.labelTextColor),
        font: style.labelFont,
        horizontalOrigin: cesium.HorizontalOrigin.LEFT,
        verticalOrigin: cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new cesium.Cartesian2(-20, -80), // left top, conforme original
      };
    }

    // Adiciona o ponto à camada de desenho
    drawLayerRef.current.entities.add(pointEntity);
  }

  return {
    isActive: toolState === DistanceToolState.MEASURING,
    startMeasuring,
    cancelMeasuring,
  };
}
