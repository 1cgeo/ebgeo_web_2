// Path: shared\components\Layout.tsx
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { styled } from '@mui/material/styles';

import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AppBar } from './AppBar';

const RootStyle = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
  overflow: 'hidden',
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  [theme.breakpoints.down(260)]: {
    paddingTop: 60,
  },
}));

export function Layout() {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  return (
    <RootStyle>
      <AppBar onDrawer={() => setOpenDrawer(!openDrawer)}>
        <MainStyle>
          <Outlet />
        </MainStyle>
        <SwipeableDrawer
          anchor="right"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          onOpen={() => setOpenDrawer(true)}
          sx={{
            display: {
              sm: 'none',
            },
          }}
        >
          {/* Drawer content will be moved to respective features */}
        </SwipeableDrawer>
      </AppBar>
    </RootStyle>
  );
}
