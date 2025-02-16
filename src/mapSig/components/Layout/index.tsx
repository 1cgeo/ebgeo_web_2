import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { SwipeableDrawer } from '@mui/material';
import { AppBar } from '@/shared/components/AppBar';
import { DrawerContent } from '../DrawerContent';
import { useMapSigStore } from '../../store';

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
  const [openDrawer, setOpenDrawer] = useState(false);
  const tools = useMapSigStore(state => state.tools);

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
          <DrawerContent 
            tools={tools}
            onSelect={() => setOpenDrawer(false)}
          />
        </SwipeableDrawer>
      </AppBar>
    </RootStyle>
  );
}