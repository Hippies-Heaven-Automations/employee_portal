import React from "react";
import { Box, Typography } from "@mui/material";
import { FileSignature } from "lucide-react";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function EmployeeTypeSection({ value, onChange }: Props) {
  return (
    <Box
      sx={{
        border: "1px solid #d1d5db",
        p: 2,
        mb: 3,
        backgroundColor: "#f1f5f9",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: "#1e293b",
          fontWeight: 600,
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <FileSignature size={16} />
        Employee Type
      </Typography>
      <select
        name="employee_type"
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 bg-white px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-hemp-green"
      >
        <option value="VA">Virtual Assistant</option>
        <option value="Store">Store Staff</option>
      </select>
    </Box>
  );
}
