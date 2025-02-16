// Path: shared\components\AppBar.tsx
import MapIcon from '@mui/icons-material/Map';
import MenuIcon from '@mui/icons-material/Menu';
import Terrain from '@mui/icons-material/Terrain';
import { List, ListItem, ListItemIcon } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '20px',
  cursor: 'pointer',
  padding: theme.spacing(0.5, 1),
  minWidth: '80px',
  '& .MuiListItemIcon-root': {
    minWidth: '30px',
  },
}));

const NavButtonContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.ebgeo.dark,
  borderRadius: '20px',
  padding: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  height: '40px',
}));

interface NavButtonProps {
  item: {
    path: string;
    label: string;
    icon: React.ReactElement;
    isSelected: boolean;
  };
  onClick: () => void;
}

function NavButton({ item, onClick }: NavButtonProps) {
  const theme = useTheme();

  return (
    <StyledListItem
      sx={{
        backgroundColor: item.isSelected
          ? theme.palette.ebgeo.main
          : theme.palette.ebgeo.dark,
        color: theme.palette.ebgeo.contrastText,
        '&:hover': {
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
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        {item.label}
      </Typography>
    </StyledListItem>
  );
}

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  minHeight: '80px',
  justifyContent: 'center',
  alignContent: 'center',
  [theme.breakpoints.down(267)]: {
    flexDirection: 'column',
  },
}));

const LogoAndButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  justifyContent: 'center',
  alignContent: 'center',
  [theme.breakpoints.down(377)]: {
    textAlign: 'center',
    flexDirection: 'column',
    paddingBottom: '10px',
  },
}));

interface AppBarProps {
  children: ReactNode;
  onDrawer?: () => void;
}

export function AppBar({ children, onDrawer }: AppBarProps) {
  const theme = useTheme();
  const isDown574 = useMediaQuery(theme.breakpoints.down(574));
  const isDown260 = useMediaQuery(theme.breakpoints.down(260));

  const { pathname } = useLocation();
  const [section, setSection] = useState('');
  const navigate = useNavigate();

  const navButtons = useMemo(
    () => [
      {
        path: 'map-sig',
        label: 'SIG',
        icon: <MapIcon />,
      },
      {
        path: 'map-3d',
        label: '3D',
        icon: <Terrain />,
      },
    ],
    [],
  );

  const handleClickNavButton = useCallback(
    (path: string) => navigate(path),
    [navigate],
  );

  const isButtonSelected = (label: string) => section === label;

  useEffect(() => {
    const found = navButtons.find(item =>
      pathname.match(new RegExp(item.path, 'g')),
    );
    setSection(found ? found.path : '');
  }, [pathname, navButtons]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <StyledAppBar
        sx={{
          boxShadow: 0,
          paddingBottom: isDown260 ? '20px' : '',
        }}
        position="fixed"
      >
        <ToolbarStyled>
          <LogoAndButtonsContainer>
            <Box sx={{ width: '100%' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                sx={{
                  mr: 2,
                  margin: isDown260 ? '0px' : '',
                  padding: '10px',
                }}
              >
                <Box
                  component="img"
                  src="/images/dsg_symbol.svg"
                  sx={{ width: isDown574 ? 25 : 30 }}
                />
                <Typography
                  sx={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    unicodeBidi: 'isolate',
                    paddingLeft: '10px',
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
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                {navButtons.map(item => (
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
            <Box sx={{ width: '100%' }} />
          </LogoAndButtonsContainer>
          {onDrawer && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawer}
              sx={{
                display: { sm: 'none' },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </ToolbarStyled>
      </StyledAppBar>
      <Main>{children}</Main>
    </Box>
  );
}
