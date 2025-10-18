import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function TrainingList() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrainings = async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("id, title, description");
      if (error) console.error(error);
      else setTrainings(data || []);
      setLoading(false);
    };
    fetchTrainings();
  }, []);

  if (loading)
    return <div className="p-6 text-center text-gray-600">Loading trainings...</div>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Training List</h1>
      {trainings.length === 0 ? (
        <p>No trainings found.</p>
      ) : (
        <ul className="space-y-4">
          {trainings.map((t) => (
            <li
              key={t.id}
              className="rounded-md border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-800">{t.title}</h2>
              <p className="text-gray-600 text-sm">{t.description}</p>
              <button
                onClick={() => navigate(`/employee-dashboard/training/${t.id}`)}
                className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                View Details
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
