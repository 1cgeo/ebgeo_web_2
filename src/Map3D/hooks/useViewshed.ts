export default function useViewshed() {
  var arrViewField: any[] = [];
  var viewModel = { verticalAngle: 120, horizontalAngle: 150, distance: 10 };
  var active: boolean = false;
  var reset: boolean = false;
  var toClean: boolean = false;
  var currentViewshed: any;
  var refreshIntervalId: any = null;

  const setup = (Cesium: any, _viewer: any) => {
    var _handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
    _handler.setInputAction(function (movement: any) {
      if (!(currentViewshed && active)) return;
      currentViewshed.viewer = _viewer;
      let leftClick = currentViewshed._leftClick();
      leftClick(movement);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    _handler.setInputAction(function (movement: any) {
      if (!(currentViewshed && active)) return;
      currentViewshed.viewer = _viewer;
      let mouseMove = currentViewshed._mouseMove();
      mouseMove(movement);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    const addViewshed = () => {
      let e = new Cesium.ViewShed3D(_viewer, {
        horizontalAngle: Number(viewModel.horizontalAngle),
        verticalAngle: Number(viewModel.verticalAngle),
        distance: Number(viewModel.distance),
        calback: function () {
          viewModel.distance = e.distance;
          reset = false;
          currentViewshed = null;
        },
      });
      currentViewshed = e;
      arrViewField.push(e);
    };

    function _clean() {
      for (var e = 0, i = arrViewField.length; e < i; e++) {
        arrViewField[e]?.viewer.scene.postProcessStages.removeAll();
        arrViewField[e]?.viewer.entities.removeAll();
        arrViewField[e].destroy();
      }
      arrViewField = [];
    }

    if (!refreshIntervalId) {
      setInterval(() => {
        if (active && !reset) {
          reset = true;
          addViewshed();
        }
        if (!toClean) return;
        _clean();
        toClean = false;
      }, 100);
    }

    return {
      setActive: (a: boolean) => (active = a),
      clean: () => (toClean = true),
    };
  };

  return { setup };
}
