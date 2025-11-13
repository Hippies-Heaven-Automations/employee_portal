import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    hempGreen: Palette["primary"];
    hempForest: Palette["primary"];
    hempCream: Palette["primary"];
    hempInk: Palette["primary"];
  }
  interface PaletteOptions {
    hempGreen?: PaletteOptions["primary"];
    hempForest?: PaletteOptions["primary"];
    hempCream?: PaletteOptions["primary"];
    hempInk?: PaletteOptions["primary"];
  }
}

export const theme = createTheme({
  palette: {
    mode: "light",
    hempGreen: { main: "#63A46C" },
    hempForest: { main: "#355E3B" },
    hempCream: { main: "#F9F7E8" },
    hempInk: { main: "#2E2E2E" },
    primary: { main: "#63A46C" },
    secondary: { main: "#355E3B" },
    background: {
      default: "#F9F7E8",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: `"Poppins", "Inter", "Helvetica", "Arial", sans-serif`,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "none",
          "&:hover": { boxShadow: "0 3px 6px rgba(0,0,0,0.1)" },
        },
      },
    },
  },
});
