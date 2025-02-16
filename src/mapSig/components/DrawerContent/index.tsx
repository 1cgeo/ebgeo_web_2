// Path: mapSig\components\DrawerContent\index.tsx
import { Box, Button, Divider, Toolbar, Typography } from '@mui/material';

import { type FC } from 'react';

import { useMapSigFeatures } from '../../features/registry';
import { DrawerList, DrawerListItem } from './styles';

interface DrawerContentProps {
  onClose: () => void;
}

export const DrawerContent: FC<DrawerContentProps> = ({ onClose }) => {
  // Obtém apenas features que devem aparecer no drawer
  const features = useMapSigFeatures({ showInDrawer: true });

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
            <DrawerListItem key={feature.id} disablePadding>
              <Button
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
              </Button>
            </DrawerListItem>
          );
        })}
      </DrawerList>
    </Box>
  );
};
