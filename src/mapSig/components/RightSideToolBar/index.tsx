// Path: mapSig\components\RightSideToolBar\index.tsx
import { Box } from '@mui/material';

import { type FC } from 'react';

import { useMapSigFeatures } from '../../features/registry';
import { useMapSigStore } from '../../store';
import { ToolbarContainer } from './styles';

export const RightSideToolBar: FC = () => {
  const features = useMapSigFeatures({ showInToolbar: true });
  const map = useMapSigStore(state => state.map);

  // Se não houver mapa, não renderizamos a toolbar
  if (!map) return null;

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
