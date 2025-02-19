// Path: map3d\components\RightSideToolBar\index.tsx
import { Box } from '@mui/material';

import { type FC } from 'react';

import { useMapsStore } from '@/shared/store/mapsStore';

import { useMap3DFeatures } from '../../features/registry';
import { ToolbarContainer } from './styles';

export const RightSideToolBar: FC = () => {
  const features = useMap3DFeatures({ showInToolbar: true });
  const cesiumMap = useMapsStore(state => state.cesiumMap);

  // Se não houver mapa, não renderizamos a toolbar
  if (!cesiumMap) return null;

  return (
    <ToolbarContainer
      sx={{
        display: {
          sm: 'flex',
          xs: 'none',
        },
      }}
    >
      {features.map(feature => {
        const FeatureComponent = feature.component;

        return (
          <Box
            key={feature.id}
            title={feature.description}
            sx={{ position: 'relative' }}
          >
            <FeatureComponent />
          </Box>
        );
      })}
    </ToolbarContainer>
  );
};
