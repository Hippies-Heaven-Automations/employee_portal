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

interface DetailedAnswer {
  question: string;
  selected: string;
  correct: boolean;
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
  const [previousCompletion, setPreviousCompletion] = useState<{
    score: number;
    version: number;
  } | null>(null);

  // 🌿 Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  // 🌿 Fetch quiz + check previous attempt
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user already completed
        const { data: prev, error: prevErr } = await supabase
          .from("training_tracker")
          .select("quiz_score, quiz_version")
          .eq("employee_id", userId)
          .eq("training_id", trainingId)
          .maybeSingle();

        if (prevErr) throw prevErr;

        if (prev && prev.quiz_score !== null) {
          // ✅ User already finished this quiz
          setPreviousCompletion({
            score: prev.quiz_score,
            version: prev.quiz_version,
          });
          setFinished(true);
          setLoading(false);
          return;
        }

        // Otherwise, fetch the quiz
        const { data, error } = await supabase
          .from("training_quizzes")
          .select("*")
          .eq("training_id", trainingId)
          .eq("is_active", true)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError("No active quiz found for this training.");
          setQuestions([]);
          setVersion(null);
          return;
        }

        const quizContent: QuizQuestion[] = data.content || [];

        // Shuffle both questions and choices
        const randomized = quizContent
          .sort(() => Math.random() - 0.5)
          .map((q) => ({
            ...q,
            choices: [...q.choices].sort(() => Math.random() - 0.5),
          }));

        setQuestions(randomized);
        setVersion(data.version);
        setAnswers(new Array(randomized.length).fill(""));
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error loading quiz:", err.message);
          setError(err.message);
        } else {
          console.error("Unknown error:", err);
          setError("An unexpected error occurred.");
        }
      }
    };

    if (trainingId && userId) fetchQuiz();
  }, [trainingId, userId]);

  // 🌿 Handle choice
  const handleChoice = (choice: string) => {
    if (finished) return; // disable after completion
    const updated = [...answers];
    updated[currentIndex] = choice;
    setAnswers(updated);
  };

  // 🌿 Navigation
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 🌿 Submit quiz
  const handleSubmit = async () => {
    if (!userId || !version) {
      setError("Missing user session or quiz version.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let correctCount = 0;
      questions.forEach((q, i) => {
        if (answers[i] && answers[i] === q.answer) correctCount++;
      });

      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);

      const detailedAnswers: DetailedAnswer[] = questions.map((q, i) => ({
        question: q.question,
        selected: answers[i],
        correct: answers[i] === q.answer,
      }));

      const { error } = await supabase
        .from("training_tracker")
        .upsert(
          {
            employee_id: userId,
            training_id: trainingId,
            quiz_score: finalScore,
            quiz_version: version,
            completed_at: new Date().toISOString(),
            quiz_answers: detailedAnswers,
          },
          { onConflict: "employee_id,training_id" }
        );

      if (error) throw error;

      setFinished(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error loading quiz:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error:", err);
        setError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 🌿 Render states
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-600">
        Loading quiz...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600 space-y-3">
        ⚠️ {error}
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-hemp-green text-white px-4 py-2 text-sm font-medium hover:bg-hemp-forest"
        >
          Retry
        </button>
      </div>
    );

  if (!questions.length && !loading && !error)
    return (
      <div className="p-4 text-center text-gray-600">
        No active quiz is available for this training yet.
      </div>
    );

  // 🌿 Already completed (prevent retake)
  if (previousCompletion)
    return (
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md text-center">
        <h2 className="text-xl font-semibold text-hemp-green mb-2">
          ✅ Quiz already completed
        </h2>
        <p className="text-gray-700">
          Your previous score:{" "}
          <span className="font-bold text-hemp-forest">
            {previousCompletion.score}%
          </span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Version: {previousCompletion.version}
        </p>
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
                className={`cursor-pointer rounded-md border p-3 text-sm transition ${
                  selected === choice
                    ? "border-hemp-green bg-hemp-green/10"
                    : "border-gray-200 hover:bg-hemp-sage/40"
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
                  : "bg-hemp-sage text-hemp-forest hover:bg-hemp-sage/80"
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
                    : "bg-hemp-green text-white hover:bg-hemp-forest"
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
                    : "bg-hemp-green text-white hover:bg-hemp-forest"
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
          <h2 className="mb-4 text-xl font-semibold text-hemp-green">
            🎉 Training Completed!
          </h2>
          <p className="text-gray-700">
            Your score:{" "}
            <span className="font-bold text-hemp-forest">{score}%</span>
          </p>
        </div>
      )}
    </div>
  );
}
