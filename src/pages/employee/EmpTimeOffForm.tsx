import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { notifySuccess, notifyError } from "../../utils/notify"; // ✅ keep consistent with others

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Unable to find user session. Please log in again.");
      }

      const payload = {
        employee_id: user.id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        status: "Pending",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("time_off_requests").insert([payload]);
      if (error) throw new Error(error.message);

      // ✅ Refresh parent data and close modal
      onSave();
      onClose();

      // Reset form
      setFormData({ start_date: "", end_date: "", reason: "" });
      notifySuccess("🌿 Time-off request submitted successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error submitting time-off request.";
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-slideUp">
        <h2 className="text-2xl font-bold text-hemp-forest mb-4">
          🌿 Request Time Off
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Start Date */}
          <label className="block">
            <span className="text-sm font-medium text-hemp-forest">Start Date</span>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full border border-hemp-sage/60 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-hemp-green outline-none"
            />
          </label>

          {/* End Date */}
          <label className="block">
            <span className="text-sm font-medium text-hemp-forest">End Date</span>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full border border-hemp-sage/60 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-hemp-green outline-none"
            />
          </label>

          {/* Reason */}
          <label className="block">
            <span className="text-sm font-medium text-hemp-forest">Reason</span>
            <textarea
              name="reason"
              placeholder="Enter reason for time off..."
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full border border-hemp-sage/60 rounded-lg p-2 mt-1 h-24 resize-none focus:ring-2 focus:ring-hemp-green outline-none"
            />
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-hemp-sage/30 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-hemp-forest hover:bg-hemp-sage/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-hemp-green hover:bg-hemp-forest text-white px-5"
            >
              {saving ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
