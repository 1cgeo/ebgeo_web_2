// Path: map3d\features\area\useArea.ts
import { useEffect, useRef } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { getCesium } from '../../store';
import { useAreaStore } from './store';
import { AreaToolState } from './types';

export default function useArea() {
  const cesiumMap = useMapsStore(state => state.cesiumMap);
  const cesium = useMapsStore(state => state.cesium);
  const {
    toolState,
    style,
    startMeasuring,
    cancelMeasuring,
    completeMeasurement,
  } = useAreaStore();

  // Refs para manter estado entre renders
  const handlerRef = useRef<any>(null);
  const drawLayerRef = useRef<any>(null);
  const positionsRef = useRef<any[]>([]);
  const polygonRef = useRef<any>(null);
  const lineEntityRef = useRef<any>(null);
  const polygonEntityRef = useRef<any>(null);

  // Inicializa a camada de desenho
  useEffect(() => {
    if (!cesiumMap || !cesium) return;

    // Cria a camada se não existir
    if (!drawLayerRef.current) {
      drawLayerRef.current = new cesium.CustomDataSource('measureAreaLayer');
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
    if (toolState !== AreaToolState.MEASURING) {
      positionsRef.current = [];
      polygonRef.current = null;
      return;
    }

    // Prepara entidades para desenho
    polygonRef.current = new cesium.PolygonHierarchy();

    // Entidade de linha
    lineEntityRef.current = new cesium.Entity();
    lineEntityRef.current.polyline = {
      width: style.outlineWidth,
      material: new cesium.Color.fromCssColorString(style.outlineColor),
      clampToGround: true,
    };
    lineEntityRef.current.polyline.positions = new cesium.CallbackProperty(
      () => {
        return positionsRef.current;
      },
      false,
    );

    // Entidade de polígono
    polygonEntityRef.current = new cesium.Entity();
    polygonEntityRef.current.polyline = {
      width: style.outlineWidth,
      material: new cesium.Color.fromCssColorString(style.outlineColor),
      clampToGround: true,
    };
    polygonEntityRef.current.polyline.positions = new cesium.CallbackProperty(
      () => {
        return positionsRef.current;
      },
      false,
    );

    polygonEntityRef.current.polygon = {
      hierarchy: new cesium.CallbackProperty(() => {
        return polygonRef.current;
      }, false),
      material: new cesium.Color.fromCssColorString(style.fillColor),
      clampToGround: true,
    };

    drawLayerRef.current.entities.add(lineEntityRef.current);

    // Configura eventos
    handlerRef.current = new cesium.ScreenSpaceEventHandler(
      cesiumMap.scene.canvas,
    );

    // Click esquerdo - adiciona ponto
    handlerRef.current.setInputAction((movement: any) => {
      const cartesian = getCatesian3FromPX(movement.position);
      if (cartesian && cartesian.x) {
        if (positionsRef.current.length === 0) {
          polygonRef.current.positions.push(cartesian.clone());
          positionsRef.current.push(cartesian.clone());
        }
        positionsRef.current.push(cartesian.clone());
        polygonRef.current.positions.push(cartesian.clone());

        if (!drawLayerRef.current.entities.contains(polygonEntityRef.current)) {
          drawLayerRef.current.entities.add(polygonEntityRef.current);
        }
      }
    }, cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Click direito - finaliza medição
    handlerRef.current.setInputAction(() => {
      if (positionsRef.current.length < 3) {
        cancelMeasuring();
        return;
      }

      // Fecha o polígono
      positionsRef.current.push(positionsRef.current[0]);

      // Calcula área e adiciona label
      addAreaLabel(positionsRef.current[0]);

      // Completa a medição
      completeMeasurement({
        positions: positionsRef.current.map((p: any) => ({
          x: p.x,
          y: p.y,
          z: p.z,
        })),
        area: calculateArea(positionsRef.current),
      });
    }, cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // Movimento do mouse - atualiza último ponto
    handlerRef.current.setInputAction((movement: any) => {
      const cartesian = getCatesian3FromPX(movement.endPosition);
      if (positionsRef.current.length >= 2) {
        if (cartesian && cartesian.x) {
          positionsRef.current.pop();
          positionsRef.current.push(cartesian);
          polygonRef.current.positions.pop();
          polygonRef.current.positions.push(cartesian);
        }
      }
    }, cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }, [
    cesiumMap,
    cesium,
    toolState,
    style,
    cancelMeasuring,
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

  // Calcula área conforme o original - usando turf.js
  function calculateArea(positions: any[]) {
    if (!window.turf || positions.length < 3) return 0;

    try {
      // Converte posições para o formato que o turf espera
      const wgs84Positions = transformCartesianArrayToWGS84Array(positions);
      const coordinates = wgs84Positions.map(p => [p.lng, p.lat]);

      // Cria polígono e calcula área
      const polygon = window.turf.polygon([coordinates]);
      const area = window.turf.area(polygon);

      return area;
    } catch (error) {
      console.error('Erro ao calcular área:', error);
      return 0;
    }
  }

  // Adiciona label com o valor da área
  function addAreaLabel(position: any) {
    if (!cesium || !drawLayerRef.current) return;

    const labelEntity = new cesium.Entity();
    labelEntity.position = position;
    labelEntity.point = {
      pixelSize: 10,
      outlineColor: cesium.Color.fromCssColorString(style.outlineColor),
      outlineWidth: 5,
    };

    // Calcula área
    const area = calculateArea(positionsRef.current);

    // Formata a área conforme o original
    const areaText =
      area < 1000000
        ? `${area.toFixed(1)} m²`
        : `${(area / 1000000).toFixed(1)} km²`;

    labelEntity.label = {
      text: areaText.replace('.', ','),
      show: true,
      showBackground: true,
      backgroundColor: cesium.Color.fromCssColorString(
        style.labelBackgroundColor,
      ),
      fillColor: cesium.Color.fromCssColorString(style.labelTextColor),
      font: style.labelFont,
      horizontalOrigin: cesium.HorizontalOrigin.LEFT,
      verticalOrigin: cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new cesium.Cartesian2(-20, -50), // left top, conforme original
    };

    drawLayerRef.current.entities.add(labelEntity);
  }

  return {
    isActive: toolState === AreaToolState.MEASURING,
    startMeasuring,
    cancelMeasuring,
  };
}
