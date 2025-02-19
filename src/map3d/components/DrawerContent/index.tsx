// Path: map3d\components\DrawerContent\index.tsx
import { Divider, ListItemButton, ListItemIcon, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';

import type { FC } from 'react';
import { useState } from 'react';

import { Model3DCatalog } from '../../features/catalog/Catalog';
import { useMap3DFeatures } from '../../features/registry';
import { DrawerItem, DrawerList, FeatureButton } from './styles';

const StyledIcon = styled('img')({
  width: 24,
  height: 24,
});

interface DrawerContentProps {
  onClose: () => void;
}

export const DrawerContent: FC<DrawerContentProps> = ({ onClose }) => {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const drawerFeatures = useMap3DFeatures({ showInDrawer: true });

  const handleCatalogClick = () => {
    setCatalogOpen(true);
    onClose(); // Fecha o drawer quando abre o catálogo
  };

  // Função para lidar com o clique em qualquer feature
  const handleFeatureClick = (id: string) => {
    if (id === 'catalog') {
      handleCatalogClick();
    } else {
      // Aqui poderia ser adicionada lógica para outras features no futuro
      onClose();
    }
  };

  return (
    <div>
      <Toolbar />
      <Divider />
      <DrawerList>
        {drawerFeatures.map(feature => (
          <DrawerItem key={feature.id} disablePadding>
            <ListItemButton onClick={() => handleFeatureClick(feature.id)}>
              <ListItemIcon>
                <StyledIcon
                  src={feature.image || '/images/default-icon.svg'}
                  alt={feature.name}
                />
              </ListItemIcon>
              <FeatureButton>{feature.name}</FeatureButton>
            </ListItemButton>
          </DrawerItem>
        ))}
      </DrawerList>
      <Model3DCatalog
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
      />
    </div>
  );
};
