import React from "react";
import { Grid, TextField, Typography, MenuItem } from "@mui/material";
import { Employee } from "./types";

interface Props {
  formData: Omit<Employee, "id" | "created_at">;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isStoreEmployee: boolean;
}

export default function EmploymentDetailsSection({
  formData,
  handleChange,
  isStoreEmployee,
}: Props) {
  const sizeOptions = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

  // ✅ Default both sizes to "XXS" if not set
  const shirtValue = formData.shirt_size || "XXS";
  const hoodieValue = formData.hoodie_size || "XXS";

  return (
    <>
      <Typography
        variant="subtitle2"
        sx={{
          color: "#14532d",
          fontWeight: 600,
          mt: 4,
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        Employment Details
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Position / Title"
            name="position"
            value={formData.position || ""}
            onChange={handleChange}
            size="small"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Acronym"
            name="acronym"
            value={formData.acronym || ""}
            onChange={handleChange}
            size="small"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Nickname"
            name="nickname"
            value={formData.nickname || ""}
            onChange={handleChange}
            size="small"
          />
        </Grid>

        {isStoreEmployee && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={formData.start_date || ""}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Starting Pay Rate ($/hr)"
                name="pay_rate"
                type="number"
                value={formData.pay_rate?.toString() || ""}
                onChange={handleChange}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Shirt Size"
                name="shirt_size"
                value={shirtValue}
                onChange={handleChange}
                size="medium"
                InputLabelProps={{
                  shrink: true,
                  sx: { fontWeight: 600, fontSize: "1rem" },
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "1rem",
                    minHeight: "56px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                {sizeOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Hoodie Size"
                name="hoodie_size"
                value={hoodieValue}
                onChange={handleChange}
                size="medium"
                InputLabelProps={{
                  shrink: true,
                  sx: { fontWeight: 600, fontSize: "1rem" },
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "1rem",
                    minHeight: "56px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                {sizeOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
}
