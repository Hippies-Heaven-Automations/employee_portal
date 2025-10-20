import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export interface QuizQuestion {
  question: string;
  choices: string[];
  answer?: string;
}

interface UseQuizReturn {
  questions: QuizQuestion[];
  version: number | null;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedAnswers: string[];
  setSelectedAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  nextQuestion: () => void;
  prevQuestion: () => void;
  loading: boolean;
  error: string | null;
}

export function useQuiz(trainingId: string): UseQuizReturn {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [version, setVersion] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setSelectedAnswers(new Array(shuffled.length).fill(""));
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error loading quiz:", err.message);
          setError(err.message);
        } else {
          console.error("Unknown error:", err);
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (trainingId) fetchQuiz();
  }, [trainingId]);

  const nextQuestion = () => {
    setCurrentIndex((i) =>
      i < questions.length - 1 ? i + 1 : questions.length - 1
    );
  };

  const prevQuestion = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : 0));
  };

  return {
    questions,
    version,
    currentIndex,
    setCurrentIndex,
    selectedAnswers,
    setSelectedAnswers,
    nextQuestion,
    prevQuestion,
    loading,
    error,
  };
}

export default useQuiz;
