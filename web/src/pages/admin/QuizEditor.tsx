import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface QuizRecord {
  id: string;
  training_id: string;
  version: number;
  is_active: boolean;
  content: any;
}

interface Training {
  id: string;
  title: string;
}

export default function QuizEditor() {
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizRecord | null>(null);
  const [jsonContent, setJsonContent] = useState("");
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 🧭 Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) {
        setError("No user session found.");
        setLoading(false);
        return;
      }

      // Check role in profiles table
      const { data: profile, error: roleError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (roleError) {
        setError("Failed to verify role.");
        setLoading(false);
        return;
      }

      if (profile?.role === "admin") setIsAdmin(true);
      else setError("Access denied: Admins only.");

      setLoading(false);
    };

    checkAdmin();
  }, []);

  // 🧾 Fetch trainings and quizzes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trainRes, quizRes] = await Promise.all([
          supabase.from("trainings").select("id, title").order("title"),
          supabase
            .from("training_quizzes")
            .select("id, training_id, version, is_active, content")
            .order("training_id"),
        ]);
        if (trainRes.error) throw trainRes.error;
        if (quizRes.error) throw quizRes.error;
        setTrainings(trainRes.data || []);
        setQuizzes(quizRes.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchData();
  }, [isAdmin]);

  // ✏️ Edit handler
  const handleEdit = (quiz: QuizRecord) => {
    setSelectedQuiz(quiz);
    setJsonContent(JSON.stringify(quiz.content, null, 2));
  };

  // 💾 Save updates
  const handleSave = async () => {
    if (!selectedQuiz) return;
    try {
      setSaving(true);
      const parsed = JSON.parse(jsonContent);
      const { error } = await supabase
        .from("training_quizzes")
        .update({ content: parsed, version: selectedQuiz.version })
        .eq("id", selectedQuiz.id);
      if (error) throw error;
      alert("Quiz updated successfully.");
      setSelectedQuiz(null);
      setJsonContent("");
      // Refresh
      const { data: updated } = await supabase
        .from("training_quizzes")
        .select("id, training_id, version, is_active, content")
        .order("training_id");
      setQuizzes(updated || []);
    } catch (err: any) {
      alert("Error saving quiz: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ➕ Add new quiz
  const handleAddNew = async () => {
    if (!selectedTrainingId) return alert("Select a training first.");
    try {
      setSaving(true);
      const blankQuiz = [
        {
          question: "Sample Question?",
          choices: ["Option A", "Option B", "Option C"],
          answer: "Option A",
        },
      ];
      const { error } = await supabase.from("training_quizzes").insert({
        training_id: selectedTrainingId,
        version: 1,
        content: blankQuiz,
        is_active: true,
      });
      if (error) throw error;
      alert("New quiz created successfully.");
      const { data: updated } = await supabase
        .from("training_quizzes")
        .select("id, training_id, version, is_active, content")
        .order("training_id");
      setQuizzes(updated || []);
    } catch (err: any) {
      alert("Error adding quiz: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-600">
        Loading quizzes...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        ⚠️ {error}
      </div>
    );

  if (!isAdmin)
    return (
      <div className="p-4 text-center text-gray-700">
        Access denied.
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        Admin Quiz Editor
      </h1>

      {/* Add new quiz */}
      <div className="mb-6 rounded-md border border-gray-200 p-4">
        <h2 className="mb-2 text-lg font-semibold text-gray-700">
          ➕ Add New Quiz
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="rounded-md border border-gray-300 p-2 text-sm"
            value={selectedTrainingId}
            onChange={(e) => setSelectedTrainingId(e.target.value)}
          >
            <option value="">Select Training</option>
            {trainings.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddNew}
            disabled={saving}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </div>

      {/* List existing quizzes */}
      <table className="mb-6 w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b p-2 text-left">Training ID</th>
            <th className="border-b p-2 text-left">Version</th>
            <th className="border-b p-2 text-left">Active</th>
            <th className="border-b p-2"></th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz) => (
            <tr key={quiz.id} className="hover:bg-gray-50">
              <td className="border-b p-2 font-mono text-xs">
                {quiz.training_id}
              </td>
              <td className="border-b p-2">{quiz.version}</td>
              <td className="border-b p-2">
                {quiz.is_active ? "✅" : "❌"}
              </td>
              <td className="border-b p-2 text-right">
                <button
                  onClick={() => handleEdit(quiz)}
                  className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit section */}
      {selectedQuiz && (
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            Editing Quiz: {selectedQuiz.training_id} (v{selectedQuiz.version})
          </h2>
          <textarea
            className="w-full rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            rows={12}
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
          />
          <div className="mt-3 flex justify-end gap-3">
            <button
              onClick={() => setSelectedQuiz(null)}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
