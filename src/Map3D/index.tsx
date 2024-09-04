import { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";

let Map3D = lazy(() => import("./Map.tsx"));

const routes: RouteObject = {
  path: "/",
  children: [
    {
      index: true,
      element: <Navigate to="/map-3d" />,
    },
    {
      path: "map-3d",
      element: <Map3D />,
    },
  ],
};

export default routes;
