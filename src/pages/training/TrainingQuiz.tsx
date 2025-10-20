import { useParams, Link } from "react-router-dom";
import Quiz from "../../components/quiz/Quiz";

export default function TrainingQuiz() {
  const { id } = useParams<{ id: string }>();

  // 🌿 Validate training ID
  if (!id)
    return (
      <div className="flex h-64 items-center justify-center text-red-600 font-medium">
        ⚠️ Training ID is missing or invalid.
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6 animate-fadeInUp">
      {/* 🌿 Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-hemp-forest flex items-center gap-2">
          📘 Training Quiz
        </h1>

        <Link
          to="/employee-dashboard/training"
          className="rounded-md bg-hemp-green hover:bg-hemp-forest text-white text-sm font-medium px-4 py-2 shadow-md transition-all duration-200"
        >
          ← Back to Trainings
        </Link>
      </div>

      {/* 🌿 Quiz Section */}
      <div className="rounded-xl bg-white border border-hemp-sage/40 shadow-sm p-6 hover:shadow-md transition-all duration-300">
        <Quiz trainingId={id} />
      </div>
    </div>
  );
}
