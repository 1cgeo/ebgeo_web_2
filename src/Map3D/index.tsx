import { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import MapToolsProvider from "./contexts/Map3DTools.tsx";

let Map3D = lazy(() => import("./Map3D.tsx"));

const routes: RouteObject = {
  path: "/",
  children: [
    {
      index: true,
      element: <Navigate to="/map-3d" />,
    },
    {
      path: "map-3d",
      element: (
        <MapToolsProvider>
          <Map3D />
        </MapToolsProvider>
      ),
    },
  ],
};

export default routes;
