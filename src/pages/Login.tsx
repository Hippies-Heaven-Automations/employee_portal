import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useSessionRedirect } from "../hooks/useSessionRedirect";
import { notifyError } from "../utils/notify";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import hhLogo from "../assets/hh_careers_logo.png";

export default function LoginPage() {
  useSessionRedirect();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error("Login failed. Please try again.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      const role = profile?.role || "employee";

      if (role === "admin") navigate("/admin-dashboard");
      else navigate("/employee-dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error during login.";
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(circle at 20% 30%, #C8EBC8 0%, transparent 60%),
          radial-gradient(circle at 80% 70%, #A7E3A7 0%, transparent 60%)
        `,
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom right, #F7F8F2CC, #E6F4E6AA, #CFE9CF33)",
        },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 420,
          px: 5,
          py: 6,
          borderRadius: 0, // 🔳 No rounded corners
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255,255,255,0.9)",
          border: "1px solid #C7E3C7",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
        }}
        component="form"
        onSubmit={handleLogin}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 85,
              height: 85, 
              mx: "auto",
              mb: 2,
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #E5E5E5",
              borderRadius: "50%",
              boxShadow: 1,
            }}
          >
            <img
              src={hhLogo}
              alt="Hippies Heaven Logo"
              style={{ width: 70, height: 70, objectFit: "contain" }}
            />
          </Box>
          <Typography variant="h5" fontWeight={700} color="#14532d">
            Employee Portal Login
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Welcome back to Hippies Heaven
          </Typography>
        </Box>

        {error && (
          <Typography
            variant="body2"
            color="error"
            sx={{
              backgroundColor: "#FFE5E5",
              border: "1px solid #FCA5A5",
              borderRadius: 0, // 🔳 No rounding
              p: 1,
              mb: 2,
              textAlign: "center",
            }}
          >
            {error}
          </Typography>
        )}

        <TextField
          label="Email Address"
          type="email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0, // 🔳 Sharp edges
              bgcolor: "#ffffffcc",
              "& fieldset": { borderColor: "#A7D3A7" },
              "&:hover fieldset": { borderColor: "#15803d" },
              "&.Mui-focused fieldset": { borderColor: "#14532d" },
            },
          }}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0, // 🔳 Sharp edges
              bgcolor: "#ffffffcc",
              "& fieldset": { borderColor: "#A7D3A7" },
              "&:hover fieldset": { borderColor: "#15803d" },
              "&.Mui-focused fieldset": { borderColor: "#14532d" },
            },
          }}
        />

        <Button
          type="submit"
          fullWidth
          disabled={loading}
          variant="contained"
          sx={{
            mt: 3,
            bgcolor: "#15803d",
            color: "#ffffff",
            "&:hover": { bgcolor: "#14532d" },
            py: 1.5,
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 0, // 🔳 Square button
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
        </Button>

        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          mt={3}
        >
          Trouble signing in?{" "}
          <Typography
            component="a"
            href="mailto:hippiesheaven@gmail.com"
            sx={{
              color: "#15803d",
              fontWeight: 500,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Contact support
          </Typography>
        </Typography>
      </Paper>
    </Box>
  );
}
