import { FC, useCallback, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { List, ListItem } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "openDrawer",
})(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  backgroundColor: "white",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const StyledListItem = styled(ListItem)(() => ({
  width: "60px",
  flexDirection: "row",
  justifyContent: "center",
  borderRadius: "3px",
  cursor: "pointer",
}));

type NavButtonProps = {
  key: string;
  item: {
    path: string;
    image: string;
    isSelected: boolean;
  };
  onClick: () => void;
};
const NavButton: FC<NavButtonProps> = ({ item, onClick }) => {
  return (
    <StyledListItem
      sx={{
        backgroundColor: item.isSelected ? "#508D4E" : "",
        "&:hover": {
          backgroundColor: item.isSelected ? "" : "#B4E380",
        },
      }}
      onClick={onClick}
    >
      <Box
        component="img"
        src={item.image}
        sx={{
          width: "40px",
        }}
      />
    </StyledListItem>
  );
};

type Props = {
  children: any;
};

const AppDrawer: FC<Props> = ({ children }) => {
  const theme = useTheme();
  const isDown574 = useMediaQuery(theme.breakpoints.down(574));
  const isDown260 = useMediaQuery(theme.breakpoints.down(260));
  const { pathname } = useLocation();
  const [section, setSection] = useState("");
  const navigate = useNavigate();
  const [navButtons] = useState([
    {
      path: "map-sig",
      image: "/images/icon-sig.svg",
    },
    {
      path: "map-3d",
      image: "/images/icon-3d.svg",
    },
  ]);

  const handleClickNavButton = useCallback(
    (path: string) => navigate(path),
    [navigate]
  );

  const isButtonSelected = (label: string) => section == label;

  useEffect(() => {
    let found = navButtons.find((item) => {
      let re = new RegExp(item.path, "g");
      return pathname.match(re);
    });
    setSection(found ? found.path : "");
  }, [pathname]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        sx={{
          boxShadow: 0,
          paddingBottom: isDown260 ? "20px" : "",
        }}
        position="fixed"
      >
        <Toolbar
          sx={{
            padding: "0px 10px 0px 10px !important",
            overflow: "auto",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              sx={{
                mr: 2,
                margin: isDown260 ? "0px" : "",
                padding: "10px",
              }}
            >
              <Box
                component="img"
                src="/images/dsg-symbol.svg"
                sx={{ width: isDown574 ? 40 : 50 }}
              />
              <Typography
                sx={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  unicodeBidi: "isolate",
                }}
              >
                <span style={{ color: "#80AF81" }}>EB</span>
                <span style={{ color: "black" }}>GEO</span>
              </Typography>
            </IconButton>
          </Box>
          <Box sx={{ width: "100%" }}>
            <List
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: 1,
              }}
            >
              {navButtons.map((item) => (
                <NavButton
                  key={item.path}
                  item={{
                    ...item,
                    isSelected: isButtonSelected(item.path),
                  }}
                  onClick={() => handleClickNavButton(item.path)}
                />
              ))}
            </List>
          </Box>
          <Box sx={{ width: "100%" }}></Box>
        </Toolbar>
      </AppBar>
      <Main>{children}</Main>
    </Box>
  );
};

export default AppDrawer;