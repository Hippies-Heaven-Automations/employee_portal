import { useParams, Link } from "react-router-dom";
import Quiz from "../../components/quiz/Quiz";

export default function TrainingQuiz() {
  const { id } = useParams<{ id: string }>();

  if (!id)
    return (
      <div className="p-6 text-center text-red-600">
        ⚠️ Training ID is missing.
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Training Quiz</h1>
        <Link
          to="/employee-dashboard/training"
          className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
        >
          ← Back to Trainings
        </Link>
      </div>

      <Quiz trainingId={id} />
    </div>
  );
}
