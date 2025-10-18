import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

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
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("No user logged in.");

        // fetch employee type
        const { data: profile } = await supabase
          .from("profiles")
          .select("employee_type")
          .eq("id", user.id)
          .single();

        const type = profile?.employee_type || "VA";
        setEmployeeType(type);

        const { data, error } = await supabase
          .from("trainings")
          .select("id, title, description, allowed_types, requires_signature")
          .contains("allowed_types", [type]);

        if (error) throw error;
        setTrainings(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-600">
        Loading trainings...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        ⚠️ {error}
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">My Trainings</h1>
      {trainings.length === 0 ? (
        <p className="text-gray-600">No trainings assigned for your role ({employeeType}).</p>
      ) : (
        <ul className="space-y-4">
          {trainings.map((t) => (
            <li
              key={t.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-800">{t.title}</h2>
              <p className="mb-3 text-sm text-gray-600">{t.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span>
                  {t.requires_signature ? (
                    <span className="text-yellow-600">📄 Signature Required</span>
                  ) : (
                    <span className="text-green-600">✅ No Signature</span>
                  )}
                </span>

                <Link
                  to={`/employee-dashboard/training/${t.id}`}
                  className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
