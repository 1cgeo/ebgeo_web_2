import React, { type FC } from 'react';
import { Box } from '@mui/material';
import { ToolbarContainer } from './styles';
import { useMapSigFeatures } from '../../features/registry';

export const RightSideToolBar: FC = () => {
  const features = useMapSigFeatures({ showInToolbar: true });

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
          <Box key={feature.id}>
            <FeatureComponent />
          </Box>
        );
      })}
    </ToolbarContainer>
  );
};