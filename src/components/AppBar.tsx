import { FC, useCallback, useEffect, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { List, ListItem, ListItemIcon } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import MapIcon from "@mui/icons-material/Map";
import Terrain from "@mui/icons-material/Terrain";

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
  backgroundColor: theme.palette.primary.main,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "20px",
  cursor: "pointer",
  padding: theme.spacing(0.5, 1),
  minWidth: "80px",
  "& .MuiListItemIcon-root": {
    minWidth: "30px", // Reduz o espaço do ícone
  },
}));

const NavButtonContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.ebgeo.dark,
  borderRadius: "20px",
  padding: theme.spacing(0.5),
  display: "flex",
  alignItems: "center",
  height: "40px",
}));

type NavButtonProps = {
  key: string;
  item: {
    path: string;
    label: string;
    icon: React.ReactElement;
    isSelected: boolean;
  };
  onClick: () => void;
};

const NavButton: FC<NavButtonProps> = ({ item, onClick }) => {
  const theme = useTheme();

  return (
    <StyledListItem
      sx={{
        backgroundColor: item.isSelected
          ? theme.palette.ebgeo.main
          : theme.palette.ebgeo.dark,
        color: theme.palette.ebgeo.contrastText,
        "&:hover": {
          backgroundColor: theme.palette.ebgeo.main,
        },
      }}
      onClick={onClick}
    >
      <ListItemIcon
        sx={{ color: theme.palette.ebgeo.contrastText, minWidth: 40 }}
      >
        {item.icon}
      </ListItemIcon>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {item.label}
      </Typography>
    </StyledListItem>
  );
};

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  minHeight: "80px",
  justifyContent: "center",
  alignContent: "center",
  [theme.breakpoints.down(267)]: {
    flexDirection: "column",
  },
}));

const LogoAndButtonsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  justifyContent: "center",
  alignContent: "center",
  [theme.breakpoints.down(377)]: {
    textAlign: "center",
    flexDirection: "column",
    paddingBottom: "10px",
  },
}));

type Props = {
  children: any;
  onDrawer?: () => void;
};

const AppDrawer: FC<Props> = ({ children, onDrawer }) => {
  const theme = useTheme();
  const isDown574 = useMediaQuery(theme.breakpoints.down(574));
  const isDown260 = useMediaQuery(theme.breakpoints.down(260));

  const { pathname } = useLocation();
  const [section, setSection] = useState("");
  const navigate = useNavigate();
  const [navButtons] = useState([
    {
      path: "map-sig",
      label: "SIG",
      icon: <MapIcon />,
    },
    {
      path: "map-3d",
      label: "3D",
      icon: <Terrain />,
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
        <ToolbarStyled>
          <LogoAndButtonsContainer>
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
                  src="/images/dsg_symbol.svg"
                  sx={{ width: isDown574 ? 25 : 30 }}
                />
                <Typography
                  sx={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    unicodeBidi: "isolate",
                    paddingLeft: "10px",
                  }}
                >
                  <span style={{ color: theme.palette.ebgeo.light }}>EB</span>
                  <span style={{ color: theme.palette.ebgeo.contrastText }}>
                    GEO
                  </span>
                </Typography>
              </IconButton>
            </Box>
            <NavButtonContainer>
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
            </NavButtonContainer>
            <Box sx={{ width: "100%" }}></Box>
          </LogoAndButtonsContainer>
          {onDrawer && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawer}
              sx={{
                display: { sm: "none" },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </ToolbarStyled>
      </AppBar>
      <Main>{children}</Main>
    </Box>
  );
};

export default AppDrawer;
