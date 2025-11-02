import React from "react";
import { Grid, TextField, Typography } from "@mui/material";
import { ShieldCheck } from "lucide-react";
import { Employee } from "./types";

interface Props {
  formData: Omit<Employee, "id" | "created_at">;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isStoreEmployee: boolean;
}

export default function PersonalInfoSection({
  formData,
  handleChange,
  isStoreEmployee,
}: Props) {
  return (
    <>
      <Typography
        variant="subtitle2"
        sx={{
          color: "#14532d",
          fontWeight: 600,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ShieldCheck size={14} />
        Personal Information
      </Typography>

      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            size="small"
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Contact Number"
            name="contact_number"
            value={formData.contact_number || ""}
            onChange={handleChange}
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Emergency Contact"
            name="emergency_contact"
            value={formData.emergency_contact || ""}
            onChange={handleChange}
            size="small"
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Emergency Contact Phone"
            name="emergency_contact_phone"
            value={formData.emergency_contact_phone || ""}
            onChange={handleChange}
            size="small"
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            size="small"
          />
        </Grid>

        {isStoreEmployee && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="SSN (Last 4 Digits)"
                name="ssn_last4"
                value={formData.ssn_last4 || ""}
                onChange={handleChange}
                inputProps={{ maxLength: 4 }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Driver’s License No."
                name="driver_license_no"
                value={formData.driver_license_no || ""}
                onChange={handleChange}
                size="small"
              />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
}
