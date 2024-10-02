export default function useViewshed() {
  var arrViewField: any[] = [];
  var viewModel = { verticalAngle: 120, horizontalAngle: 150, distance: 10 };
  var active: boolean = false;
  var reset: boolean = false;
  var currentViewshed: any;

  const setup = (Cesium: any, _viewer: any) => {
    var _handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
    _handler.setInputAction(function (movement: any) {
      if (active && reset) addViewshed();
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
          reset = true;
          currentViewshed = null;
        },
      });
      reset = false;
      active = true;
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

    return {
      addViewshed,
      clean: _clean,
    };
  };

  return { setup };
}
