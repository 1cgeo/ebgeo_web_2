// Path: map3d\components\ToolbarContent\index.tsx
import { Box } from '@mui/material';

import { type FC } from 'react';

import { getFeatures } from '../../features/registry';
import { useMap3DStore } from '../../store';
import { ToolbarContainer } from './styles';

export const ToolbarContent: FC = () => {
  // Obtém apenas features que devem aparecer na toolbar
  const features = getFeatures({ showInToolbar: true });
  const { activeTool, models } = useMap3DStore();
  const hasModels = models.length > 0;

  return (
    <ToolbarContainer>
      {features.map(feature => {
        const FeatureComponent = feature.component;
        const isActive = activeTool === feature.id;

        return (
          <Box key={feature.id} sx={{ position: 'relative' }}>
            <FeatureComponent
              active={isActive}
              disabled={feature.requiresModel && !hasModels}
            />
          </Box>
        );
      })}
    </ToolbarContainer>
  );
};
