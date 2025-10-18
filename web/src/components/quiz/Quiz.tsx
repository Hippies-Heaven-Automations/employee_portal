import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface QuizProps {
  trainingId: string;
}

interface QuizQuestion {
  question: string;
  choices: string[];
  answer?: string;
}

export default function Quiz({ trainingId }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [version, setVersion] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  // Fetch quiz from Supabase
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("training_quizzes")
          .select("content, version")
          .eq("training_id", trainingId)
          .eq("is_active", true)
          .single();

        if (error) throw error;

        const quizContent: QuizQuestion[] = data?.content || [];
        const shuffled = [...quizContent].sort(() => Math.random() - 0.5);

        setQuestions(shuffled);
        setVersion(data.version);
        setAnswers(new Array(shuffled.length).fill(""));
      } catch (err: any) {
        console.error("Error loading quiz:", err);
        setError(err.message || "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    if (trainingId) fetchQuiz();
  }, [trainingId]);

  const handleChoice = (choice: string) => {
    if (finished) return; // disable after completion
    const updated = [...answers];
    updated[currentIndex] = choice;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    if (!userId || !version) {
      setError("Missing user session or quiz version.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Compute score
      let correctCount = 0;
      questions.forEach((q, i) => {
        if (answers[i] && answers[i] === q.answer) correctCount++;
      });
      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);

      // Call Supabase RPC
      const { error } = await supabase.rpc("record_quiz_result", {
        _employee_id: userId,
        _training_id: trainingId,
        _score: finalScore,
        _quiz_version: version,
      });

      if (error) throw error;

      setFinished(true);
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      setError(err.message || "Failed to submit quiz result.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-600">
        Loading quiz...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        ⚠️ {error}
      </div>
    );

  if (!questions.length)
    return (
      <div className="p-4 text-center text-gray-600">
        No quiz found for this training.
      </div>
    );

  const currentQuestion = questions[currentIndex];
  const selected = answers[currentIndex];

  return (
    <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow-md">
      {!finished && (
        <>
          <div className="mb-4 text-center text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </div>

          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            {currentQuestion.question}
          </h2>

          <ul className="space-y-2">
            {currentQuestion.choices.map((choice, i) => (
              <li
                key={i}
                onClick={() => handleChoice(choice)}
                className={`cursor-pointer rounded-md border p-3 text-sm ${
                  selected === choice
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-200 hover:bg-blue-50"
                }`}
              >
                {choice}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0 || submitting}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                currentIndex === 0 || submitting
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={submitting}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  submitting
                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  submitting
                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </>
      )}

      {finished && (
        <div className="text-center">
          <h2 className="mb-4 text-xl font-semibold text-green-700">
            🎉 Training Completed!
          </h2>
          <p className="text-gray-700">
            Your score:{" "}
            <span className="font-bold text-blue-600">{score}%</span>
          </p>
        </div>
      )}
    </div>
  );
}
