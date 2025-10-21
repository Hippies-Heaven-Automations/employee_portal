import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Loader2, X, PlaneTakeoff, CalendarCheck2, User2 } from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";

interface TimeOff {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  full_name: string | null;
}

interface TimeOffFormProps {
  request: TimeOff | null;
  onClose: () => void;
  onSave: () => void;
}

interface Employee {
  id: string;
  full_name: string;
}

export default function TimeOffForm({ request, onClose, onSave }: TimeOffFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employee_id: request?.employee_id || "",
    start_date: request?.start_date || "",
    end_date: request?.end_date || "",
    reason: request?.reason || "",
    status: request?.status || "pending",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      if (error) notifyError(`Failed to load employees: ${error.message}`);
      else setEmployees(data || []);
    };
    fetchEmployees();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      notifyError("End date cannot be earlier than start date.");
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      updated_at: new Date().toISOString(),
    };

    const res = request
      ? await supabase.from("time_off_requests").update(payload).eq("id", request.id)
      : await supabase
          .from("time_off_requests")
          .insert([{ ...payload, created_at: new Date().toISOString() }]);

    if (res.error) notifyError(res.error.message);
    else {
      notifySuccess(request ? "Request updated successfully." : "New time-off request added!");
      onSave();
      onClose();
    }
    setSaving(false);
  };

  const statusColorMap = {
    approved: "bg-green-100 text-green-700 border-green-200",
    denied: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  } as const;

  const statusColor = statusColorMap[formData.status as keyof typeof statusColorMap];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-3 sm:px-6 py-6 animate-fadeIn">
      <div
        className="
          bg-white/90 border border-hemp-sage rounded-2xl shadow-2xl
          w-full max-w-2xl flex flex-col
          max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-4rem)]
          overflow-hidden backdrop-blur-xl
        "
      >
        {/* 🌿 Header */}
        <header className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-hemp-sage/40 bg-gradient-to-r from-hemp-green/10 to-hemp-sage/20 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {request ? (
              <CalendarCheck2 className="text-hemp-green" size={22} />
            ) : (
              <PlaneTakeoff className="text-hemp-green" size={22} />
            )}
            <h2 className="text-lg sm:text-xl font-semibold text-hemp-forest">
              {request ? "Edit Time-Off Request" : "Add New Time-Off Request"}
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

        {/* 🌿 Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-5 text-gray-700"
        >
          {/* Employee */}
          <section>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
              <User2 size={15} className="text-hemp-green" />
              Employee
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-green"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </section>

          {/* Dates */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-green"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-green"
                  required
                />
              </div>
            </div>
          </section>

          {/* Reason */}
          <section>
            <label className="block text-sm font-semibold mb-2">Reason</label>
            <textarea
              name="reason"
              placeholder="Enter reason for time off..."
              value={formData.reason}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-3 h-28 resize-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base"
              required
            />
          </section>

          {/* Status */}
          <section>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 capitalize font-medium focus:ring-2 focus:ring-hemp-green ${statusColor}`}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </select>
          </section>
        </form>

        {/* 🌿 Footer */}
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
                <PlaneTakeoff size={18} />
                Save
              </>
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
}
