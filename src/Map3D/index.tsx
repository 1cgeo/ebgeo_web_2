import { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import Layout from "./layout/index.tsx";

let Map3D = lazy(() => import("./Map3D.tsx"));

const routes: RouteObject = {
  element: <Layout />,
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
