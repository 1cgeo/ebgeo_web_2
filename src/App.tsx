import { Suspense, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ThemeConfig from "./theme";
import MainContextProvider from "./contexts/MainContext";
import Loading from "./components/Loading";
import routeMapSIG from "./MapSIG";
import routeMap3D from "./Map3D";
import "./App.css";
import MapToolsProvider from "./Map3D/contexts/Map3DTools.tsx";
import PanelProvider from "./MapSIG/contexts/PanelContext";
import ToolProvider from "./MapSIG/contexts/ToolContext";
import SelectionProvider from "./MapSIG/contexts/SelectionContext";
import { MapProvider } from "./MapSIG/contexts/MapFeaturesContext";

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
            <MapProvider>
              <ToolProvider>
                <SelectionProvider>
                  <PanelProvider>
                    <Suspense fallback={<Loading />}>
                      <RouterProvider router={router} />
                    </Suspense>
                  </PanelProvider>
                </SelectionProvider>
              </ToolProvider>
            </MapProvider>
          </ThemeConfig>
        </MapToolsProvider>
      </MainContextProvider>
    </>
  );
}
