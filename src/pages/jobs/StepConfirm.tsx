// src/pages/jobs/StepConfirm.tsx
import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import type { ApplicantFormData, AvailabilityData } from "./JobApplicationWizard";

function prettySlot(slot: string) {
  if (!slot) return "—";
  const [d, t] = slot.split("T");
  return `${d} at ${t?.slice(0, 5)} CT`;
}

export default function StepConfirm({
  applicant,
  availability,
  submitting,
  onPrev,
  onSubmit,
}: {
  applicant: ApplicantFormData;
  availability: AvailabilityData;
  submitting: boolean;
  onPrev: () => void;
  onSubmit: () => void;
}) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} color="#14532d" mb={1.5}>
        Review & Submit
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Please confirm your details. After you submit, we’ll send a confirmation email.
        Thank you for applying to Hippies Heaven Gift Shop.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 0,
          border: "1px solid #C7E3C7",
          backgroundColor: "#ffffffcc",
          p: 3,
          boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Applicant Info */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={700} color="#14532d">
            Applicant Info
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            Name: {applicant.full_name || "—"}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            Email: {applicant.email || "—"}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            Contact: {applicant.contact_number || "—"}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              wordBreak: "break-all", // ✅ breaks long links properly
              overflowWrap: "anywhere", // ✅ ensures wrapping even without spaces
            }}
          >
            Resume:{" "}
            {applicant.resume_url ? (
              <MuiLink
                href={applicant.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{
                  color: "#15803d",
                  wordBreak: "break-all",
                  overflowWrap: "anywhere",
                }}
              >
                {applicant.resume_url}
              </MuiLink>
            ) : (
              "—"
            )}
          </Typography>

          {applicant.message && (
            <Typography
              variant="body2"
              color="text.secondary"
              mt={1}
              sx={{ whiteSpace: "pre-line" }}
            >
              Message: {applicant.message}
            </Typography>
          )}
        </Box>

        {/* Availability */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={700} color="#14532d">
            Interview Availability (CT – Illinois)
          </Typography>
          {availability.slots.length > 0 ? (
            <Box component="ul" sx={{ pl: 3, mt: 0.5, color: "text.secondary" }}>
              {availability.slots.map((s, i) => (
                <li key={i}>
                  <Typography variant="body2">{prettySlot(s)}</Typography>
                </li>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No availability provided.
            </Typography>
          )}
        </Box>

        {/* Questionnaire */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="#14532d">
            Questionnaire
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your answers were recorded and will be reviewed internally.
            Your score will not be shown here.
          </Typography>
        </Box>
      </Paper>

      {/* Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="contained"
          disabled={submitting}
          onClick={onPrev}
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
          Back
        </Button>

        <Button
          variant="contained"
          disabled={submitting}
          onClick={onSubmit}
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
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {submitting && (
            <CircularProgress size={20} color="inherit" thickness={4} />
          )}
          {submitting ? "Submitting…" : "Submit Application"}
        </Button>
      </Box>
    </Box>
  );
}
