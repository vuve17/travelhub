import { createTheme } from "@mui/material/styles";

const primaryColor = "#0070f3";
const secondaryColor = "#4FC3F7";

declare module "@mui/material/styles" {
  interface Palette {
    lightGrey: Palette["primary"];
  }

  interface PaletteOptions {
    lightGrey?: PaletteOptions["primary"];
  }
}

// Kreiranje "Light" teme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#172b4d",
    },
    lightGrey: {
      main: "#f0f0f0",
    },
    error: {
      main: "#d32f2f",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
    background: {
      default: "#121212",
      paper: "#1d1d1d",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    lightGrey: {
      main: "#2e2e2e",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});
