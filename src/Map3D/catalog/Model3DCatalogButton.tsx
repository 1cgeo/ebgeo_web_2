import React, { useState } from 'react';
import Tool from '../tools/Tool';
import Model3DCatalog from './Model3DCatalog';
import { useMapTools } from '../contexts/Map3DTools';
import styled, { keyframes, css } from 'styled-components';

const enhancedBlinkAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
`;

const BlinkingWrapper = styled.div<{ $isBlinking: boolean }>`
  display: inline-block;
  border-radius: 50%;
  ${props => props.$isBlinking && css`
    animation: ${enhancedBlinkAnimation} 1.5s infinite;
  `}
`;

const Model3DCatalogButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { addModel, models } = useMapTools();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddModelAndClose = (model: any) => {
    addModel(model);
    handleClose();
  };

  const isBlinking = models.length === 0;

  return (
    <>
      <BlinkingWrapper $isBlinking={isBlinking}>
        <Tool
          image="/images/catalog.svg"
          active={true}
          inUse={open}
          onClick={handleOpen}
        />
      </BlinkingWrapper>
      <Model3DCatalog
        open={open}
        onClose={handleClose}
        onAddModel={handleAddModelAndClose}
      />
    </>
  );
};

export default Model3DCatalogButton;