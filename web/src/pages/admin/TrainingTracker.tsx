import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface TrackerRow {
  employee_id: string;
  training_id: string;
  employee_name: string;
  training_title: string;
  quiz_score: number | null;
  quiz_version: number | null;
  completed_at: string | null;
  docu_signed_at: string | null;
  signature_data: string | null;
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
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<any[] | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TrackerRow | null>(null);


 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_tracker")
        .select(`
      employee_id,
    training_id,
    quiz_score,
    quiz_version,
    completed_at,
    docu_signed_at,
    signature_data,
    profiles ( full_name ),
    trainings ( title )
        `)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      const formatted =
        data?.map((row: any) => ({
          employee_id: row.employee_id,
    training_id: row.training_id,
    employee_name: row.profiles?.full_name || "Unknown",
    training_title: row.trainings?.title || "Untitled Training",
    quiz_score: row.quiz_score,
    quiz_version: row.quiz_version,
    completed_at: row.completed_at,
    docu_signed_at: row.docu_signed_at,
    signature_data: row.signature_data,
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
    <th className="p-3 text-center">Acknowledged</th>
    <th className="p-3 text-center">Signature</th>
    <th className="p-3 text-center">Completed</th>
    <th className="p-3 text-center">Action</th>
  </tr>
</thead>
<tbody>
  {filtered.map((r, idx) => (
    <tr key={idx} className="border-t hover:bg-gray-50">
      <td className="p-3">{r.employee_name}</td>
      <td className="p-3">{r.training_title}</td>
      <td className="p-3 text-center">{r.quiz_score ?? "—"}</td>
      <td className="p-3 text-center">{r.quiz_version ?? "—"}</td>
      <td className="p-3 text-center">
        {r.docu_signed_at
          ? new Date(r.docu_signed_at).toLocaleDateString()
          : "—"}
      </td>
      <td className="p-3 text-center">
  {r.signature_data ? (
    <button
      onClick={() => {
        // ✅ ensure non-null and handle both base64 or full data URLs
        const data = r.signature_data || "";
        const url = data.startsWith("data:")
          ? data
          : `data:image/png;base64,${data}`;
        const win = window.open();
        if (win)
          win.document.write(
            `<img src="${url}" style="max-width:100%;display:block;margin:auto;"/>`
          );
      }}
      className="text-blue-600 underline"
    >
      View
    </button>
  ) : (
    "—"
  )}
</td>

      <td className="p-3 text-center text-gray-600">
        {r.completed_at
          ? new Date(r.completed_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "—"}
      </td>
      <td className="p-3 text-center">
 {r.quiz_score ? (
  <button
    onClick={async () => {
      const { data, error } = await supabase
        .from("training_tracker")
        .select("quiz_answers")
        .eq("employee_id", r.employee_id)
        .eq("training_id", r.training_id)
        .maybeSingle();

      if (error) {
        alert("Failed to load answers: " + error.message);
        return;
      }

      if (!data?.quiz_answers) {
        alert("No quiz answers found for this record.");
        return;
      }

      setSelectedQuizAnswers(data.quiz_answers);
      setSelectedRecord(r); // ✅ store the clicked record
      setShowQuizModal(true);
    }}
    className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
  >
    View Answers
  </button>
) : (
  "—"
)}

</td>

    </tr>
  ))}
</tbody>

          </table>
         {showQuizModal && selectedQuizAnswers && selectedRecord && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6 shadow-lg">
      <h2 className="mb-2 text-xl font-semibold text-gray-800">
        Quiz Answers — {selectedRecord.employee_name}
      </h2>
      <p className="mb-4 text-gray-600">
        Training:{" "}
        <span className="font-medium">{selectedRecord.training_title}</span>
        <br />
        Score:{" "}
        <span className="font-medium text-blue-600">
          {selectedRecord.quiz_score ?? "—"}%
        </span>
      </p>

      <ul className="space-y-3">
        {selectedQuizAnswers.map((a, i) => (
          <li
            key={i}
            className={`rounded-md border p-3 ${
              a.correct
                ? "border-green-500 bg-green-50"
                : "border-red-400 bg-red-50"
            }`}
          >
            <p className="font-medium text-gray-800">{a.question}</p>
            <p className="text-sm text-gray-700">
              Selected:{" "}
              <span className="font-semibold">{a.selected || "—"}</span>
            </p>
            <p className="text-sm text-gray-600">
              {a.correct ? "✅ Correct" : "❌ Incorrect"}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-right">
        <button
          onClick={() => {
            setShowQuizModal(false);
            setSelectedRecord(null);
            setSelectedQuizAnswers(null);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


        </div>
      )}
    </div>
  );
}
