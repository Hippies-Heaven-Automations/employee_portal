import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface TrackerRow {
  employee_name: string;
  training_title: string;
  quiz_score: number | null;
  quiz_version: number | null;
  completed_at: string | null;
}

export default function TrainingTracker() {
  const [records, setRecords] = useState<TrackerRow[]>([]);
  const [filtered, setFiltered] = useState<TrackerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filter options
  const [employees, setEmployees] = useState<string[]>([]);
  const [trainings, setTrainings] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedTraining, setSelectedTraining] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("training_tracker")
          .select(`
            quiz_score,
            quiz_version,
            completed_at,
            profiles ( full_name ),
            trainings ( title )
          `)
          .order("completed_at", { ascending: false });

        if (error) throw error;

        const formatted =
          data?.map((row: any) => ({
            employee_name: row.profiles?.full_name || "Unknown",
            training_title: row.trainings?.title || "Untitled Training",
            quiz_score: row.quiz_score,
            quiz_version: row.quiz_version,
            completed_at: row.completed_at,
          })) || [];

        setRecords(formatted);
        setFiltered(formatted);

        // derive unique filter values
        const uniqueEmployees = Array.from(
          new Set(formatted.map((r) => r.employee_name))
        );
        const uniqueTrainings = Array.from(
          new Set(formatted.map((r) => r.training_title))
        );

        setEmployees(uniqueEmployees);
        setTrainings(uniqueTrainings);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch tracker records.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 Apply filters
  useEffect(() => {
    let results = [...records];

    if (selectedEmployee)
      results = results.filter((r) => r.employee_name === selectedEmployee);

    if (selectedTraining)
      results = results.filter((r) => r.training_title === selectedTraining);

    setFiltered(results);
  }, [selectedEmployee, selectedTraining, records]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-600">
        Loading training tracker...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        ⚠️ {error}
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Training Tracker</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Employee
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="mt-1 w-48 rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Employees</option>
            {employees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Training
          </label>
          <select
            value={selectedTraining}
            onChange={(e) => setSelectedTraining(e.target.value)}
            className="mt-1 w-48 rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Trainings</option>
            {trainings.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {(selectedEmployee || selectedTraining) && (
          <button
            onClick={() => {
              setSelectedEmployee("");
              setSelectedTraining("");
            }}
            className="mt-6 rounded-md bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-gray-600">No matching records found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Training</th>
                <th className="p-3 text-center">Score</th>
                <th className="p-3 text-center">Version</th>
                <th className="p-3 text-center">Completed At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.employee_name}</td>
                  <td className="p-3">{r.training_title}</td>
                  <td className="p-3 text-center">{r.quiz_score ?? "—"}</td>
                  <td className="p-3 text-center">{r.quiz_version ?? "—"}</td>
                  <td className="p-3 text-center text-gray-600">
                    {r.completed_at
                      ? new Date(r.completed_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
