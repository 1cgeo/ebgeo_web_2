import { type FC } from 'react';
import { Divider, Toolbar, Button } from '@mui/material';
import { useMapSigFeatures } from '../../features/registry';
import { DrawerList, DrawerListItem } from './styles';

interface DrawerContentProps {
  onSelect: () => void;
}

export const DrawerContent: FC<DrawerContentProps> = ({ onSelect }) => {
  const features = useMapSigFeatures({ showInDrawer: true });

  return (
    <div>
      <Toolbar />
      <Divider />
      <DrawerList>
        {features.map(feature => {
          const FeatureComponent = feature.component;
          return (
            <DrawerListItem key={feature.id} disablePadding>
              <Button
                component="label"
                startIcon={<FeatureComponent drawerMode />}
                onClick={onSelect}
              >
                {feature.name}
              </Button>
            </DrawerListItem>
          );
        })}
      </DrawerList>
    </div>
  );
};