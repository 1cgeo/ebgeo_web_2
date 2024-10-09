import { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import Layout from "./layout/index.tsx";

let MapSig = lazy(() => import("./MapSIG.tsx"));

const routes: RouteObject = {
  element: <Layout />,
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
