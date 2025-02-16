// Path: map3d\routes.tsx
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

import { Layout } from '@/shared/components/Layout';

const Map3DView = lazy(() => import('./components/Map3DView'));

const routes: RouteObject = {
  path: 'map-3d',
  element: <Layout />,
  children: [
    {
      index: true,
      element: <Map3DView />,
    },
  ],
};

export default routes;
