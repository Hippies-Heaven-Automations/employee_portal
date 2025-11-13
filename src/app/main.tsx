import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import "@/app/index.css";
import { Toaster } from "react-hot-toast";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/app/theme";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <App />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#1e293b",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            padding: "0.75rem 1rem",
          },
          success: { iconTheme: { primary: "#15803d", secondary: "#fff" } },
          error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
        }}
      />
    </ThemeProvider>
  </React.StrictMode>
);
