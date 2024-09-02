import * as React from "react";
import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Loading from "./components/Loading";
import routeMapSig from "./MapSig";

const router = createBrowserRouter([
  {
    path: "/",
    //element: <Layout/>,
    children: [routeMapSig],
  },
]);

export default function App() {
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 5000);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return <RouterProvider router={router} />;
}
