import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { ThreeDRotation } from '@mui/icons-material';
import Model3DCatalog from './Model3DCatalog';
import { useMapTools } from './contexts/Map3DTools';

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
};

const Model3DCatalogButton: React.FC<Props> = ({ pos }) => {
  const [open, setOpen] = useState(false);
  const { addModel3D } = useMapTools();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          ...pos,
          position: 'absolute',
          backgroundColor: 'white',
          '&:hover': { backgroundColor: '#f0f0f0' },
        }}
      >
        <ThreeDRotation />
      </IconButton>
      <Model3DCatalog
        open={open}
        onClose={handleClose}
        onAddModel={addModel3D}
      />
    </>
  );
};

export default Model3DCatalogButton;