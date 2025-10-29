// src/pages/jobs/StepQuiz.tsx
import React from "react";
import { Button } from "../../components/Button";
import type {
  QuizQuestion,
  QuizAnswersMap,
} from "./JobApplicationWizard";

export default function StepQuiz({
  questions,
  answers,
  setAnswer,
  canContinue,
  onPrev,
  onNext,
}: {
  questions: QuizQuestion[];
  answers: QuizAnswersMap;
  setAnswer: (qId: string, choiceIdx: number) => void;
  canContinue: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-hemp-forest font-semibold text-xl">
        Hippies Heaven Employment Questionnaire
      </h2>
      <p className="text-sm text-hemp-ink/80">
        Please answer honestly. Your responses help us understand
        how you handle real situations. You will not see your score.
      </p>

      <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="bg-white/70 border border-hemp-sage rounded-lg p-4"
          >
            <p className="font-medium text-hemp-forest mb-3">
              {qIndex + 1}. {q.question}
            </p>

            <div className="space-y-2">
              {q.choices.map((choice, idx) => {
                const inputId = `${q.id}_${idx}`;
                return (
                  <label
                    key={inputId}
                    htmlFor={inputId}
                    className={`flex items-start gap-3 p-2 rounded-md border cursor-pointer
                      ${
                        answers[q.id] === idx
                          ? "bg-hemp-green/10 border-hemp-green"
                          : "bg-white/60 border-hemp-sage hover:bg-white"
                      }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      className="mt-1 accent-hemp-green"
                      checked={answers[q.id] === idx}
                      onChange={() => setAnswer(q.id, idx)}
                    />
                    <span className="text-hemp-ink text-sm leading-snug">
                      {choice}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!canContinue && (
        <p className="text-sm text-red-600">
          Please answer all questions to continue.
        </p>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          className="bg-gray-200 text-hemp-ink font-semibold px-6 py-3 rounded-lg shadow-card hover:bg-gray-300"
          onClick={onPrev}
        >
          Back
        </Button>

        <Button
          type="button"
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold px-8 py-3 rounded-lg shadow-card transition-all duration-300 disabled:opacity-60"
          disabled={!canContinue}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
