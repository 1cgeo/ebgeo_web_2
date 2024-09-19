declare global {
  interface Window {
    turf?: any;
  }
}

export default function useMeasure() {
  var activeMeasure: any = null;
  var reset: boolean = false;
  var toClean: boolean = false;
  var refreshIntervalId: any = null;

  const setup = (Cesium: any, _viewer: any) => {
    var positions: any[] = [],
      options: any = { clampToGround: true },
      polygon: any = new Cesium.PolygonHierarchy(),
      _polygonEntity: any = new Cesium.Entity(),
      polyObj: any = null,
      _handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
    var _lineEntity: any = new Cesium.Entity();
    _lineEntity.polyline = {
      width: options.width || 5,
      material: options.material || Cesium.Color.BLUE.withAlpha(0.8),
      clampToGround: options.clampToGround || false,
    };
    _lineEntity.polyline.positions = new Cesium.CallbackProperty(function () {
      return positions;
    }, false);
    var _drawLayer = new Cesium.CustomDataSource("measureAreaLayer");
    _drawLayer.entities.add(_lineEntity);
    _viewer.dataSources.add(_drawLayer);

    var turf = window?.turf;
    var MEASURES: any = {
      area: {
        click_left: function (movement: any) {
          var cartesian = getCatesian3FromPX(movement.position);
          if (cartesian && cartesian.x) {
            if (positions.length == 0) {
              polygon.positions.push(cartesian.clone());
              positions.push(cartesian.clone());
            }
            positions.push(cartesian.clone());
            polygon.positions.push(cartesian.clone());

            if (!polyObj) create();
          }
        },
        click_right: function () {
          positions.push(positions[0]);
          _addInfoPointArea(positions[0]);
        },
        mouse_move: function (movement: any) {
          var cartesian = getCatesian3FromPX(movement.endPosition);
          if (positions.length >= 2) {
            if (cartesian && cartesian.x) {
              positions.pop();
              positions.push(cartesian);
              polygon.positions.pop();
              polygon.positions.push(cartesian);
            }
          }
        },
      },
      distance: {
        click_left: function (movement: any) {
          var cartesian = getCatesian3FromPX(movement.position);
          if (cartesian && cartesian.x) {
            if (positions.length == 0) {
              positions.push(cartesian.clone());
            }
            _addInfoPointDistance(cartesian);
            positions.push(cartesian);
          }
        },
        click_right: function (movement: any) {
          let cartesian = getCatesian3FromPX(movement.position);
          _addInfoPointDistance(cartesian);
        },
        mouse_move: function (movement: any) {
          var cartesian = getCatesian3FromPX(movement.endPosition);
          if (positions.length >= 2) {
            if (cartesian && cartesian.x) {
              positions.pop();
              positions.push(cartesian);
            }
          }
        },
      },
    };

    _handler.setInputAction(function (movement: any) {
      if (!activeMeasure) return;
      if (reset) {
        _clean();
        reset = false;
      }
      MEASURES[activeMeasure]["click_left"](movement);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // mouse
    _handler.setInputAction(function (movement: any) {
      if (!activeMeasure || reset) return;
      MEASURES[activeMeasure]["mouse_move"](movement);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // right
    _handler.setInputAction(function (movement: any) {
      if (!activeMeasure || reset) return;
      MEASURES[activeMeasure]["click_right"](movement);
      reset = true;
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    function getCatesian3FromPX(px: any) {
      if (px) {
        var picks = _viewer.scene.drillPick(px);
        var cartesian = null;
        var isOn3dtiles = false,
          isOnTerrain = false;
        // drillPick
        for (let i in picks) {
          let pick = picks[i];

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
              let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              if (cartographic.height < 0) cartographic.height = 0;
              let lon = Cesium.Math.toDegrees(cartographic.longitude),
                lat = Cesium.Math.toDegrees(cartographic.latitude),
                height = cartographic.height;
              cartesian = transformWGS84ToCartesian(
                {
                  lng: lon,
                  lat: lat,
                  alt: height,
                },
                null
              );
            }
          }
        }
        let boolTerrain =
          _viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
        // Terrain
        if (!isOn3dtiles && !boolTerrain) {
          var ray = _viewer.scene.camera.getPickRay(px);
          if (!ray) return null;
          cartesian = _viewer.scene.globe.pick(ray, _viewer.scene);
          isOnTerrain = true;
        }
        if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
          cartesian = _viewer.scene.camera.pickEllipsoid(
            px,
            _viewer.scene.globe.ellipsoid
          );
        }
        if (cartesian) {
          let position = transformCartesianToWGS84(cartesian);
          if (position && position.alt < 0) {
            cartesian = transformWGS84ToCartesian(position, 0.1);
          }
          return cartesian;
        }
        return false;
      }
    }

    function transformCartesianArrayToWGS84Array(cartesianArr: any) {
      return cartesianArr
        ? cartesianArr.map(function (item: any) {
            return transformCartesianToWGS84(item);
          })
        : [];
    }

    function transformWGS84ToCartesian(position: any, alt: any) {
      return position
        ? Cesium.Cartesian3.fromDegrees(
            position.lng || position.lon,
            position.lat,
            (position.alt = alt || position.alt),
            Cesium.Ellipsoid.WGS84
          )
        : Cesium.Cartesian3.ZERO;
    }

    function transformCartesianToWGS84(cartesian: any) {
      if (cartesian) {
        var ellipsoid = Cesium.Ellipsoid.WGS84;
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        return {
          lng: Cesium.Math.toDegrees(cartographic.longitude),
          lat: Cesium.Math.toDegrees(cartographic.latitude),
          alt: cartographic.height,
        };
      }
    }

    function create() {
      _polygonEntity.polyline = {
        width: 3,
        material: Cesium.Color.BLUE.withAlpha(0.8),
        clampToGround: options.clampToGround || false,
      };

      _polygonEntity.polyline.positions = new Cesium.CallbackProperty(
        function () {
          return positions;
        },
        false
      );

      _polygonEntity.polygon = {
        hierarchy: new Cesium.CallbackProperty(function () {
          return polygon;
        }, false),

        material: Cesium.Color.WHITE.withAlpha(0.1),
        clampToGround: options.clampToGround || false,
      };

      polyObj = _drawLayer.entities.add(_polygonEntity);
    }

    function getPositionDistance(positions: any) {
      let distance = 0;
      for (let i = 0; i < positions.length - 1; i++) {
        let point1cartographic = transformWGS84ToCartographic(positions[i]);
        let point2cartographic = transformWGS84ToCartographic(positions[i + 1]);
        let geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        let s = geodesic.surfaceDistance;
        s = Math.sqrt(
          Math.pow(s, 2) +
            Math.pow(point2cartographic.height - point1cartographic.height, 2)
        );
        distance = distance + s;
      }
      return distance.toFixed(3);
    }

    function transformWGS84ToCartographic(position: any) {
      return position
        ? Cesium.Cartographic.fromDegrees(
            position.lng || position.lon,
            position.lat,
            position.alt
          )
        : Cesium.Cartographic.ZERO;
    }

    function _addInfoPointArea(position: any) {
      var _labelEntity = new Cesium.Entity();
      _labelEntity.position = position;
      _labelEntity.point = {
        pixelSize: 10,
        outlineColor: Cesium.Color.BLUE,
        outlineWidth: 5,
      };
      var polygon = turf.polygon([
        transformCartesianArrayToWGS84Array(positions).map((i: any) => [
          i.lng,
          i.lat,
        ]),
      ]);

      const area = +turf.area(polygon);
      _labelEntity.label = {
        text: `${(area / 1000 < 1 ? area : area / 1000).toFixed(1)} ${area / 1000 < 1 ? "m²" : "km²"}`.replace(
          ".",
          ","
        ),
        show: true,
        showBackground: true,
        font: "14px monospace",
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(-20, -50), //left top
      };
      _drawLayer.entities.add(_labelEntity);
    }

    function _addInfoPointDistance(position: any) {
      var _labelEntity = new Cesium.Entity();
      _labelEntity = new Cesium.Entity();
      _labelEntity.position = position;
      _labelEntity.point = {
        pixelSize: 10,
        outlineColor: Cesium.Color.BLUE,
        outlineWidth: 5,
      };
      const distance = +getPositionDistance(
        transformCartesianArrayToWGS84Array(positions)
      );
      _labelEntity.label = {
        text: `${(distance < 1000 ? distance : distance / 1000).toFixed(1)} ${distance < 1000 ? "m" : "km"}`.replace(
          ".",
          ","
        ),
        show: true,
        showBackground: true,
        font: "14px monospace",
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(-20, -80), //left top
      };
      _drawLayer.entities.add(_labelEntity);
    }

    function setActiveMeasure(measureName: string | null) {
      activeMeasure = measureName;
      reset = true;
    }

    function _clean() {
      _drawLayer.entities.removeAll();
      positions = [];
      polygon = new Cesium.PolygonHierarchy();
      _polygonEntity = new Cesium.Entity();
      polyObj = null;
      _handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
      _lineEntity = new Cesium.Entity();
      _lineEntity.polyline = {
        width: options.width || 5,
        material: options.material || Cesium.Color.BLUE.withAlpha(0.8),
        clampToGround: options.clampToGround || false,
      };
      _lineEntity.polyline.positions = new Cesium.CallbackProperty(function () {
        return positions;
      }, false);
      _drawLayer.entities.add(_lineEntity);
    }

    if (!refreshIntervalId) {
      refreshIntervalId = setInterval(() => {
        if (!toClean) return;
        _clean();
        toClean = false;
      }, 100);
    }

    return {
      setActiveMeasure,
      clean: () => (toClean = true),
    };
  };

  return {
    setup,
  };
}
