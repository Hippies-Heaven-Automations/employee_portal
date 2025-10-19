import { useParams, Link } from "react-router-dom";
import Quiz from "../../components/quiz/Quiz";

export default function TrainingQuiz() {
  const { id } = useParams<{ id: string }>();

  if (!id)
    return (
      <div className="flex h-64 items-center justify-center text-red-600 font-medium">
        ⚠️ Training ID is missing or invalid.
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* 🌿 Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-hemp-forest flex items-center gap-2">
          📘 Training Quiz
        </h1>

        <Link
          to="/employee-dashboard/training"
          className="rounded-md bg-hemp-green px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hemp-forest transition"
        >
          ← Back to Trainings
        </Link>
      </div>

      {/* 🌿 Quiz Component */}
      <div className="rounded-xl bg-white p-6 shadow-md border border-hemp-sage/40">
        <Quiz trainingId={id} />
      </div>
    </div>
  );
}
