import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Training {
  id: string;
  title: string;
}

interface Quiz {
  id: string;
  training_id: string;
  version: number;
  is_active: boolean;
  content: any;
  created_at: string;
  trainings?: { title: string };
}

export default function QuizEditor() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [newTrainingId, setNewTrainingId] = useState<string>("");
  const [newQuizJSON, setNewQuizJSON] = useState<string>("[]");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch trainings
  useEffect(() => {
    const fetchTrainings = async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("id, title")
        .order("title");

      if (error) console.error(error);
      else setTrainings(data || []);
    };
    fetchTrainings();
  }, []);

  // fetch quizzes
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
    try {
      const parsed = JSON.parse(newQuizJSON);
      const { error } = await supabase
        .from("training_quizzes")
        .update({ content: parsed })
        .eq("id", selectedQuiz?.id);

      if (error) throw error;
      alert("Quiz updated!");
      setSelectedQuiz(null);
      window.location.reload();
    } catch (err: any) {
      alert("❌ Invalid JSON or failed update: " + err.message);
    }
  };

  const handleAddNew = async () => {
    try {
      const parsed = JSON.parse(newQuizJSON);
      const { error } = await supabase.from("training_quizzes").insert({
        training_id: newTrainingId,
        content: parsed,
        is_active: true,
      });
      if (error) throw error;
      alert("✅ New quiz added!");
      setNewQuizJSON("[]");
      setNewTrainingId("");
      window.location.reload();
    } catch (err: any) {
      alert("❌ Failed to add quiz: " + err.message);
    }
  };

  if (loading)
    return <div className="p-6 text-gray-600">Loading quizzes...</div>;

  if (error)
    return (
      <div className="p-6 text-red-600">⚠️ {error}</div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Quiz Editor (Admin)
      </h1>

      {/* Quizzes Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">Training Title</th>
              <th className="p-3">Version</th>
              <th className="p-3 text-center">Active</th>
              <th className="p-3 text-center">Created</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{q.trainings?.title || "—"}</td>
                <td className="p-3">{q.version}</td>
                <td className="p-3 text-center">
                  {q.is_active ? "✅" : "—"}
                </td>
                <td className="p-3 text-center">
                  {new Date(q.created_at).toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleEdit(q)}
                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {selectedQuiz && (
        <div className="mt-6 rounded-md border border-gray-300 bg-gray-50 p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            Editing Quiz ({selectedQuiz.trainings?.title})
          </h2>
          <textarea
            value={newQuizJSON}
            onChange={(e) => setNewQuizJSON(e.target.value)}
            className="h-64 w-full rounded border p-2 font-mono text-sm"
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setSelectedQuiz(null)}
              className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Add New Quiz */}
      <div className="mt-10 rounded-md border border-gray-300 bg-gray-50 p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-700">
          Add New Quiz
        </h2>

        <label className="mb-2 block text-sm text-gray-600">Training:</label>
        <select
          value={newTrainingId}
          onChange={(e) => setNewTrainingId(e.target.value)}
          className="mb-3 w-full rounded border p-2 text-sm"
        >
          <option value="">-- Select Training --</option>
          {trainings.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <label className="mb-2 block text-sm text-gray-600">Quiz JSON:</label>
        <textarea
          value={newQuizJSON}
          onChange={(e) => setNewQuizJSON(e.target.value)}
          className="h-48 w-full rounded border p-2 font-mono text-sm"
          placeholder='[{"question": "Sample?", "choices": ["A","B"], "answer": "A"}]'
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAddNew}
            disabled={!newTrainingId}
            className={`rounded px-4 py-2 text-sm text-white ${
              newTrainingId
                ? "bg-blue-600 hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-300"
            }`}
          >
            Add Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
