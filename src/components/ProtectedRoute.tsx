import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface ProtectedRouteProps {
  role?: "admin" | "employee";
  children: React.ReactNode;
}

export default function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAllowed(false);
        return;
      }

      const userId = session.user.id;

      // 🧠 Get role either from metadata or from profiles table
      let userRole = session.user.user_metadata?.role;

      if (!userRole) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) {
          console.warn("Failed to fetch profile role:", error.message);
        }

        userRole = profile?.role;
      }

      if (role && userRole !== role) {
        setAllowed(false);
      } else {
        setAllowed(true);
      }
    };

    checkAuth();
  }, [role]);

  if (allowed === null) return <p>Loading...</p>;
  if (!allowed) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
