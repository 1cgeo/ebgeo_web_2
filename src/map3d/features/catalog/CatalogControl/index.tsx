// Path: map3d\features\catalog\CatalogControl\index.tsx
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';

import { type FC } from 'react';

import { Tool } from '../../../components/Tool';
import { useMap3DToolState } from '../../../store';
import { Model3DCatalog } from '../Catalog';
import { ModelList } from '../ModelList';
import { useCatalog } from '../useCatalog';

// Pulse animation for the button
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(49, 87, 48, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(49, 87, 48, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(49, 87, 48, 0);
  }
`;

// Wrapper with conditional animation
const BlinkingWrapper = styled('div')<{ $isBlinking: boolean }>(
  ({ $isBlinking }) => ({
    display: 'inline-block',
    borderRadius: '50%',
    animation: $isBlinking ? `${pulseAnimation} 1.5s infinite` : 'none',
  }),
);

export const CatalogControl: FC = () => {
  const { isActive } = useMap3DToolState('catalog');
  const { isOpen, toggleCatalog, isBlinking } = useCatalog();

  return (
    <>
      <BlinkingWrapper $isBlinking={isBlinking}>
        <Tool
          id="catalog"
          image="/images/catalog.svg"
          tooltip="Catálogo de modelos 3D"
          active={isActive}
          onClick={toggleCatalog}
        />
      </BlinkingWrapper>

      {/* Related components */}
      <Model3DCatalog open={isOpen} onClose={toggleCatalog} />
      <ModelList />
    </>
  );
};
0;
