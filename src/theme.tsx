import { FC, ReactNode, useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {
  ThemeProvider,
  createTheme,
  StyledEngineProvider,
} from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    ebgeo: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
    };
  }
  interface PaletteOptions {
    ebgeo: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
    };
  }
}

type Props = {
  children: ReactNode;
};

const ThemeConfig: FC<Props> = ({ children }) => {
  const themeOptions = useMemo(
    () => ({
      palette: {
        primary: {
          main: "#315730",
        },
        ebgeo: {
          main: "#508D4E",
          dark: "#1d361c",
          light: "#69bd66",
          contrastText: "#ffffff",
        },
      },
      typography: {
        fontFamily: "'Time New Roman';",
      },
    }),
    []
  );

  const theme = createTheme(themeOptions);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeConfig;
