import React, { useState } from 'react';
import { Button, Slider, Typography, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { use3DStore } from '../../stores/3dStore';

const ViewshedControl = () => {
  const [viewsheds, setViewsheds] = useState([]);
  const { viewer } = use3DStore();
  
  const [viewModel, setViewModel] = useState({
    verticalAngle: 120,
    horizontalAngle: 150,
    distance: 10
  });

  const addViewshed = () => {
    if (!viewer) return;

    const viewshed = new Cesium.ViewShed3D({
      viewer,
      horizontalAngle: viewModel.horizontalAngle,
      verticalAngle: viewModel.verticalAngle,
      distance: viewModel.distance
    });

    setViewsheds(prev => [...prev, viewshed]);
  };

  const clearViewsheds = () => {
    viewsheds.forEach(viewshed => viewshed.destroy());
    setViewsheds([]);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 1, position: 'absolute', top: 16, right: 16 }}>
      <Typography variant="h6">Viewshed Control</Typography>
      <Typography>Vertical Angle</Typography>
      <Slider
        value={viewModel.verticalAngle}
        onChange={(e, newValue) => setViewModel(prev => ({ ...prev, verticalAngle: newValue }))}
        min={0}
        max={360}
      />
      <Typography>Horizontal Angle</Typography>
      <Slider
        value={viewModel.horizontalAngle}
        onChange={(e, newValue) => setViewModel(prev => ({ ...prev, horizontalAngle: newValue }))}
        min={0}
        max={360}
      />
      <Typography>Distance</Typography>
      <Slider
        value={viewModel.distance}
        onChange={(e, newValue) => setViewModel(prev => ({ ...prev, distance: newValue }))}
        min={0}
        max={100}
      />
      <Button onClick={addViewshed} startIcon={<VisibilityIcon />}>
        Add Viewshed
      </Button>
      <Button onClick={clearViewsheds}>Clear All</Button>
    </Box>
  );
};

export default ViewshedControl;