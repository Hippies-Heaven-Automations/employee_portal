import React from "react";
import { Typography, TextField, FormControlLabel, Checkbox } from "@mui/material";
import { ShieldCheck } from "lucide-react";
import { Employee } from "./types";

interface Props {
  formData: Omit<Employee, "id" | "created_at">;
  setFormData: React.Dispatch<
    React.SetStateAction<Omit<Employee, "id" | "created_at">>
  >;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function WeCardCertificationSection({
  formData,
  setFormData,
  handleChange,
}: Props) {
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
        <ShieldCheck size={14} />
        WeCard Certification
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.wecard_certified || false}
            onChange={(e) =>
              setFormData({ ...formData, wecard_certified: e.target.checked })
            }
            sx={{
              color: "#15803d",
              "&.Mui-checked": { color: "#15803d" },
            }}
          />
        }
        label="Certified in WeCard.org"
      />

      <TextField
        fullWidth
        label="WeCard Certificate URL"
        name="wecard_certificate_url"
        value={formData.wecard_certificate_url || ""}
        onChange={handleChange}
        size="small"
      />
    </>
  );
}
