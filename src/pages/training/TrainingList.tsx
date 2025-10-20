import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { notifyError } from "../../utils/notify"; // ✅ keep consistent with others

interface Training {
  id: string;
  title: string;
  description: string;
  allowed_types: string[];
  requires_signature: boolean;
}

export default function TrainingList() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeType, setEmployeeType] = useState<string>("");

  useEffect(() => {
    const fetchTrainings = async (): Promise<void> => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("No active user session.");
        }

        // 🌿 Fetch employee type
        const { data: profile } = await supabase
          .from("profiles")
          .select("employee_type")
          .eq("id", user.id)
          .maybeSingle<{ employee_type: string }>();

        const type = profile?.employee_type ?? "VA";
        setEmployeeType(type);

        // 🌿 Fetch trainings allowed for this employee type
        const { data, error } = await supabase
          .from("trainings")
          .select("id, title, description, allowed_types, requires_signature")
          .contains("allowed_types", [type]);

        if (error) throw new Error(error.message);

        setTrainings(data ?? []);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load trainings.";
        setError(message);
        notifyError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  // 🌿 Loading State
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        <div className="animate-pulse text-hemp-forest/70 text-lg">
          Loading trainings...
        </div>
      </div>
    );
  }

  // 🌿 Error State
  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg max-w-3xl mx-auto">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <h1 className="mb-2 text-3xl font-bold text-hemp-forest">
        🎓 My Trainings
      </h1>
      <p className="text-sm text-hemp-forest/70 mb-6">
        Showing trainings available for your role:{" "}
        <span className="font-semibold text-hemp-green">{employeeType}</span>
      </p>

      {/* No Trainings */}
      {trainings.length === 0 ? (
        <div className="text-center text-hemp-forest/70 mt-10">
          <p className="text-lg">🌱 No trainings assigned for your role.</p>
          <p className="text-sm">Please check back later or contact HR.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {trainings.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-hemp-sage/40 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-hemp-forest mb-1">
                    {t.title}
                  </h2>
                  <p className="text-sm text-gray-600">{t.description}</p>
                </div>

                <div className="flex items-center gap-3 md:justify-end">
                  {t.requires_signature ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-700 px-2.5 py-1 text-xs font-medium">
                      📄 Signature Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-xs font-medium">
                      ✅ No Signature
                    </span>
                  )}

                  <Link
                    to={`/employee-dashboard/training/${t.id}`}
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
