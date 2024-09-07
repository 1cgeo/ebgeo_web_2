import { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";

let MapSig = lazy(() => import("./MapSIG.tsx"));

const routes: RouteObject = {
  path: "/",
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
