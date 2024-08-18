import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import './LoadingScreen.css';

const LoadingScreen = () => (
  <Box className="loading-background">
    <Box className="lds-ripple">
      <Box></Box>
      <Box></Box>
    </Box>
  </Box>
);

export default LoadingScreen;