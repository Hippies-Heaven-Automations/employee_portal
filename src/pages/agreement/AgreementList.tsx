import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { notifyError } from "../../utils/notify";

interface Agreement {
  id: string;
  title: string;
  description: string | null;
  allowed_types: string[];
}

export default function AgreementList() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeType, setEmployeeType] = useState<string>("");

  useEffect(() => {
    const fetchAgreements = async (): Promise<void> => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw new Error("No active user session.");

        // 🌿 Fetch employee type
        const { data: profile } = await supabase
          .from("profiles")
          .select("employee_type")
          .eq("id", user.id)
          .maybeSingle<{ employee_type: string }>();

        const type = profile?.employee_type ?? "VA";
        setEmployeeType(type);

        // 🌿 Fetch agreements allowed for this employee type
        const { data, error } = await supabase
          .from("agreements")
          .select("id, title, description, allowed_types")
          .contains("allowed_types", [type])
          .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        setAgreements(data ?? []);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load agreements.";
        setError(msg);
        notifyError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchAgreements();
  }, []);

  // 🌿 Loading
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        <div className="animate-pulse text-hemp-forest/70 text-lg">
          Loading agreements...
        </div>
      </div>
    );

  // 🌿 Error
  if (error)
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg max-w-3xl mx-auto">
        ⚠️ {error}
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <h1 className="mb-2 text-3xl font-bold text-hemp-forest">🖋️ My Agreements</h1>
      <p className="text-sm text-hemp-forest/70 mb-6">
        Showing agreements available for your role:{" "}
        <span className="font-semibold text-hemp-green">{employeeType}</span>
      </p>

      {/* No Agreements */}
      {agreements.length === 0 ? (
        <div className="text-center text-hemp-forest/70 mt-10">
          <p className="text-lg">🌱 No agreements assigned for your role.</p>
          <p className="text-sm">Please check back later or contact HR.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {agreements.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-hemp-sage/40 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-hemp-forest mb-1">
                    {a.title}
                  </h2>
                  <p className="text-sm text-gray-600">{a.description}</p>
                </div>

                <div className="flex items-center gap-3 md:justify-end">
                  <Link
                    to={`/employee-dashboard/agreement/${a.id}`}
                    className="rounded-md bg-hemp-green hover:bg-hemp-forest text-white text-sm font-medium px-4 py-1.5 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
