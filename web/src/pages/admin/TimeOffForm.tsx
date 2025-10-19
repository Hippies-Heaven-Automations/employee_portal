import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Loader2, X, PlaneTakeoff, Calendar } from "lucide-react";

interface TimeOffFormProps {
  request: any | null;
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
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .order("full_name");
    if (!error) setEmployees(data || []);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    setSaving(true);

    const payload = {
      employee_id: formData.employee_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      status: formData.status,
      updated_at: new Date().toISOString(),
    };

    let res;
    if (request) {
      res = await supabase
        .from("time_off_requests")
        .update(payload)
        .eq("id", request.id);
    } else {
      res = await supabase
        .from("time_off_requests")
        .insert([{ ...payload, created_at: new Date().toISOString() }]);
    }

    if (res.error) alert(res.error.message);
    else {
      onSave();
      onClose();
    }

    setSaving(false);
  };

  const statusColorMap = {
    approved: "bg-green-100 text-green-700 border-green-200",
    denied: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  } as const;

  const statusKey = formData.status as keyof typeof statusColorMap;
  const statusColor = statusColorMap[statusKey];  

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
      <div className="bg-white border border-hemp-sage rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeInUp">
        {/* 🌿 Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-hemp-sage/30 border-b border-hemp-sage/50">
          <div className="flex items-center gap-2">
            {request ? (
              <Calendar className="text-hemp-green" size={22} />
            ) : (
              <PlaneTakeoff className="text-hemp-green" size={22} />
            )}
            <h2 className="text-xl font-semibold text-hemp-forest">
              {request ? "Edit Time-Off Request" : "Add Time-Off Request"}
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

        {/* 🌿 Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-5 text-gray-700"
        >
          {/* Employee */}
          <div>
            <label className="block text-sm font-semibold mb-2">Employee</label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold mb-2">Reason</label>
            <textarea
              name="reason"
              placeholder="Enter reason for time off"
              value={formData.reason}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green h-28 resize-none"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 capitalize font-medium focus:outline-none focus:ring-2 focus:ring-hemp-green ${statusColor}`}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
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
