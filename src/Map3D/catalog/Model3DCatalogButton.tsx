import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { ThreeDRotation } from '@mui/icons-material';
import Model3DCatalog from './Model3DCatalog';

type Props = {
  pos: { right?: number; top?: number; left?: number; bottom?: number };
  onAddModel: (model: any) => void;
};

const Model3DCatalogButton: React.FC<Props> = ({ pos, onAddModel }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddModelAndClose = (model: any) => {
    onAddModel(model);
    handleClose();
  };

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
        onAddModel={handleAddModelAndClose}
      />
    </>
  );
};

export default Model3DCatalogButton;