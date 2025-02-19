// Path: map3d\components\DrawerContent\index.tsx
import { Box, Divider, Toolbar, Typography } from '@mui/material';

import { type FC } from 'react';

import { getFeatures } from '../../features/registry';
import { DrawerItem, DrawerList, FeatureButton } from './styles';

interface DrawerContentProps {
  onClose: () => void;
}

export const DrawerContent: FC<DrawerContentProps> = ({ onClose }) => {
  // Obtém apenas features que devem aparecer no drawer
  const features = getFeatures({ showInDrawer: true });

  return (
    <Box component="nav" aria-label="Ferramentas do mapa">
      <Toolbar>
        <Typography variant="h6" component="h2">
          Ferramentas
        </Typography>
      </Toolbar>

      <Divider />

      <DrawerList>
        {features.map(feature => {
          const FeatureComponent = feature.component;

          return (
            <DrawerItem key={feature.id} disablePadding>
              <FeatureButton
                component="div"
                fullWidth
                startIcon={<FeatureComponent drawerMode />}
                onClick={onClose}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body1">{feature.name}</Typography>
                  {feature.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {feature.description}
                    </Typography>
                  )}
                </Box>
              </FeatureButton>
            </DrawerItem>
          );
        })}
      </DrawerList>
    </Box>
  );
};
