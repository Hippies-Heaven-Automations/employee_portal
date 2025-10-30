import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
} from "@mui/material";
import type { QuizQuestion, QuizAnswersMap } from "./JobApplicationWizard";

export default function StepQuiz({
  questions,
  answers,
  setAnswer,
  onPrev,
  onNext,
}: {
  questions: QuizQuestion[];
  answers: QuizAnswersMap;
  setAnswer: (qId: string, choiceIdx: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [index, setIndex] = useState(0);
  const current = questions[index];

  const handleNextQuestion = () => {
    if (index < questions.length - 1) setIndex((i) => i + 1);
  };

  const handlePrevQuestion = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} color="#14532d" mb={1}>
        Hippies Heaven Employment Questionnaire
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Please answer honestly. You’ll proceed through each question one at a time.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 0,
          backgroundColor: "#ffffffcc",
          border: "1px solid #C7E3C7",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          mb: 3,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} color="#14532d" mb={2}>
          {index + 1}. {current.question}
        </Typography>

        <RadioGroup
          value={answers[current.id] ?? ""}
          onChange={(e) => setAnswer(current.id, Number(e.target.value))}
        >
          {current.choices.map((choice, idx) => (
            <FormControlLabel
              key={idx}
              value={idx}
              control={
                <Radio
                  sx={{
                    color: "#14532d",
                    "&.Mui-checked": { color: "#15803d" },
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ lineHeight: 1.4 }}
                >
                  {choice}
                </Typography>
              }
              sx={{
                alignItems: "flex-start",
                p: 1,
                m: 0,
                borderRadius: 0,
                border:
                  answers[current.id] === idx
                    ? "1px solid #15803d"
                    : "1px solid #C7E3C7",
                backgroundColor:
                  answers[current.id] === idx ? "#F0FDF4" : "#ffffff",
                "&:hover": {
                  backgroundColor:
                    answers[current.id] === idx ? "#F0FDF4" : "#FAFAFA",
                },
              }}
            />
          ))}
        </RadioGroup>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button
          variant="contained"
          onClick={index === 0 ? onPrev : handlePrevQuestion}
          sx={{
            bgcolor: "#E5E7EB",
            color: "#1e293b",
            px: 4,
            py: 1.5,
            fontWeight: 600,
            borderRadius: 0,
            textTransform: "none",
            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
            "&:hover": { bgcolor: "#D1D5DB" },
          }}
        >
          {index === 0 ? "Back" : "Previous"}
        </Button>

        {index < questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNextQuestion}
            disabled={answers[current.id] === undefined}
            sx={{
              bgcolor: "#15803d",
              color: "#ffffff",
              px: 5,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 0,
              textTransform: "none",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#14532d" },
              "&:disabled": { opacity: 0.6 },
            }}
          >
            Next Question
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onNext}
            disabled={!allAnswered}
            sx={{
              bgcolor: "#15803d",
              color: "#ffffff",
              px: 5,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 0,
              textTransform: "none",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#14532d" },
              "&:disabled": { opacity: 0.6 },
            }}
          >
            Finish Quiz
          </Button>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" align="center" mt={2}>
        Question {index + 1} of {questions.length}
      </Typography>
    </Box>
  );
}
