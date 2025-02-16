// Path: mapSig\components\Layout\index.tsx
import { SwipeableDrawer } from '@mui/material';

import { type FC, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import { AppBar } from '@/shared/components/AppBar';

import { useMapSigStore } from '../../store';
import { DrawerContent } from '../DrawerContent';
import { MainStyle, RootStyle } from './styles';

interface LayoutProps {
  children?: ReactNode;
  hideDrawer?: boolean;
}

export const Layout: FC<LayoutProps> = ({ children, hideDrawer = false }) => {
  const { isDrawerOpen, setDrawerOpen } = useMapSigStore();

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  return (
    <RootStyle>
      <AppBar onDrawer={hideDrawer ? undefined : handleDrawerOpen}>
        <MainStyle>{children ?? <Outlet />}</MainStyle>

        {!hideDrawer && (
          <SwipeableDrawer
            anchor="right"
            open={isDrawerOpen}
            onClose={handleDrawerClose}
            onOpen={handleDrawerOpen}
            ModalProps={{
              keepMounted: true, // Melhor performance ao abrir/fechar
            }}
            sx={{
              display: { sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 250,
              },
            }}
          >
            <DrawerContent onClose={handleDrawerClose} />
          </SwipeableDrawer>
        )}
      </AppBar>
    </RootStyle>
  );
};
