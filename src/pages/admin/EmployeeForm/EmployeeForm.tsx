import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { X, UserPlus, UserCog, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { supabaseAdmin } from "../../../lib/supabaseAdminClient";
import { notifySuccess, notifyError } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";

import { Employee, EmployeeFormProps } from "./types";
import EmployeeTypeSection from "./EmployeeTypeSection";
import PersonalInfoSection from "./PersonalInfoSection";
import EmploymentDetailsSection from "./EmploymentDetailsSection";
import WeCardCertificationSection from "./WeCardCertificationSection";

export default function EmployeeForm({
  employee,
  onClose,
  onSave,
}: EmployeeFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<Employee, "id" | "created_at">>({
    full_name: employee?.full_name || "",
    email: employee?.email || "",
    contact_number: employee?.contact_number || "",
    address: employee?.address || "",
    emergency_contact: employee?.emergency_contact || "",
    emergency_contact_phone: employee?.emergency_contact_phone || "",
    ssn_last4: employee?.ssn_last4 || "",
    driver_license_no: employee?.driver_license_no || "",
    start_date: employee?.start_date || "",
    pay_rate: employee?.pay_rate || undefined,
    shirt_size: employee?.shirt_size || "",
    hoodie_size: employee?.hoodie_size || "",
    employee_type: employee?.employee_type || "VA",
    position: employee?.position || "",
    acronym: employee?.acronym || "",
    nickname: employee?.nickname || "",
    wise_tag: employee?.wise_tag || "",
    wise_email: employee?.wise_email || "",
    bank_name: employee?.bank_name || "",
    account_number: employee?.account_number || "",
    wecard_certified: employee?.wecard_certified || false,
    wecard_certificate_url: employee?.wecard_certificate_url || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const isStoreEmployee = formData.employee_type === "Store";

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);

  // ✅ Clean up and normalize all potentially invalid types
  const normalized = {
    ...formData,
    pay_rate:
      formData.pay_rate && !isNaN(Number(formData.pay_rate))
        ? Number(formData.pay_rate)
        : null, // convert invalid or empty pay_rate → null
    start_date: formData.start_date || null, // convert "" → null for date
    ssn_last4: formData.ssn_last4 || null,
    driver_license_no: formData.driver_license_no || null,
    shirt_size: formData.shirt_size || "XXS",
    hoodie_size: formData.hoodie_size || "XXS",
    updated_at: new Date().toISOString(),
  };

  const finish = () => {
    setSaving(false);
    onSave();
    onClose();
  };

  // ✅ Edit existing employee
  if (employee) {
    confirmAction("Save changes to this employee?", async () => {
      const { error } = await supabase
        .from("profiles")
        .update(normalized)
        .eq("id", employee.id);

      if (error) notifyError(error.message);
      else notifySuccess("Employee updated successfully!");
      finish();
    });
    return;
  }

  // ✅ Create new employee
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(formData.email)) {
    notifyError("Please enter a valid email address.");
    return setSaving(false);
  }

  const tempPassword = Math.random().toString(36).slice(-10);
  const { data: newUser, error: userError } =
    await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: formData.full_name,
        employee_type: formData.employee_type,
      },
    });

  if (userError || !newUser?.user?.id) {
    notifyError(
      `Error creating user: ${
        userError ? userError.message : "No user ID returned"
      }`
    );
    return setSaving(false);
  }

  const profilePayload = {
    id: newUser.user.id,
    ...normalized,
    created_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabaseAdmin
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

    if (upsertError) {
        notifyError(upsertError.message);
        setSaving(false);
        return;
    }

    // ✅ Send welcome email via Supabase Edge Function
    try {
    const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: formData.full_name,
            email: formData.email,
            tempPassword,
        }),
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        console.error("Email send failed:", errText);
        notifyError("Employee created, but failed to send welcome email.");
    } else {
        notifySuccess(
        `Employee created successfully! A welcome email was sent to ${formData.email}`
        );
    }
    } catch (err) {
    console.error("Error sending email:", err);
    notifyError("Employee created, but failed to send welcome email.");
    }

    finish();

};

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: "1px solid #d1d5db",
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#15803d",
          color: "white",
          py: 1.5,
          px: 2.5,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {employee ? <UserCog size={20} /> : <UserPlus size={20} />}
          <span>{employee ? "Edit Employee" : "Add New Employee"}</span>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: "auto" }}>
        <form id="employeeForm" onSubmit={handleSubmit}>
          <EmployeeTypeSection value={formData.employee_type} onChange={handleSelect} />
          <PersonalInfoSection
            formData={formData}
            handleChange={handleChange}
            isStoreEmployee={isStoreEmployee}
          />
          <EmploymentDetailsSection
            formData={formData}
            handleChange={handleChange}
            isStoreEmployee={isStoreEmployee}
          />
          {isStoreEmployee && (
            <WeCardCertificationSection
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
            />
          )}

          <Box
            display="flex"
            flexDirection={isMobile ? "column-reverse" : "row"}
            justifyContent="flex-end"
            alignItems="center"
            gap={2}
            mt={4}
          >
            <Button
              onClick={onClose}
              fullWidth={isMobile}
              variant="outlined"
              sx={{
                borderColor: "#d1d5db",
                color: "#374151",
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              fullWidth={isMobile}
              variant="contained"
              sx={{
                backgroundColor: "#15803d",
                color: "white",
                "&:hover": { backgroundColor: "#14532d" },
              }}
              startIcon={saving ? <Loader2 className="animate-spin" /> : <UserPlus />}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
