import React from 'react';
import { Button, Box } from '@mui/material';

interface LoadModelsButtonProps {
  onClick: () => void;
}

const LoadModelsButton: React.FC<LoadModelsButtonProps> = ({ onClick }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={onClick}
        sx={{
          padding: '10px 20px',
          fontSize: '1.2rem',
        }}
      >
        Carregar modelos
      </Button>
    </Box>
  );
};

export default LoadModelsButton;