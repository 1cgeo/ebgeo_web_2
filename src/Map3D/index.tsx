import { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";

let MapSig = lazy(() => import("./Map.tsx"));

const routes: RouteObject = {
  path: "/",
  children: [
    {
      index: true,
      element: <Navigate to="/map-3d" />,
    },
    {
      path: "map-3d",
      element: <MapSig />,
    },
  ],
};

export default routes;
