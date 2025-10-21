import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Loader2, X, CalendarHeart, PlaneTakeoff } from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";

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
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      notifyError("End date cannot be earlier than start date.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user)
        throw new Error("Unable to find user session. Please log in again.");

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

      setFormData({ start_date: "", end_date: "", reason: "" });
      onSave();
      onClose();
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-3 sm:px-6 py-6 animate-fadeIn">
      <div
        className="
          bg-white/90 border border-hemp-sage rounded-2xl shadow-2xl 
          w-full max-w-lg flex flex-col 
          max-h-[calc(100vh-3rem)] overflow-hidden backdrop-blur-xl
        "
      >
        {/* 🌿 Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-hemp-sage/40 bg-gradient-to-r from-hemp-green/10 to-hemp-sage/20 sticky top-0">
          <div className="flex items-center gap-2">
            <CalendarHeart className="text-hemp-green" size={22} />
            <h2 className="text-lg sm:text-xl font-semibold text-hemp-forest">
              Request Time Off
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-hemp-sage/30 text-gray-600 hover:text-hemp-green transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* 🌿 Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-5 text-gray-700"
        >
          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-hemp-forest">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-green outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-hemp-forest">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-green outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-hemp-forest">
              Reason
            </label>
            <textarea
              name="reason"
              placeholder="Enter reason for your time off..."
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-3 h-28 resize-none focus:ring-2 focus:ring-hemp-green outline-none"
            />
          </div>
        </form>

        {/* 🌿 Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end sm:items-center gap-3 px-5 sm:px-6 py-4 border-t border-hemp-sage/40 bg-white/90 sticky bottom-0">
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
            className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-5 sm:px-6 py-2 flex items-center justify-center gap-2 w-full sm:w-auto shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <PlaneTakeoff size={18} />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
