// src/pages/jobs/StepAvailability.tsx
import React, { useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import type { AvailabilityData } from "./JobApplicationWizard";

export default function StepAvailability({
  value,
  onChange,
  onPrev,
  onNext,
}: {
  value: AvailabilityData;
  onChange: (next: AvailabilityData) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const minDate = tomorrow.toISOString().split("T")[0];
  const minTime = now.toTimeString().slice(0, 5);

  const slots = useMemo(
    () => (value.slots.length === 3 ? value.slots : ["", "", ""]),
    [value.slots]
  );

  const updateSlot = (idx: number, date: string, time: string) => {
    const next = [...slots];
    next[idx] =
      date && time ? `${date}T${time}:00` : date ? date : time ? time : "";
    onChange({ slots: next });
  };

  const getDate = (slot: string) => (slot.includes("T") ? slot.split("T")[0] : slot);
  const getTime = (slot: string) =>
    slot.includes("T") ? slot.split("T")[1].slice(0, 5) : "";

  const allFilled = slots.every((s) => s);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} color="#14532d" mb={1.5}>
        Preferred Interview Schedule
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        mb={3}
        fontStyle="italic"
      >
        All interview times are in Central Time (CT – Illinois).
      </Typography>

      <Box sx={{ display: "grid", gap: 2.5 }}>
        {[0, 1, 2].map((i) => (
          <Paper
            key={i}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 0,
              border: "1px solid #C7E3C7",
              backgroundColor: "#ffffffcc",
              boxShadow: "0 3px 6px rgba(0,0,0,0.05)",
            }}
          >
            {/* ✅ MUI v7 Grid syntax */}
            <Grid container columns={12} spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="#14532d"
                  mb={0.5}
                >
                  Date #{i + 1}
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  value={getDate(slots[i])}
                  inputProps={{ min: minDate }}
                  onChange={(e) =>
                    updateSlot(i, e.target.value, getTime(slots[i]))
                  }
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
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="#14532d"
                  mb={0.5}
                >
                  Time #{i + 1}
                </Typography>
                <TextField
                  type="time"
                  fullWidth
                  value={getTime(slots[i])}
                  inputProps={{ min: minTime }}
                  onChange={(e) =>
                    updateSlot(i, getDate(slots[i]), e.target.value)
                  }
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
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {!allFilled && (
        <Typography variant="body2" color="#dc2626" mt={2}>
          Please provide three possible interview windows.
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
        <Button
          variant="contained"
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
          onClick={onNext}
          disabled={!allFilled}
          sx={{
            bgcolor: "#15803d",
            color: "#ffffff",
            px: 6,
            py: 1.5,
            fontWeight: 600,
            borderRadius: 0,
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
