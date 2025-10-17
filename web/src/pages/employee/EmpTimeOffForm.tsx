import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";

interface Props {
  onClose: () => void;
  onSave: () => void;
}

export default function EmpTimeOffForm({ onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Error: User not found.");
      setSaving(false);
      return;
    }

    const payload = {
      employee_id: user.id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("time_off_requests").insert([payload]);

    if (error) alert(error.message);
    else {
      onSave();
      onClose();
    }

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Request Time Off</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium">Start Date</span>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">End Date</span>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Reason</span>
            <textarea
              name="reason"
              placeholder="Enter reason for time off"
              value={formData.reason}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </label>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="primary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
