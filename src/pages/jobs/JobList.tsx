import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Box,
  CircularProgress,
  Container,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { Search, Briefcase, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface JobOpening {
  id: string;
  title: string;
  description: string | null;
  employment_type: "VA" | "Store";
  status: "Open" | "Closed";
  created_at: string;
}

export default function JobList() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [filtered, setFiltered] = useState<JobOpening[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "VA" | "Store">("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("job_openings")
          .select("*")
          .eq("status", "Open")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setJobs(data || []);
        setFiltered(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let filteredData = [...jobs];

    if (filterType !== "All") {
      filteredData = filteredData.filter(
        (j) => j.employment_type === filterType
      );
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      filteredData = filteredData.filter(
        (j) =>
          j.title.toLowerCase().includes(s) ||
          (j.description?.toLowerCase().includes(s) ?? false)
      );
    }

    setFiltered(filteredData);
  }, [search, filterType, jobs]);

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
        <Typography>Loading job openings...</Typography>
      </Box>
    );

  const vaJobs = filtered.filter((j) => j.employment_type === "VA");
  const storeJobs = filtered.filter((j) => j.employment_type === "Store");

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        fontWeight={700}
        align="center"
        gutterBottom
        sx={{ color: "#14532d" }}
      >
        Join Our Team 🌿
      </Typography>

      {/* Search + Filter Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search job title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#6b7280" />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 0, // 🔳 sharp edges
              "& fieldset": { borderColor: "#A7D3A7" },
              "&:hover fieldset": { borderColor: "#15803d" },
              "&.Mui-focused fieldset": { borderColor: "#14532d" },
            },
          }}
        />

        <Select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as "All" | "VA" | "Store")
          }
          sx={{
            minWidth: 160,
            borderRadius: 0, // 🔳 no rounding
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#A7D3A7" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#15803d",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#14532d",
            },
          }}
        >
          <MenuItem value="All">All Positions</MenuItem>
          <MenuItem value="VA">Virtual Assistant</MenuItem>
          <MenuItem value="Store">In-Store</MenuItem>
        </Select>
      </Box>

      {/* Store Jobs */}
      {storeJobs.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Building2 size={20} style={{ marginRight: 8, color: "#15803d" }} />
            <Typography variant="h6" fontWeight={600} color="#14532d">
              In-Store Positions
            </Typography>
          </Box>

          {storeJobs.map((job) => (
            <Paper
              key={job.id}
              elevation={3}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 0, // 🔳 sharp corners
                border: "1px solid #DDE7DD",
                backgroundColor: "#ffffff",
                transition: "0.25s",
                "&:hover": {
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                  borderColor: "#A7D3A7",
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: "#1e293b" }}
              >
                {job.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, mb: 2 }}
              >
                {job.description || "No description provided."}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  component={Link}
                  to={`/jobs/${job.id}`}
                  sx={{
                    color: "#15803d",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 0,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View Details →
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* VA Jobs */}
      {vaJobs.length > 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Briefcase size={20} style={{ marginRight: 8, color: "#15803d" }} />
            <Typography variant="h6" fontWeight={600} color="#14532d">
              Virtual Assistant Positions
            </Typography>
          </Box>

          {vaJobs.map((job) => (
            <Paper
              key={job.id}
              elevation={3}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 0, // 🔳 no soft edges
                border: "1px solid #DDE7DD",
                backgroundColor: "#ffffff",
                transition: "0.25s",
                "&:hover": {
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                  borderColor: "#A7D3A7",
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: "#1e293b" }}
              >
                {job.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, mb: 2 }}
              >
                {job.description || "No description provided."}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  component={Link}
                  to={`/jobs/${job.id}`}
                  sx={{
                    color: "#15803d",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 0,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View Details →
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* No results */}
      {filtered.length === 0 && (
        <Typography align="center" color="text.secondary" mt={8}>
          No job openings found.
        </Typography>
      )}
    </Container>
  );
}
