import { useState } from "react";
import { useNavigate } from "react-router-dom"; // or next/router if using Next
import { supabase } from "../lib/supabaseClient";
import { useSessionRedirect } from "../hooks/useSessionRedirect";

export default function LoginPage() {
  useSessionRedirect();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const user = data?.user;
    const role = user?.user_metadata?.role || "employee";

    // 🔁 Redirect based on role
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/employee-dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold text-purple-800 mb-6 text-center">
          Employee Portal Login
        </h1>

        {error && (
          <p className="text-red-500 bg-red-50 p-2 rounded-md mb-4">{error}</p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-gray-300 rounded-md p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
