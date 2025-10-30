import { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { ArrowLeft, Briefcase, Building2, Calendar } from "lucide-react";

interface JobOpening {
  id: string;
  title: string;
  description: string | null;
  employment_type: "VA" | "Store";
  status: "Open" | "Closed";
  created_at: string;
  updated_at: string;
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobOpening | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("job_openings")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading)
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
        <Typography>Loading job details...</Typography>
      </Box>
    );

  if (!job)
    return (
      <Typography
        align="center"
        sx={{ mt: 10, color: "text.secondary", fontStyle: "italic" }}
      >
        Job not found or has been removed.
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
      {/* Back Button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
          sx={{
            color: "#15803d",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 0, // 🔳 sharp
            "&:hover": { textDecoration: "underline", bgcolor: "transparent" },
          }}
        >
          Back to Job Openings
        </Button>
      </Box>

      {/* Job Header */}
      <Paper
        elevation={3}
        sx={{
          border: "1px solid #DDE7DD",
          p: 4,
          borderRadius: 0, // 🔳 no soft corners
          backgroundColor: "#ffffff",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h5" fontWeight={700} color="#14532d">
            {job.title}
          </Typography>

          {/* <Box
            sx={{
              borderRadius: 0, // 🔳 sharp badge
              px: 1.5,
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: 600,
              bgcolor:
                job.status === "Open" ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.15)",
              color: job.status === "Open" ? "#166534" : "#b91c1c",
              border: `1px solid ${
                job.status === "Open" ? "#86efac" : "#fecaca"
              }`,
            }}
          >
            {job.status}
          </Box> */}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
            color: "text.secondary",
            fontSize: "0.9rem",
            mb: 2,
          }}
        >
          {job.employment_type === "Store" ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Building2 size={16} color="#15803d" />
              <Typography>In-Store Position</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Briefcase size={16} color="#15803d" />
              <Typography>Virtual Assistant Position</Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Calendar size={16} color="#6b7280" />
            <Typography>
              Posted on{" "}
              {new Date(job.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#E5E5E5" }} />

        <Typography
          variant="body1"
          sx={{
            color: "#1e293b",
            whiteSpace: "pre-line",
            lineHeight: 1.7,
          }}
        >
          {job.description || "No description provided for this position."}
        </Typography>
      </Paper>

      {/* Apply Now */}
      {job.status === "Open" ? (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Button
            component={RouterLink}
            to={`/jobs/apply/${job.id}`}
            variant="contained"
            sx={{
              bgcolor: "#15803d",
              color: "#ffffff",
              fontWeight: 600,
              textTransform: "none",
              px: 5,
              py: 1.25,
              borderRadius: 0, // 🔳 no rounding
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#14532d" },
            }}
          >
            Apply Now
          </Button>
        </Box>
      ) : (
        <Typography
          align="center"
          sx={{
            mt: 4,
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          This job is no longer accepting applications.
        </Typography>
      )}
    </Box>
  );
}
