// Path: map3d\components\RightSideToolBar\index.tsx
import { Box } from '@mui/material';

import { type FC } from 'react';

import { type Map3DFeature } from '../../features/registry';
import { ToolbarContainer } from './styles';

interface RightSideToolBarProps {
  features: Map3DFeature[];
  enabled: boolean;
}

export const RightSideToolBar: FC<RightSideToolBarProps> = ({
  features,
  enabled,
}) => {
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
        const isDisabled = feature.requiresModel && !enabled;

        return (
          <Box key={feature.id}>
            <FeatureComponent disabled={isDisabled} />
          </Box>
        );
      })}
    </ToolbarContainer>
  );
};
