// Path: mapSig\routes.tsx
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

import { Layout } from '@/shared/components/Layout';

const MapSIGView = lazy(() => import('./components/MapSIGView'));

const routes: RouteObject = {
  element: <Layout />,
  path: 'map-sig',
  children: [
    {
      index: true,
      element: <MapSIGView />,
    },
  ],
};

export default routes;
