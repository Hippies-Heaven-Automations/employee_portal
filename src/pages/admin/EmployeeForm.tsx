import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { supabaseAdmin } from "../../lib/supabaseAdminClient";
import { Button } from "../../components/Button";
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

  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const isStoreEmployee = formData.employee_type === "Store";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const handleError = (msg: string) => {
      notifyError(msg);
      setSaving(false);
    };

    const normalizedPayload = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      contact_number: formData.contact_number?.trim() || null,
      address: formData.address?.trim() || null,
      emergency_contact: formData.emergency_contact?.trim() || null,
      emergency_contact_phone: formData.emergency_contact_phone?.trim() || null,
      ssn_last4: formData.ssn_last4?.trim() || null,
      driver_license_no: formData.driver_license_no?.trim() || null,
      start_date: formData.start_date || null,
      pay_rate:
        formData.pay_rate !== undefined && formData.pay_rate !== null && formData.pay_rate !== ("" as any)
          ? Number(formData.pay_rate)
          : null,
      shirt_size: formData.shirt_size || null,
      hoodie_size: formData.hoodie_size || null,
      employee_type: formData.employee_type,
      position: formData.position?.trim() || null,
      acronym: formData.acronym?.trim() || null,
      nickname: formData.nickname?.trim() || null,
      wise_tag: formData.wise_tag?.trim() || null,
      wise_email: formData.wise_email?.trim() || null,
      bank_name: formData.bank_name?.trim() || null,
      account_number: formData.account_number?.trim() || null,
      wecard_certified: formData.wecard_certified ?? false,
      wecard_certificate_url: formData.wecard_certificate_url?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    // ✅ Update existing
    if (employee) {
      confirmAction("Save changes to this employee?", async () => {
        const { error } = await supabase
          .from("profiles")
          .update(normalizedPayload)
          .eq("id", employee.id);

        if (error) handleError(`Error updating profile: ${error.message}`);
        else {
          notifySuccess("✅ Employee updated successfully!");
          onSave();
          onClose();
          setSaving(false);
        }
      });
      return;
    }

    // ✅ Create new
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email))
      return handleError("Please enter a valid email address.");

    const bannedPatterns = ["test@", "example@", "mailinator", "tempmail", "yopmail"];
    if (bannedPatterns.some((p) => formData.email.toLowerCase().includes(p)))
      return handleError("Please use a real company or personal email address.");

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

    if (userError || !newUser?.user?.id)
      return handleError(
        `Error creating user: ${userError ? userError.message : "No user ID returned"}`
      );

    const profilePayload = {
      id: newUser.user.id,
      ...normalizedPayload,
      created_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });


    if (upsertError)
      return handleError(`Error saving profile: ${upsertError.message}`);

    notifySuccess(
      `🎉 Employee created successfully!\nTemporary password: ${tempPassword}`
    );

    onSave();
    onClose();
    setSaving(false);
  };

  function DropdownField({
    label,
    name,
    value,
    onChange,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }) {
    const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
    return (
      <div>
        <label className="block text-sm font-semibold mb-2">{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
        >
          <option value="">Select Size</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-3 sm:px-6 py-6 animate-fadeIn">
      <div className="bg-white/90 rounded-2xl border border-hemp-sage shadow-2xl w-full max-w-2xl flex flex-col max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <header className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-hemp-sage/40 bg-gradient-to-r from-hemp-green/10 to-hemp-sage/20 sticky top-0">
          <div className="flex items-center gap-2">
            {employee ? (
              <UserCog className="text-hemp-green" size={22} />
            ) : (
              <UserPlus className="text-hemp-green" size={22} />
            )}
            <h2 className="text-lg sm:text-xl font-semibold text-hemp-forest">
              {employee ? "Edit Employee" : "Add New Employee"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-hemp-sage/30 text-gray-600 hover:text-hemp-green transition"
          >
            <X size={20} />
          </button>
        </header>

        {/* Form */}
        <form
          id="employeeForm"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-6 text-gray-700"
        >
          {/* 🌿 Employee Type */}
          <section className="border border-hemp-sage/40 bg-hemp-green/5 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSignature className="text-hemp-green" size={18} />
                <h3 className="text-sm font-semibold text-hemp-forest">
                  Employee Type
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isStoreEmployee
                    ? "bg-hemp-green/20 text-hemp-forest border border-hemp-green/30"
                    : "bg-hemp-sage/30 text-hemp-forest border border-hemp-sage/50"
                }`}
              >
                {isStoreEmployee ? "🛍️ Store Staff" : "💻 Virtual Assistant"}
              </span>
            </div>

            <div className="mt-3">
              <select
                name="employee_type"
                value={formData.employee_type}
                onChange={handleChange}
                className="w-full border border-hemp-sage/60 bg-white/80 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
              >
                <option value="VA">Virtual Assistant</option>
                <option value="Store">Store Staff</option>
              </select>
            </div>
          </section>

          {/* 🧍 Personal Info */}
          <section>
            <h3 className="text-sm font-semibold text-hemp-forest/70 mb-3 flex items-center gap-1">
              <ShieldCheck size={15} className="text-hemp-green" />
              Personal Information
            </h3>

            <div className="space-y-5">
              <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Contact Number" name="contact_number" value={formData.contact_number || ""} onChange={handleChange} />
                <InputField label="Emergency Contact" name="emergency_contact" value={formData.emergency_contact || ""} onChange={handleChange} />
                <InputField label="Emergency Contact Phone" name="emergency_contact_phone" value={formData.emergency_contact_phone || ""} onChange={handleChange} />
              </div>
              <InputField label="Address" name="address" value={formData.address || ""} onChange={handleChange} />

              {isStoreEmployee && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="SSN (Last 4 Digits)" name="ssn_last4" value={formData.ssn_last4 || ""} onChange={handleChange} maxLength={4} />
                  <InputField label="Driver’s License No." name="driver_license_no" value={formData.driver_license_no || ""} onChange={handleChange} />
                </div>
              )}
            </div>
          </section>

          {/* 🧾 Employment Details */}
          <section>
            <h3 className="text-sm font-semibold text-hemp-forest/70 mb-3">Employment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Position / Title" name="position" value={formData.position || ""} onChange={handleChange} />
              <InputField label="Acronym" name="acronym" value={formData.acronym || ""} onChange={handleChange} />
              <InputField label="Nickname" name="nickname" value={formData.nickname || ""} onChange={handleChange} />
            </div>

            {isStoreEmployee && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <InputField label="Start Date" name="start_date" type="date" value={formData.start_date || ""} onChange={handleChange} />
                <InputField label="Starting Pay Rate ($/hr)" name="pay_rate" type="number" value={formData.pay_rate?.toString() || ""} onChange={handleChange} />
                <DropdownField label="Shirt Size" name="shirt_size" value={formData.shirt_size || ""} onChange={handleChange} />
                <DropdownField label="Hoodie Size" name="hoodie_size" value={formData.hoodie_size || ""} onChange={handleChange} />
              </div>
            )}
          </section>

          {/* 🎓 WeCard Certification */}
          {isStoreEmployee && (
            <section>
              <h3 className="text-sm font-semibold text-hemp-forest/70 mb-3 flex items-center gap-1">
                <ShieldCheck size={15} className="text-hemp-green" />
                WeCard Certification
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <input
                  id="wecard_certified"
                  type="checkbox"
                  name="wecard_certified"
                  checked={formData.wecard_certified || false}
                  onChange={(e) =>
                    setFormData({ ...formData, wecard_certified: e.target.checked })
                  }
                  className="h-4 w-4 text-hemp-green border-gray-300 rounded"
                />
                <label htmlFor="wecard_certified" className="text-sm text-gray-700">
                  Certified in WeCard.org
                </label>
              </div>

              <InputField
                label="WeCard Certificate URL"
                name="wecard_certificate_url"
                value={formData.wecard_certificate_url || ""}
                onChange={handleChange}
                type="url"
              />
            </section>
          )}
        </form>

        {/* Footer */}
        <footer className="flex flex-col-reverse sm:flex-row justify-end sm:items-center gap-3 px-5 sm:px-6 py-4 border-t border-hemp-sage/40 bg-white/90 sticky bottom-0">
          <Button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg px-5 py-2 w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" form="employeeForm" disabled={saving} className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-5 sm:px-6 py-2 flex items-center justify-center gap-2 w-full sm:w-auto shadow-md hover:shadow-lg active:scale-[0.98] transition-all">
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Save
              </>
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
}

/* 🌿 Reusable Field Component */
function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        required={required}
        maxLength={maxLength}
        className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
      />
    </div>
  );
}
