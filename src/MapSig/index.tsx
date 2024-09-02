import { lazy } from "react";
import { Outlet, RouteObject, Navigate } from "react-router-dom";
let MapSig = lazy(() => import("./Map.tsx"));

const routes: RouteObject = {
  path: "/",
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <Navigate to="/map-sig" />,
    },
    {
      path: "map-sig",
      element: <MapSig />,
    },
  ],
};

export default routes;
