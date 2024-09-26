import { Suspense, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ThemeConfig from "./theme";
import MainContextProvider from "./contexts/MainContext";
import Loading from "./components/Loading";
import { useLayout } from "./layouts";
import Drawer from "./layouts/Drawer";
import routeMapSIG from "./MapSIG";
import routeMap3D from "./Map3D";
import "./App.css";

const LayoutSIG = useLayout(Drawer);
const Layout3D = useLayout(Drawer);

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        element: <LayoutSIG />,
        ...routeMapSIG,
      },
      {
        element: <Layout3D />,
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
        <ThemeConfig>
          <Suspense fallback={<Loading />}>
            <RouterProvider router={router} />
          </Suspense>
        </ThemeConfig>
      </MainContextProvider>
    </>
  );
}
