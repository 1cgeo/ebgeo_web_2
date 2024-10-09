import { Suspense, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ThemeConfig from "./theme";
import MainContextProvider from "./contexts/MainContext";
import Loading from "./components/Loading";
import routeMapSIG from "./MapSIG";
import routeMap3D from "./Map3D";
import "./App.css";
import MapToolsProvider from "./Map3D/contexts/Map3DTools.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        ...routeMapSIG,
      },
      {
        ...routeMap3D,
      },
    ],
  },
]);

export default function App() {
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  return (
    <>
      {isLoading && <Loading />}
      <MainContextProvider>
        <MapToolsProvider>
          <ThemeConfig>
            <Suspense fallback={<Loading />}>
              <RouterProvider router={router} />
            </Suspense>
          </ThemeConfig>
        </MapToolsProvider>
      </MainContextProvider>
    </>
  );
}
