import { useParams } from "react-router-dom";
import Quiz from "../../components/quiz/Quiz";

export default function TrainingQuiz() {
  const { id } = useParams();
  if (!id) return <div className="p-6 text-center">Invalid training.</div>;
  return <Quiz trainingId={id} />;
}
