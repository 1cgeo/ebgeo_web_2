// Path: map3d\components\Layout\index.tsx
import { SwipeableDrawer } from '@mui/material';

import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AppBar } from '@/shared/components/AppBar';

import { DrawerContent } from '../DrawerContent';
import { MainStyle, RootStyle } from './styles';

export function Layout() {
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleDrawerOpen = () => setOpenDrawer(true);
  const handleDrawerClose = () => setOpenDrawer(false);

  return (
    <RootStyle>
      <AppBar onDrawer={handleDrawerOpen}>
        <MainStyle>
          <Outlet />
        </MainStyle>

        <SwipeableDrawer
          anchor="right"
          open={openDrawer}
          onClose={handleDrawerClose}
          onOpen={handleDrawerOpen}
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
      </AppBar>
    </RootStyle>
  );
}
