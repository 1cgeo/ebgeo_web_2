import { Outlet } from "react-router-dom";
import { styled } from "@mui/material/styles";
import AppBar from "../../components/AppBar";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { useState } from "react";
import DrawerContent from "./DrawerContent";

const RootStyle = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100%",
  overflow: "hidden",
});

const MainStyle = styled("div")(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  minHeight: "100%",
  [theme.breakpoints.down(260)]: {
    paddingTop: 60,
  },
}));

export default function Layout() {
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);

  return (
    <RootStyle>
      {/* <AppBar onDrawer={() => setOpenDrawer(!openDrawer)}> */}
      <AppBar>
        <MainStyle>
          <Outlet />
        </MainStyle>
        <SwipeableDrawer
          anchor={"right"}
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          onOpen={() => setOpenDrawer(true)}
          sx={{
            display: {
              sm: "none",
            },
          }}
        >
          <DrawerContent onSelect={() => setOpenDrawer(false)} />
        </SwipeableDrawer>
      </AppBar>
    </RootStyle>
  );
}
