// Path: App.tsx
import { Suspense } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import routeMap3D from './map3d/routes';
import routeMapSIG from './mapSig/routes';
import { Loading } from './shared/components/Loading';
import { Providers } from './shared/components/Providers';

const router = createBrowserRouter([
  {
    path: '/',
    children: [routeMapSIG, routeMap3D],
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
