import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export const useSessionRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const role = session?.user?.user_metadata?.role;

      if (session) {
        if (role === "admin") navigate("/admin-dashboard");
        else navigate("/employee-dashboard");
      }
    };

    checkSession();
  }, [navigate]);
};
