import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, GraduationCap, X } from "lucide-react";
import { notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";
import toast from "react-hot-toast";


interface QuizAnswer {
  question: string;
  selected: string;
  correct: boolean;
}

interface TrackerRow {
  employee_id: string;
  training_id: string;
  employee_name: string;
  training_title: string;
  quiz_score: number | null;
  quiz_version: number | null;
  completed_at: string | null;
}

interface SummaryRow {
  employee_id: string;
  training_id: string;
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

  const [employees, setEmployees] = useState<string[]>([]);
  const [trainings, setTrainings] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedTraining, setSelectedTraining] = useState<string>("");

  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<QuizAnswer[] | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TrackerRow | null>(null);
  const FEATURES = {
    RETAKE_QUIZ: false, 
  };
  // 🌿 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("training_summary_secure")
          .select("*")
          .order("completed_at", { ascending: false });


        if (error) throw error;

        const formatted: TrackerRow[] =
          (data as SummaryRow[]).map((row) => ({
            employee_id: row.employee_id,
            training_id: row.training_id,
            employee_name: row.employee_name || "Unknown",
            training_title: row.training_title || "Untitled Training",
            quiz_score: row.quiz_score,
            quiz_version: row.quiz_version,
            completed_at: row.completed_at,
          })) || [];


        setRecords(formatted);
        setFiltered(formatted);
        setEmployees(Array.from(new Set(formatted.map((r) => r.employee_name))));
        setTrainings(Array.from(new Set(formatted.map((r) => r.training_title))));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch tracker records.";
        notifyError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔍 Filters
  useEffect(() => {
    let results = [...records];
    if (selectedEmployee)
      results = results.filter((r) => r.employee_name === selectedEmployee);
    if (selectedTraining)
      results = results.filter((r) => r.training_title === selectedTraining);
    setFiltered(results);
  }, [selectedEmployee, selectedTraining, records]);

  // ⏳ Loading
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        <Loader2 className="mr-2 animate-spin" /> Loading training tracker...
      </div>
    );

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest flex items-center gap-2 mb-2 sm:mb-0">
          <GraduationCap size={26} className="text-hemp-green" />
          Training Tracker
        </h1>
      </div>

      {/* 🌿 Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-semibold text-hemp-forest mb-1">
            Employee
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="rounded-lg border border-hemp-sage/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green"
          >
            <option value="">All Employees</option>
            {employees.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-hemp-forest mb-1">
            Training
          </label>
          <select
            value={selectedTraining}
            onChange={(e) => setSelectedTraining(e.target.value)}
            className="rounded-lg border border-hemp-sage/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green"
          >
            <option value="">All Trainings</option>
            {trainings.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {(selectedEmployee || selectedTraining) && (
          <button
            onClick={() => {
              setSelectedEmployee("");
              setSelectedTraining("");
            }}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 🌿 Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-gray-500 italic">
            No matching records found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Training</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-center">Version</th>
                  <th className="p-3 text-center">Completed</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition"
                  >
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
                    <td className="p-3 text-center">
                      {r.quiz_score ? (
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          {/* 🌿 View Answers */}
                          <button
                            onClick={async () => {
                              const { data, error } = await supabase
                                .from("training_tracker")
                                .select("quiz_answers")
                                .eq("employee_id", r.employee_id)
                                .eq("training_id", r.training_id)
                                .maybeSingle();

                              if (error) {
                                notifyError("Failed to load answers: " + error.message);
                                return;
                              }

                              if (!data?.quiz_answers) {
                                notifyError("No quiz answers found for this record.");
                                return;
                              }

                              setSelectedQuizAnswers(data.quiz_answers);
                              setSelectedRecord(r);
                              setShowQuizModal(true);
                            }}
                            className="rounded-md bg-hemp-green/10 px-3 py-1 text-xs font-semibold text-hemp-forest hover:bg-hemp-green/20 transition"
                          >
                            View Answers
                          </button>

                          {/* 🌿 Retake Quiz */}
                          {FEATURES.RETAKE_QUIZ && (
                            <button
                              onClick={() =>
                                confirmAction(
                                  `Allow ${r.employee_name} to retake "${r.training_title}"?`,
                                  async () => {
                                    console.log("🧩 Resetting quiz with:", {
                                      employee_id: r.employee_id,
                                      training_id: r.training_id,
                                    });

                                    const { error } = await supabase.rpc("admin_reset_quiz", {
                                      p_employee: r.employee_id,
                                      p_training: r.training_id,
                                    });
                                    if (error) {
                                      notifyError("Failed to reset quiz: " + error.message);
                                      return;
                                    }

                                    toast.success(`✅ ${r.employee_name} can now retake the quiz.`);
                                    // Optional: remove from local state
                                    const refreshed = records.filter(
                                      (rec) =>
                                        !(
                                          rec.employee_id === r.employee_id &&
                                          rec.training_id === r.training_id
                                        )
                                    );
                                    setRecords(refreshed);
                                    setFiltered(refreshed);
                                  },
                                  "Confirm Reset",
                                  "bg-red-600 hover:bg-red-700"
                                )
                              }
                              className="rounded-md bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-3 py-1 transition"
                            >
                              Retake Quiz
                            </button>
                          )} 
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌿 Modal for Quiz Answers */}
      {showQuizModal && selectedQuizAnswers && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white border border-hemp-sage rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-fadeInUp">
            <div className="flex justify-between items-center px-6 py-4 bg-hemp-sage/30 border-b border-hemp-sage/50">
              <h2 className="text-lg font-semibold text-hemp-forest">
                Quiz Answers — {selectedRecord.employee_name}
              </h2>
              <button
                onClick={() => {
                  setShowQuizModal(false);
                  setSelectedRecord(null);
                  setSelectedQuizAnswers(null);
                }}
                className="text-gray-600 hover:text-hemp-green transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4">
              <p className="text-gray-700 mb-3">
                <strong>Training:</strong> {selectedRecord.training_title}
                <br />
                <strong>Score:</strong>{" "}
                <span className="text-hemp-green font-medium">
                  {selectedRecord.quiz_score ?? "—"}%
                </span>
              </p>

              <ul className="space-y-3">
                {selectedQuizAnswers.map((a, i) => (
                  <li
                    key={i}
                    className={`rounded-lg border p-3 ${
                      a.correct
                        ? "border-green-400 bg-green-50"
                        : "border-red-400 bg-red-50"
                    }`}
                  >
                    <p className="font-medium text-gray-800">{a.question}</p>
                    <p className="text-sm text-gray-700">
                      Selected: <span className="font-semibold">{a.selected}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {a.correct ? "✅ Correct" : "❌ Incorrect"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end border-t border-hemp-sage/40 px-6 py-4">
              <button
                onClick={() => {
                  setShowQuizModal(false);
                  setSelectedRecord(null);
                  setSelectedQuizAnswers(null);
                }}
                className="bg-hemp-green hover:bg-hemp-forest text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
