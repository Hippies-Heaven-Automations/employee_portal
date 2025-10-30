// src/pages/jobs/JobApplicationWizard.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { sendConfirmationEmail } from "../../api/sendConfirmation";
import { notifySuccess, notifyError } from "../../utils/notify";

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
  slots: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
}

export interface QuizAnswersMap {
  [questionId: string]: number;
}

export default function JobApplicationWizard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [job, setJob] = useState<JobOpening | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [applicant, setApplicant] = useState<ApplicantFormData>({
    full_name: "",
    email: "",
    contact_number: "",
    message: "",
    resume_url: "",
  });

  const [availability, setAvailability] = useState<AvailabilityData>({
    slots: ["", "", ""],
  });

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswersMap>({});

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

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  async function handleFinalSubmit() {
    if (!job) {
      notifyError("No job selected.");
      return;
    }

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
      notifyError("Please enter a valid personal or business email address.");
      return;
    }

    setSubmitting(true);
    try {
      const interview_schedules = availability.slots.filter(Boolean);
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
          quiz_answers,
          quiz_score,
        },
      ]);

      if (error) throw error;

      try {
        await sendConfirmationEmail({
          name: applicant.full_name,
          email: applicant.email,
          jobTitle: job.title,
        });
      } catch {
        notifyError("Application saved, but email confirmation failed to send.");
      }

      notifySuccess("Application submitted successfully!");
      setSubmitted(true);
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

  if (loadingJob)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          color: "text.secondary",
          gap: 1,
        }}
      >
        <CircularProgress size={22} />
        <Typography>Loading job info...</Typography>
      </Box>
    );

  if (!job)
    return (
      <Typography
        align="center"
        sx={{ mt: 10, color: "text.secondary", fontStyle: "italic" }}
      >
        Job not found or unavailable.
      </Typography>
    );

  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        py: 8,
        px: 2,
        background: `
          radial-gradient(circle at 20% 30%, #C8EBC8 0%, transparent 60%),
          radial-gradient(circle at 80% 70%, #A7E3A7 0%, transparent 60%)
        `,
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom right, #F7F8F2CC, #E6F4E6AA, #CFE9CF33)",
        },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 720,
          p: { xs: 4, sm: 6 },
          borderRadius: 0, // 🔳 Sharp edges
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255,255,255,0.85)",
          border: "1px solid #C7E3C7",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Button
            component={RouterLink}
            to="/jobs"
            startIcon={<ArrowLeft size={18} />}
            sx={{
              color: "#15803d",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 0,
              "&:hover": { textDecoration: "underline", bgcolor: "transparent" },
            }}
          >
            Back to Openings
          </Button>

          <Typography variant="h5" fontWeight={700} color="#14532d" mt={2}>
            Apply for {job.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Position Type:{" "}
            <strong>
              {job.employment_type === "VA" ? "Virtual Assistant" : "In-Store"}
            </strong>
          </Typography>
        </Box>

        {/* Animated Wizard Steps */}
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
              style={{ textAlign: "center" }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                color="#14532d"
                gutterBottom
              >
                Thank you for applying ✌
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                We received your application. If you're a good fit, we’ll reach
                out using the email you provided.
              </Typography>
              <Button
                onClick={() => navigate("/jobs")}
                sx={{
                  color: "#15803d",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 0,
                  "&:hover": { textDecoration: "underline", bgcolor: "transparent" },
                }}
              >
                Back to job listings
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Dots */}
        {!submitted && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 5 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 0, // 🔳 square progress boxes
                  backgroundColor: i === step ? "#15803d" : "#C7E3C7",
                  transition: "background-color 0.3s ease",
                }}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
