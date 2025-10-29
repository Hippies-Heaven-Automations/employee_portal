// src/pages/jobs/JobApplicationWizard.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { sendConfirmationEmail } from "../../api/sendConfirmation";
import { notifySuccess, notifyError } from "../../utils/notify";
import { ArrowLeft, Loader2 } from "lucide-react";

import StepApplicantInfo from "./StepApplicantInfo";
import StepAvailability from "./StepAvailability";
import StepQuiz from "./StepQuiz";
import StepConfirm from "./StepConfirm";
import { getRandomizedQuiz } from "./quizData";

export interface JobOpening {
  id: string;
  title: string;
  description: string | null;
  employment_type: "VA" | "Store";
  status: "Open" | "Closed";
}

export interface ApplicantFormData {
  full_name: string;
  email: string;
  contact_number: string;
  message: string;
  resume_url: string;
}

export interface AvailabilityData {
  slots: string[]; // array of ISO-ish strings like "2025-10-30T14:00:00"
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
}

export interface QuizAnswersMap {
  [questionId: string]: number; // which choice index user picked
}

export default function JobApplicationWizard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // step: 0 info, 1 availability, 2 quiz, 3 confirm/submit
  const [step, setStep] = useState<number>(1);

  const [job, setJob] = useState<JobOpening | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false); // to show thank-you screen

  // phase data
  const [applicant, setApplicant] = useState<ApplicantFormData>({
    full_name: "",
    email: "",
    contact_number: "",
    message: "",
    resume_url: "",
  });

  const [availability, setAvailability] = useState<AvailabilityData>({
    slots: ["", "", ""], // up to 3
  });

  // quiz
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswersMap>({});

  // load job + quiz
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoadingJob(true);
        const { data, error } = await supabase
          .from("job_openings")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setJob(data as JobOpening);
      } catch (err) {
        console.error(err);
        notifyError("Job not found or no longer open.");
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
    setQuizQuestions(getRandomizedQuiz());
  }, [id]);

  // helpers
  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const allQuizAnswered = quizQuestions.every(
    (q) => quizAnswers[q.id] !== undefined
  );

  async function handleFinalSubmit() {
    if (!job) {
      notifyError("No job selected.");
      return;
    }

    // basic email validation like your current code
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    const bannedPatterns = [
      "test@",
      "example@",
      "mailinator",
      "tempmail",
      "yopmail",
      "guerrillamail",
    ];
    if (
      !emailRegex.test(applicant.email) ||
      bannedPatterns.some((p) =>
        applicant.email.toLowerCase().includes(p)
      )
    ) {
      notifyError(
        "Please enter a valid personal or business email address."
      );
      return;
    }

    setSubmitting(true);
    try {
      // build interview_schedules from availability.slots
      const interview_schedules = availability.slots
        .filter(Boolean); // non-empty only

      // build quiz payload for DB
      const quiz_answers = quizQuestions.map((q) => {
        const picked = quizAnswers[q.id];
        return {
          question: q.question,
          selected: q.choices[picked],
          correct: picked === q.correctIndex,
        };
      });

      const quiz_score = quiz_answers.reduce(
        (acc, ans) => acc + (ans.correct ? 1 : 0),
        0
      );

      // insert application
      const { error } = await supabase.from("applications").insert([
        {
          full_name: applicant.full_name,
          email: applicant.email,
          contact_number: applicant.contact_number,
          message: applicant.message,
          resume_url: applicant.resume_url,
          job_id: job.id,
          interview_schedules,
          status: "pending",

          // new columns:
          quiz_answers,
          quiz_score,
        },
      ]);

      if (error) throw error;

      // send confirmation email
      try {
        await sendConfirmationEmail({
          name: applicant.full_name,
          email: applicant.email,
          jobTitle: job.title,
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        notifyError(
          "Application saved, but email confirmation failed to send."
        );
      }

      notifySuccess("Application submitted successfully!");
      setSubmitted(true);
      // we stay on this page, show thank-you state instead of navigating away
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit your application. Please try again.";
      notifyError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingJob) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading job info...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center mt-20 text-gray-600">
        Job not found or unavailable.
      </div>
    );
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-hemp-mist overflow-hidden py-16 px-4">
      {/* background layers same vibe as your current form */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#C8EBC8_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#A7E3A7_0%,transparent_60%)] opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-hemp-cream/80 via-hemp-mist to-hemp-green/10"></div>

      <div className="relative z-10 w-full max-w-2xl bg-hemp-cream/70 backdrop-blur-md border border-hemp-sage rounded-2xl shadow-card p-8 sm:p-10">
        <div className="mb-6">
          <Link
            to="/jobs"
            className="text-hemp hover:underline flex items-center mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Openings
          </Link>

          <h1 className="text-3xl font-bold text-hemp-forest mb-1">
            Apply for {job.title}
          </h1>

          <p className="text-hemp-ink/80 mb-2">
            Position Type:{" "}
            <strong>
              {job.employment_type === "VA"
                ? "Virtual Assistant"
                : "In-Store"}
            </strong>
          </p>
        </div>

        {/* Wizard Steps with animation */}
        <AnimatePresence mode="wait" initial={false}>
            {!submitted ? (
                <motion.div
                key="wizard"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                >
                {step === 1 && (
                    <StepApplicantInfo
                    value={applicant}
                    onChange={setApplicant}
                    onNext={nextStep}
                    />
                )}
                {step === 2 && (
                    <StepAvailability
                    value={availability}
                    onChange={setAvailability}
                    onPrev={prevStep}
                    onNext={nextStep}
                    />
                )}
                {step === 3 && (
                    <StepQuiz
                    questions={quizQuestions}
                    answers={quizAnswers}
                    setAnswer={(qid, choiceIdx) =>
                        setQuizAnswers((prev) => ({ ...prev, [qid]: choiceIdx }))
                    }
                    canContinue={allQuizAnswered}
                    onPrev={prevStep}
                    onNext={nextStep}
                    />
                )}
                {step === 4 && (
                    <StepConfirm
                    applicant={applicant}
                    availability={availability}
                    submitting={submitting}
                    onPrev={prevStep}
                    onSubmit={handleFinalSubmit}
                    />
                )}
                </motion.div>
            ) : (
                <motion.div
                key="thankyou"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-center space-y-4"
                >
                <h2 className="text-2xl font-semibold text-hemp-forest">
                    Thank you for applying ✌
                </h2>
                <p className="text-hemp-ink/80">
                    We received your application. If you're a good fit, we’ll reach out using
                    the email you provided.
                </p>

                <button
                    className="text-hemp underline"
                    onClick={() => navigate("/jobs")}
                >
                    Back to job listings
                </button>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Progress indicator dots / steps */}
        {!submitted && (
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i === step
                    ? "bg-hemp-green"
                    : "bg-hemp-sage/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
