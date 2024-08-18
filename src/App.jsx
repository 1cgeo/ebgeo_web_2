import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import theme from './styles/theme';
import TopBar from './components/TopBar/TopBar';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import MapView from './views/MapView';
import ThreeDView from './views/ThreeDView';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <TopBar />
            <Routes>
              <Route path="/" element={<MapView />} />
              <Route path="/3d" element={<ThreeDView />} />
            </Routes>
          </>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;