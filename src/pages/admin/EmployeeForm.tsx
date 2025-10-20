import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Loader2, X, UserPlus, UserCog } from "lucide-react";
import { supabaseAdmin } from "../../lib/supabaseAdminClient";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm"; // ✅ new import

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
  const [formData, setFormData] = useState({
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
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      updated_at: new Date().toISOString(),
    };

    if (employee) {
      // 🟢 Confirm before updating existing employee
      confirmAction("Save changes to this employee?", async () => {
        setSaving(true);
        const { error } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", employee.id);

        if (error) notifyError(`Error updating profile: ${error.message}`);
        else {
          notifySuccess("✅ Employee updated successfully!");
          onSave();
          onClose();
        }
        setSaving(false);
      });
    } else {
      // 🆕 Create new employee (no confirmation)
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

      if (userError) {
        notifyError(`Error creating auth user: ${userError.message}`);
        setSaving(false);
        return;
      }

      const updatePayload: Record<string, string> = {};
      if (formData.contact_number?.trim())
        updatePayload.contact_number = formData.contact_number.trim();
      if (formData.address?.trim())
        updatePayload.address = formData.address.trim();
      if (formData.emergency_contact?.trim())
        updatePayload.emergency_contact = formData.emergency_contact.trim();
      if (formData.employee_type?.trim())
        updatePayload.employee_type = formData.employee_type.trim();

      if (Object.keys(updatePayload).length > 0) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", newUser.user.id);

        if (updateError) {
          notifyError(`Error updating profile: ${updateError.message}`);
          setSaving(false);
          return;
        }
      }

      notifySuccess(
        `Employee created successfully! Temporary password: ${password}`
      );

      onSave();
      onClose();
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white border border-hemp-sage rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeInUp">
        {/* 🌿 Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-hemp-sage/30 border-b border-hemp-sage/50">
          <div className="flex items-center gap-2">
            {employee ? (
              <UserCog className="text-hemp-green" size={22} />
            ) : (
              <UserPlus className="text-hemp-green" size={22} />
            )}
            <h2 className="text-xl font-semibold text-hemp-forest">
              {employee ? "Edit Employee" : "Add Employee"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-hemp-green transition"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* 🌿 Form Body */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-5 text-gray-700"
        >
          {/* Full Name */}
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
              required
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact_number"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Contact Number
              </label>
              <input
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="e.g. +63 912 345 6789"
                className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
              />
            </div>

            <div>
              <label
                htmlFor="emergency_contact"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Emergency Contact
              </label>
              <input
                id="emergency_contact"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleChange}
                placeholder="Enter emergency contact"
                className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Address
            </label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
            />
          </div>

          {/* Employee Type */}
          <div>
            <label
              htmlFor="employee_type"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Employee Type
            </label>
            <select
              id="employee_type"
              name="employee_type"
              value={formData.employee_type}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-hemp-green"
            >
              <option value="VA">Virtual Assistant</option>
              <option value="Store">Store Staff</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-hemp-sage/40">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg px-5 py-2 transition"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition flex items-center gap-2"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
