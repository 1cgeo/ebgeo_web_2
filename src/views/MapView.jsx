import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { useMapStore } from '../stores/mapStore';
import ResetNorthControl from '../components/MapControls/ResetNorthControl';
import 'maplibre-gl/dist/maplibre-gl.css';

function MapView() {
  const mapContainer = useRef(null);
  const { initializeMap, addLayers, cleanupMap } = useMapStore();

  useEffect(() => {    
    if (mapContainer.current) {
      const map = initializeMap(mapContainer.current);
      
      map.on('load', () => {
        addLayers();

        const resetNorthControl = new ResetNorthControl();
        map.addControl(resetNorthControl, 'top-right');
      });
    }

    return () => {
      cleanupMap();
    };
  }, [initializeMap, addLayers, cleanupMap]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)' }}>
      <Box ref={mapContainer} sx={{ width: '100%', height: '100%' }} />
    </Box>
  );
}

export default MapView;