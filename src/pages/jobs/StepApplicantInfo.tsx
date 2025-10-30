// src/pages/jobs/StepApplicantInfo.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import type { ApplicantFormData } from "./JobApplicationWizard";

export default function StepApplicantInfo({
  value,
  onChange,
  onNext,
}: {
  value: ApplicantFormData;
  onChange: (next: ApplicantFormData) => void;
  onNext: () => void;
}) {
  const [touched, setTouched] = useState(false);

  const bannedPatterns = [
    "test@",
    "example@",
    "mailinator",
    "tempmail",
    "yopmail",
    "guerrillamail",
  ];

  const invalidEmail =
    !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.email || "") ||
    bannedPatterns.some((p) => value.email.toLowerCase().includes(p));

  const requiredMissing =
    !value.full_name || !value.email || !value.resume_url;

  const canContinue = !invalidEmail && !requiredMissing;

  function handleField(field: keyof ApplicantFormData, val: string) {
    onChange({
      ...value,
      [field]: val,
    });
  }

  function handleNext() {
    setTouched(true);
    if (canContinue) onNext();
  }

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight={600}
        color="#14532d"
        mb={3}
      >
        Applicant Information
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        }}
      >
        <TextField
          label="Full Name *"
          fullWidth
          required
          value={value.full_name}
          onChange={(e) => handleField("full_name", e.target.value)}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
              backgroundColor: "#ffffffcc",
              "& fieldset": { borderColor: "#A7D3A7" },
              "&:hover fieldset": { borderColor: "#15803d" },
              "&.Mui-focused fieldset": { borderColor: "#14532d" },
            },
          }}
        />

        <TextField
          label="Email *"
          type="email"
          fullWidth
          required
          value={value.email}
          onChange={(e) => handleField("email", e.target.value)}
          variant="outlined"
          error={touched && invalidEmail}
          helperText={
            touched && invalidEmail
              ? "Please enter a valid personal or business email."
              : ""
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
              backgroundColor: "#ffffffcc",
              "& fieldset": {
                borderColor: touched && invalidEmail ? "#dc2626" : "#A7D3A7",
              },
              "&:hover fieldset": {
                borderColor: touched && invalidEmail ? "#dc2626" : "#15803d",
              },
              "&.Mui-focused fieldset": {
                borderColor: touched && invalidEmail ? "#dc2626" : "#14532d",
              },
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <TextField
          label="Contact Number"
          fullWidth
          value={value.contact_number}
          onChange={(e) => handleField("contact_number", e.target.value)}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
              backgroundColor: "#ffffffcc",
              "& fieldset": { borderColor: "#A7D3A7" },
              "&:hover fieldset": { borderColor: "#15803d" },
              "&.Mui-focused fieldset": { borderColor: "#14532d" },
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <TextField
          label="Message or Cover Letter"
          fullWidth
          multiline
          minRows={5}
          value={value.message}
          onChange={(e) => handleField("message", e.target.value)}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
              backgroundColor: "#ffffffcc",
              "& fieldset": { borderColor: "#A7D3A7" },
              "&:hover fieldset": { borderColor: "#15803d" },
              "&.Mui-focused fieldset": { borderColor: "#14532d" },
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <TextField
          label="Resume Link (Google Drive, Dropbox, etc.) *"
          type="url"
          fullWidth
          required
          value={value.resume_url}
          onChange={(e) => handleField("resume_url", e.target.value)}
          variant="outlined"
          error={touched && !value.resume_url}
          helperText={
            touched && !value.resume_url
              ? "Resume link is required."
              : ""
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
              backgroundColor: "#ffffffcc",
              "& fieldset": {
                borderColor: touched && !value.resume_url ? "#dc2626" : "#A7D3A7",
              },
              "&:hover fieldset": {
                borderColor: touched && !value.resume_url ? "#dc2626" : "#15803d",
              },
              "&.Mui-focused fieldset": {
                borderColor: touched && !value.resume_url ? "#dc2626" : "#14532d",
              },
            },
          }}
        />
      </Box>

      {touched && !canContinue && (
        <Typography
          variant="body2"
          color="#dc2626"
          mt={1.5}
        >
          Please fill required fields and use a valid email.
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!canContinue}
          sx={{
            bgcolor: "#15803d",
            color: "#ffffff",
            px: 5,
            py: 1.5,
            borderRadius: 0,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            "&:hover": { bgcolor: "#14532d" },
            "&:disabled": { opacity: 0.6 },
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
