import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Loader2, X, UserPlus, UserCog, ShieldCheck } from "lucide-react";
import { supabaseAdmin } from "../../lib/supabaseAdminClient";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  contact_number?: string;
  address?: string;
  emergency_contact?: string;
  employee_type: string;
  created_at?: string;
}

interface Props {
  employee: Employee | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EmployeeForm({ employee, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<
  Pick<Employee, "full_name" | "email" | "contact_number" | "address" | "emergency_contact" | "employee_type">
>({
    full_name: employee?.full_name || "",
    email: employee?.email || "",
    contact_number: employee?.contact_number || "",
    address: employee?.address || "",
    emergency_contact: employee?.emergency_contact || "",
    employee_type: employee?.employee_type || "VA",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { ...formData, updated_at: new Date().toISOString() };

    const handleError = (msg: string) => {
      notifyError(msg);
      setSaving(false);
    };

    if (employee) {
      // 🟢 Edit existing employee
      confirmAction("Save changes to this employee?", async () => {
        setSaving(true);
        const { error } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", employee.id);

        if (error) handleError(`Error updating profile: ${error.message}`);
        else {
          notifySuccess("✅ Employee updated successfully!");
          onSave();
          onClose();
          setSaving(false);
        }
      });
    } else {
      // 🆕 Create new employee

      // 🧩 Basic email format validation 
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        return handleError("Please enter a valid email address.");
      }

      // 🚫 Block obvious test/disposable addresses
      const bannedPatterns = [
        "test@",
        "example@",
        "mailinator",
        "tempmail",
        "yopmail",
        "guerrillamail",
        "discard",
      ];
      if (bannedPatterns.some((p) => formData.email.toLowerCase().includes(p))) {
        return handleError("Please use a real company or personal email address.");
      }
      
      setSaving(true);
      const password = Math.random().toString(36).slice(-10);
      
      const { data: newUser, error: userError } =
        await supabaseAdmin.auth.admin.createUser({
          email: formData.email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: formData.full_name,
            employee_type: formData.employee_type,
          },
        });

      if (userError) return handleError(`Error creating user: ${userError.message}`);

      const updatePayload: Record<string, string> = {};
      (["contact_number", "address", "emergency_contact", "employee_type"] as const).forEach(
        (key) => {
          const val = formData[key];
          if (typeof val === "string" && val.trim()) {
            updatePayload[key] = val.trim();
          }
        }
      );

      if (Object.keys(updatePayload).length > 0) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", newUser.user.id);

        if (updateError)
          return handleError(`Error updating profile: ${updateError.message}`);
      }

      notifySuccess(
        `🎉 Employee created successfully! Temporary password: ${password}`
      );
      onSave();
      onClose();
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-3 sm:px-6 py-6 animate-fadeIn">
      <div
        className="
          bg-white/90 rounded-2xl border border-hemp-sage shadow-2xl 
          w-full max-w-2xl flex flex-col
          max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-4rem)]
          overflow-hidden backdrop-blur-xl
        "
      >
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
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-5 text-gray-700"
        >
          {/* Basic Info */}
          <section>
            <h3 className="text-sm font-semibold text-hemp-forest/70 mb-3 flex items-center gap-1">
              <ShieldCheck size={15} className="text-hemp-green" />
              Personal Information
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
                  required
                />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-sm font-semibold text-hemp-forest/70 mb-3">
              Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Contact Number
                </label>
                <input
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="e.g. +63 912 345 6789"
                  className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Emergency Contact
                </label>
                <input
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="Enter emergency contact"
                  className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2">
                Address
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 bg-white/60 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
              />
            </div>
          </section>

          {/* Role */}
          <section>
            <h3 className="text-sm font-semibold text-hemp-forest/70 mb-3">
              Role & Type
            </h3>
            <select
              name="employee_type"
              value={formData.employee_type}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
            >
              <option value="VA">Virtual Assistant</option>
              <option value="Store">Store Staff</option>
            </select>
          </section>
        </form>

        {/* Footer */}
        <footer className="flex flex-col-reverse sm:flex-row justify-end sm:items-center gap-3 px-5 sm:px-6 py-4 border-t border-hemp-sage/40 bg-white/90 backdrop-blur-md sticky bottom-0">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg px-5 py-2 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            onClick={handleSubmit}
            className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-5 sm:px-6 py-2 flex items-center justify-center gap-2 w-full sm:w-auto shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
          >
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
