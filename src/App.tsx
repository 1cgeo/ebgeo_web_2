// Path: App.tsx

import React from 'react';
import { CssBaseline } from '@mui/material';
import { MapProvider } from './features/core-map/context/MapProvider';
import { MainPage } from './pages/Main.page';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <ErrorBoundary>
        <MapProvider>
          <MainPage />
        </MapProvider>
      </ErrorBoundary>
    </>
  );
};

export default App;