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
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const userRole = session?.user?.user_metadata?.role;

      if (!session) {
        setAllowed(false);
        return;
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
