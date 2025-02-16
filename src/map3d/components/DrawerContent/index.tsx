// Path: map3d\components\DrawerContent\index.tsx
import { Divider, Toolbar } from '@mui/material';

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
    <>
      <Toolbar />
      <Divider />
      <DrawerList>
        {features.map(feature => {
          const FeatureComponent = feature.component;
          return (
            <DrawerItem key={feature.id}>
              <FeatureButton
                startIcon={<FeatureComponent drawerMode />}
                onClick={onClose}
              >
                {feature.name}
              </FeatureButton>
            </DrawerItem>
          );
        })}
      </DrawerList>
    </>
  );
};
