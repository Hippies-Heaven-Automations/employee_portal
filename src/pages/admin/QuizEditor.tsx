import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";
import { Edit3, FilePlus2, Search, ArrowUpDown } from "lucide-react";

interface Training {
  id: string;
  title: string;
}

interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
}

interface Quiz {
  id: string;
  training_id: string;
  version: number;
  is_active: boolean;
  content: QuizQuestion[];
  created_at: string;
  trainings?: { title: string };
}

export default function QuizEditor() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [newTrainingId, setNewTrainingId] = useState("");
  const [newQuizJSON, setNewQuizJSON] = useState("[]");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("id, title")
        .order("title");
      if (error) notifyError(`Error loading trainings: ${error.message}`);
      else setTrainings(data || []);
    };
    fetchTrainings();
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_quizzes")
        .select("*, trainings(title)")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setQuizzes(data || []);
      setLoading(false);
    };
    fetchQuizzes();
  }, []);

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setNewQuizJSON(JSON.stringify(quiz.content, null, 2));
    setNewTrainingId(quiz.training_id);
  };

  const handleSave = async () => {
    confirmAction("Save changes to this quiz?", async () => {
      try {
        const parsed = JSON.parse(newQuizJSON);
        const { error } = await supabase
          .from("training_quizzes")
          .update({ content: parsed })
          .eq("id", selectedQuiz?.id);
        if (error) throw error;
        notifySuccess("Quiz updated successfully.");
        setSelectedQuiz(null);
        window.location.reload();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        notifyError("Invalid JSON or failed update: " + message);
      }
    });
  };

  const handleAddNew = async () => {
    confirmAction("Add this new quiz?", async () => {
      try {
        const parsed = JSON.parse(newQuizJSON);
        const { error } = await supabase.from("training_quizzes").insert({
          training_id: newTrainingId,
          content: parsed,
          is_active: true,
        });
        if (error) throw error;
        notifySuccess("New quiz added successfully.");
        setNewQuizJSON("[]");
        setNewTrainingId("");
        window.location.reload();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        notifyError("Faild to add quiz " + message);
      }

    });
  };

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  const filtered = useMemo(() => {
    let f = quizzes;
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      f = f.filter((q) =>
        q.trainings?.title.toLowerCase().includes(lower)
      );
    }
    f = [...f].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    return f;
  }, [quizzes, searchTerm, sortOrder]);

  if (loading)
    return <div className="p-6 text-gray-600">Loading quizzes...</div>;
  if (error)
    return <div className="p-6 text-red-600">{error}</div>;

  return (
    <section className="animate-fadeInUp mx-auto max-w-6xl p-6 text-gray-700">
      <h1 className="mb-6 text-3xl font-bold text-hemp-forest">Quiz Editor</h1>

      {/* 🌿 Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by training title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
          />
        </div>
        <button
          onClick={toggleSortOrder}
          className="w-full sm:w-auto border border-hemp-green/60 text-hemp-forest hover:bg-hemp-green hover:text-white rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowUpDown size={18} />
          <span className="hidden sm:inline font-medium">
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </span>
        </button>
      </div>

      {/* 🌿 Table (Desktop) */}
      <div className="hidden md:block bg-white border border-hemp-sage rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
            <tr>
              <th className="p-3 text-left">Training</th>
              <th className="p-3 text-left">Version</th>
              <th className="p-3 text-center">Active</th>
              <th className="p-3 text-center">Created</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr
                key={q.id}
                className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition"
              >
                <td className="p-3">{q.trainings?.title || "—"}</td>
                <td className="p-3">{q.version}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      q.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {q.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {new Date(q.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleEdit(q)}
                    className="inline-flex items-center gap-1 rounded-md bg-hemp-green px-3 py-1 text-white hover:bg-hemp-forest transition text-sm font-medium"
                  >
                    <Edit3 size={14} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🌿 Cards (Mobile) */}
      <div className="block md:hidden divide-y divide-hemp-sage/40 bg-white border border-hemp-sage rounded-lg shadow-sm">
        {filtered.map((q) => (
          <div key={q.id} className="p-4">
            <h3 className="font-semibold text-hemp-forest">
              {q.trainings?.title || "Untitled"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Version: {q.version} •{" "}
              {q.is_active ? (
                <span className="text-green-700 font-medium">Active</span>
              ) : (
                <span className="text-gray-500">Inactive</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(q.created_at).toLocaleDateString()}
            </p>
            <button
              onClick={() => handleEdit(q)}
              className="mt-3 rounded bg-hemp-green px-3 py-1 text-white text-sm hover:bg-hemp-forest transition"
            >
              <Edit3 size={14} /> 
                    <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        ))}
      </div>

      {/* 🌿 Edit Panel */}
      {selectedQuiz && (
        <div className="mt-10 rounded-xl border border-hemp-sage bg-hemp-mist/30 p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-hemp-forest">
            ✏️ Editing Quiz — {selectedQuiz.trainings?.title}
          </h2>
          <textarea
            value={newQuizJSON}
            onChange={(e) => setNewQuizJSON(e.target.value)}
            className="h-72 w-full rounded-lg border border-hemp-sage bg-white p-3 font-mono text-sm focus:ring-2 focus:ring-hemp-green focus:outline-none"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setSelectedQuiz(null)}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-hemp-green px-4 py-2 text-sm font-semibold text-white hover:bg-hemp-forest transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* 🌿 Add New Quiz */}
      <div className="mt-10 rounded-xl border border-hemp-sage bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-hemp-forest flex items-center gap-2">
          <FilePlus2 size={18} />
          Add New Quiz
        </h2>

        <label className="mb-1 block text-sm text-gray-600">Training</label>
        <select
          value={newTrainingId}
          onChange={(e) => setNewTrainingId(e.target.value)}
          className="mb-3 w-full rounded-lg border border-hemp-sage bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-hemp-green"
        >
          <option value="">-- Select Training --</option>
          {trainings.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm text-gray-600">Quiz JSON</label>
        <textarea
          value={newQuizJSON}
          onChange={(e) => setNewQuizJSON(e.target.value)}
          placeholder='[{"question": "Sample?", "choices": ["A","B"], "answer": "A"}]'
          className="h-56 w-full rounded-lg border border-hemp-sage bg-white p-3 font-mono text-sm focus:ring-2 focus:ring-hemp-green"
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAddNew}
            disabled={!newTrainingId}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition ${
              newTrainingId
                ? "bg-hemp-green hover:bg-hemp-forest"
                : "cursor-not-allowed bg-gray-300"
            }`}
          >
            Add Quiz
          </button>
        </div>
      </div>
    </section>
  );
}
