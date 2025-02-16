import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Providers } from './shared/components/Providers';
import { Loading } from './shared/components/Loading';
import routeMapSIG from './mapSig/routes';
import routeMap3D from './map3d/routes';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      routeMapSIG,
      routeMap3D,
    ],
  },
]);

export default function App() {
  return (
    <Providers>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </Providers>
  );
}