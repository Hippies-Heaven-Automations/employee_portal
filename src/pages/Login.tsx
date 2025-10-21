import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useSessionRedirect } from "../hooks/useSessionRedirect";
import { notifyError } from "../utils/notify";
import hhLogo from "../assets/hh-logo.png";

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
      // 🌿 Step 1: Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error("Login failed. Please try again.");

      // 🌿 Step 2: Fetch role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      const role = profile?.role || "employee";

      // 🌿 Step 3: Redirect based on role
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
    <section className="min-h-screen flex items-center justify-center bg-hemp-mist relative overflow-hidden">
      {/* 🌿 Background gradient / tie-dye swirl */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#C8EBC8_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#A7E3A7_0%,transparent_60%)] opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-hemp-cream/80 via-hemp-mist to-hemp-green/10"></div>

      {/* 🌈 Login Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-hemp-cream/70 backdrop-blur-md border border-hemp-sage rounded-2xl shadow-card p-8 animate-fadeInUp"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-15 h-15 rounded-full bg-white flex items-center justify-center shadow-md mb-3">
            <img src={hhLogo} alt="Hippies Heaven Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-hemp-forest">
            Employee Portal Login
          </h1>
          <p className="text-hemp-ink/70 text-sm mt-1">
            Welcome back to Hippies Heaven
          </p>
        </div>

        {error && (
          <p className="text-red-600 bg-red-50 border border-red-200 p-2 rounded-md mb-4 text-center text-sm">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:outline-none focus:ring-2 focus:ring-hemp-green bg-white/70 text-hemp-ink placeholder-hemp-ink/50"
            required
          />

          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:outline-none focus:ring-2 focus:ring-hemp-green bg-white/70 text-hemp-ink placeholder-hemp-ink/50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-hemp-green hover:bg-hemp-forest text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-card disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="mt-6 text-center text-hemp-ink/70 text-sm">
          Trouble signing in?{" "}
          <a
            href="mailto:hippiesheaven@gmail.com"
            className="text-hemp-green font-medium hover:underline"
          >
            Contact support
          </a>
        </p>
      </form>
    </section>
  );
}
