import { FC, ReactNode, useMemo } from "react";
import { CssBaseline } from "@mui/material";
import {
  ThemeProvider,
  createTheme,
  StyledEngineProvider,
} from "@mui/material/styles";

declare module "@mui/material/styles" {
  // interface Palette {
  //   strongCyan: PaletteColor;
  // }
  // interface PaletteOptions {
  //   strongCyan: SimplePaletteColorOptions;
  // }
}

type Props = {
  children: ReactNode;
};

const ThemeConfig: FC<Props> = ({ children }) => {
  const themeOptions = useMemo(
    () => ({
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
