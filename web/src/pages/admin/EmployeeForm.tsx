import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";

interface Props {
  employee: any | null;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      updated_at: new Date().toISOString(),
    };

    let res;
    if (employee) {
      res = await supabase.from("profiles").update(payload).eq("id", employee.id);
    } else {
      res = await supabase.from("profiles").insert([payload]);
    }

    if (res.error) alert(res.error.message);
    else {
      onSave();
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          {employee ? "Edit Employee" : "Add Employee"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            name="emergency_contact"
            placeholder="Emergency Contact"
            value={formData.emergency_contact}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <div className="flex gap-2">
            <select
              name="employee_type"
              value={formData.employee_type}
              onChange={handleChange}
              className="w-1/2 border rounded p-2"
            >
              <option value="VA">VA</option>
              <option value="Store">Store</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="primary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
