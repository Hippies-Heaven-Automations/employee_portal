import { createClient } from "@supabase/supabase-js";

// ⚠️ TEMPORARY for local testing only.
// NEVER deploy the service key to production or to a public repo.
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);
