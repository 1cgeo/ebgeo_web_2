// Path: map3d\components\ToolbarContent\index.tsx
import { Box } from '@mui/material';

import { type FC } from 'react';

import { useFeatures } from '../../features/registry';
import { useMap3DStore } from '../../store';
import { ToolbarContainer } from './styles';

export const ToolbarContent: FC = () => {
  // Obtém apenas features que devem aparecer na toolbar
  const features = useFeatures({ showInToolbar: true });
  const { activeTool } = useMap3DStore();

  return (
    <ToolbarContainer>
      {features.map(feature => {
        const FeatureComponent = feature.component;
        const isActive = activeTool === feature.id;

        return (
          <Box key={feature.id} sx={{ position: 'relative' }}>
            <FeatureComponent
              active={isActive}
              isEnabled={feature.requiresModel ? hasModels : true}
            />
          </Box>
        );
      })}
    </ToolbarContainer>
  );
};
