// Path: map3d\hooks\useViewshed.ts
import { useCallback } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

export function useViewshed() {
  const { cesium, cesiumMap } = useMapsStore();

  const setup = useCallback(
    (Cesium: any, viewer: any) => {
      let arrViewField: any[] = [];
      const viewModel = {
        verticalAngle: 120,
        horizontalAngle: 150,
        distance: 10,
      };
      let reset = false;
      let currentViewshed: any;

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      handler.setInputAction((movement: any) => {
        if (reset) addViewshed();
        if (!currentViewshed) return;
        currentViewshed.viewer = viewer;
        const leftClick = currentViewshed._leftClick();
        leftClick(movement);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction((movement: any) => {
        if (!currentViewshed) return;
        currentViewshed.viewer = viewer;
        const mouseMove = currentViewshed._mouseMove();
        mouseMove(movement);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      const addViewshed = () => {
        const e = new Cesium.ViewShed3D(viewer, {
          horizontalAngle: Number(viewModel.horizontalAngle),
          verticalAngle: Number(viewModel.verticalAngle),
          distance: Number(viewModel.distance),
          calback: () => {
            viewModel.distance = e.distance;
            reset = true;
            currentViewshed = null;
          },
        });
        reset = false;
        currentViewshed = e;
        arrViewField.push(e);
      };

      const clean = () => {
        for (let e = 0, i = arrViewField.length; e < i; e++) {
          arrViewField[e]?.viewer.scene.postProcessStages.removeAll();
          arrViewField[e]?.viewer.entities.removeAll();
          arrViewField[e].destroy();
        }
        arrViewField = [];
        currentViewshed = null;
      };

      return {
        addViewshed,
        clean,
      };
    },
    [cesium, cesiumMap],
  );

  return { setup };
}
