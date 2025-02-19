// Path: map3d\features\label\useLabel.ts
import { EventEmitter } from '@/map3d/utils/events';

export function useLabel() {
  let isActive: any = null;
  let selectedLabel: any = null;

  const setup = (Cesium: any, _viewer: any) => {
    const _handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
    const _drawLayer = new Cesium.CustomDataSource('label');
    _viewer.dataSources.add(_drawLayer);

    _handler.setInputAction((movement: any) => {
      if (!isActive) return;
      if (selectedLabel) {
        selectedLabel.point = getPointStyle('default');
        selectedLabel = null;
      }
      const pickedObject = _viewer.scene.pick(movement.position);
      if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
        const entity = pickedObject.id;
        entity.point = getPointStyle('select');
        selectedLabel = entity;
        EventEmitter.dispatch('3d-label-select', selectedLabel);
      } else {
        const cartesian = getCatesian3FromPX(movement.position);
        _addLabel(cartesian);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    function getCatesian3FromPX(px: any) {
      if (px) {
        const picks = _viewer.scene.drillPick(px);
        let cartesian = null;
        let isOn3dtiles = false,
          isOnTerrain = false;
        // drillPick
        for (const i in picks) {
          const pick = picks[i];

          if (
            (pick && pick.primitive instanceof Cesium.Cesium3DTileFeature) ||
            (pick && pick.primitive instanceof Cesium.Cesium3DTileset) ||
            (pick && pick.primitive instanceof Cesium.Model)
          ) {
            isOn3dtiles = true;
          }
          // 3dtilset
          if (isOn3dtiles) {
            _viewer.scene.pick(px); // pick
            cartesian = _viewer.scene.pickPosition(px);
            if (cartesian) {
              const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              if (cartographic.height < 0) cartographic.height = 0;
              const lon = Cesium.Math.toDegrees(cartographic.longitude),
                lat = Cesium.Math.toDegrees(cartographic.latitude),
                height = cartographic.height;
              cartesian = transformWGS84ToCartesian(
                {
                  lng: lon,
                  lat,
                  alt: height,
                },
                null,
              );
            }
          }
        }
        const boolTerrain =
          _viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
        // Terrain
        if (!isOn3dtiles && !boolTerrain) {
          const ray = _viewer.scene.camera.getPickRay(px);
          if (!ray) return null;
          cartesian = _viewer.scene.globe.pick(ray, _viewer.scene);
          isOnTerrain = true;
        }
        if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
          cartesian = _viewer.scene.camera.pickEllipsoid(
            px,
            _viewer.scene.globe.ellipsoid,
          );
        }
        if (cartesian) {
          const position = transformCartesianToWGS84(cartesian);
          if (position && position.alt < 0) {
            cartesian = transformWGS84ToCartesian(position, 0.1);
          }
          return cartesian;
        }
        return false;
      }
    }

    function transformWGS84ToCartesian(position: any, alt: any) {
      return position
        ? Cesium.Cartesian3.fromDegrees(
            position.lng || position.lon,
            position.lat,
            (position.alt = alt || position.alt),
            Cesium.Ellipsoid.WGS84,
          )
        : Cesium.Cartesian3.ZERO;
    }

    function transformCartesianToWGS84(cartesian: any) {
      if (cartesian) {
        const ellipsoid = Cesium.Ellipsoid.WGS84;
        const cartographic = ellipsoid.cartesianToCartographic(cartesian);
        return {
          lng: Cesium.Math.toDegrees(cartographic.longitude),
          lat: Cesium.Math.toDegrees(cartographic.latitude),
          alt: cartographic.height,
        };
      }
    }

    function _addLabel(position: any) {
      const _labelEntity = new Cesium.Entity();
      _labelEntity.position = position;
      _labelEntity.point = getPointStyle('default');
      _labelEntity.label = {
        //text: `TESTE`,
        show: true,
        showBackground: true,
        //font: "38px monospace",
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(-20, -50), //left top
        scaleByDistance: new Cesium.NearFarScalar(500, 4, 5000, 0.3),
      };
      EventEmitter.dispatch(
        '3d-label-created',
        _drawLayer.entities.add(_labelEntity),
      );
    }

    function getPointStyle(styleName: string) {
      return {
        default: {
          pixelSize: 10,
          outlineColor: Cesium.Color.RED,
          outlineWidth: 5,
          color: Cesium.Color.BLACK,
        },
        select: {
          pixelSize: 10,
          outlineColor: Cesium.Color.fromCssColorString('#FFFF00'),
          outlineWidth: 5,
          color: Cesium.Color.fromCssColorString('#FFFF00'),
        },
      }[styleName];
    }

    function setActive(active: boolean) {
      isActive = active;
    }

    function _clean() {
      _drawLayer.entities.removeAll();
    }

    function setLabelProperties(entity: any, properties: any) {
      entity.label.text = properties.text;
      entity.label.font = `${properties.size}px monospace`;
      entity.label.fillColor = Cesium.Color.fromCssColorString(
        properties.fillColor,
      );
      entity.label.backgroundColor = Cesium.Color.fromCssColorString(
        properties.backgroundColor,
      );
      entity.label.horizontalOrigin = getTextAlign(properties.align);
      entity.label.dump = properties;
    }

    function getTextAlign(align: string) {
      return {
        left: Cesium.HorizontalOrigin.RIGHT,
        right: Cesium.HorizontalOrigin.LEFT,
        center: Cesium.HorizontalOrigin.CENTER,
      }[align];
    }

    function getLabelProperties(entity: any) {
      return entity.label.dump;
    }

    function remove(entity: any) {
      _drawLayer.entities.remove(entity);
    }

    function deselectAll() {
      if (selectedLabel) {
        selectedLabel.point = getPointStyle('default');
        selectedLabel = null;
      }
    }

    return {
      setActive,
      clean: () => {
        isActive = false;
        _clean();
      },
      onSelect: (cb: any) => EventEmitter.subscribe('3d-label-select', cb),
      offSelect: () => EventEmitter.unsubscribe('3d-label-select'),
      onCreated: (cb: any) => EventEmitter.subscribe('3d-label-created', cb),
      offCreated: () => EventEmitter.unsubscribe('3d-label-created'),
      setLabelProperties,
      getLabelProperties,
      remove,
      deselectAll,
    };
  };

  return {
    setup,
  };
}
