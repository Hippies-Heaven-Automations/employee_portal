import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { supabaseAdmin } from "../../lib/supabaseAdminClient";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Loader2,
  X,
  UserPlus,
  UserCog,
  ShieldCheck,
  FileSignature,
} from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  contact_number?: string;
  address?: string;
  emergency_contact?: string;
  emergency_contact_phone?: string;
  ssn_last4?: string;
  driver_license_no?: string;
  start_date?: string;
  pay_rate?: number;
  shirt_size?: string;
  hoodie_size?: string;
  employee_type: "Store" | "VA";
  position?: string;
  acronym?: string;
  nickname?: string;
  wise_tag?: string;
  wise_email?: string;
  bank_name?: string;
  account_number?: string;
  wecard_certified?: boolean;
  wecard_certificate_url?: string;
  created_at?: string;
}

interface Props {
  employee: Employee | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EmployeeForm({ employee, onClose, onSave }: Props) {
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

    const normalized = {
      ...formData,
      pay_rate: formData.pay_rate ? Number(formData.pay_rate) : null,
      updated_at: new Date().toISOString(),
    };

    const finish = () => {
      setSaving(false);
      onSave();
      onClose();
    };

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

    if (upsertError) notifyError(upsertError.message);
    else
      notifySuccess(
        `Employee created successfully! Temporary password: ${tempPassword}`
      );

    finish();
  };

  const sizeOptions = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

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
          <Typography variant="h6">
            {employee ? "Edit Employee" : "Add New Employee"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: "auto" }}>
        <form id="employeeForm" onSubmit={handleSubmit}>
          {/* Type */}
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
              sx={{ color: "#1e293b", fontWeight: 600, mb: 1 }}
            >
              <FileSignature size={16} style={{ marginRight: 4 }} />
              Employee Type
            </Typography>
            <select
              name="employee_type"
              value={formData.employee_type}
              onChange={handleSelect}
              className="w-full border border-hemp-sage bg-white px-3 py-2 text-sm"
            >
              <option value="VA">Virtual Assistant</option>
              <option value="Store">Store Staff</option>
            </select>
          </Box>

          {/* Personal Info */}
          <Typography
            variant="subtitle2"
            sx={{ color: "#14532d", fontWeight: 600, mb: 2 }}
          >
            <ShieldCheck size={14} style={{ marginRight: 4 }} />
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
                variant="outlined"
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

          {/* Employment */}
          <Typography
            variant="subtitle2"
            sx={{ color: "#14532d", fontWeight: 600, mt: 4, mb: 1 }}
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

            {/* inside your Employment Details grid */}
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

                {/* ✅ Increased label visibility for these two */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Shirt Size"
                    name="shirt_size"
                    value={formData.shirt_size || ""}
                    onChange={handleChange}
                    size="medium"
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        whiteSpace: "normal", // ✅ allows label wrapping
                        lineHeight: "1.2rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                      },
                    }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: { sx: { maxHeight: 250 } },
                      },
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: "1rem",
                        minHeight: "56px", // ✅ gives room for full label visibility
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
                    value={formData.hoodie_size || ""}
                    onChange={handleChange}
                    size="medium"
                    InputLabelProps={{
                      shrink: true,
                      sx: {
                        whiteSpace: "normal", // ✅ enables multi-line label
                        lineHeight: "1.2rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                      },
                    }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: { sx: { maxHeight: 250 } },
                      },
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

          {isStoreEmployee && (
            <>
              <Typography
                variant="subtitle2"
                sx={{ color: "#14532d", fontWeight: 600, mt: 4, mb: 1 }}
              >
                WeCard Certification
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.wecard_certified || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wecard_certified: e.target.checked,
                      })
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
