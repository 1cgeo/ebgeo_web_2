// Path: shared\config\theme.ts
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
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

export const theme = createTheme({
  palette: {
    primary: {
      main: '#315730',
    },
    ebgeo: {
      main: '#508D4E',
      dark: '#1d361c',
      light: '#69bd66',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});
