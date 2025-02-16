// Path: map3d\components\Layout\index.tsx
import { SwipeableDrawer } from '@mui/material';

import { type FC, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AppBar } from '@/shared/components/AppBar';

import { DrawerContent } from '../DrawerContent';
import { ToolbarContent } from '../ToolbarContent';
import { MainStyle, RootStyle } from './styles';

interface LayoutProps {
  hideDrawer?: boolean;
}

export const Layout: FC<LayoutProps> = ({ hideDrawer = false }) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  return (
    <RootStyle>
      <AppBar onDrawer={hideDrawer ? undefined : handleDrawerOpen}>
        <MainStyle>
          <Outlet />
        </MainStyle>

        {!hideDrawer && (
          <>
            <ToolbarContent />

            <SwipeableDrawer
              anchor="right"
              open={isDrawerOpen}
              onClose={handleDrawerClose}
              onOpen={handleDrawerOpen}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { sm: 'none' },
                '& .MuiDrawer-paper': {
                  width: 300,
                },
              }}
            >
              <DrawerContent onClose={handleDrawerClose} />
            </SwipeableDrawer>
          </>
        )}
      </AppBar>
    </RootStyle>
  );
};
