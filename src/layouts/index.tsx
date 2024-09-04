import { Outlet } from "react-router-dom";
import { styled } from "@mui/material/styles";

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

export function useLayout(Drawer: any) {
  return () => (
    <RootStyle>
      <Drawer>
        <MainStyle>
          <Outlet />
        </MainStyle>
      </Drawer>
    </RootStyle>
  );
}
