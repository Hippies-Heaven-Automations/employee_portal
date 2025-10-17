import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";

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
    const { data, error } = await supabase.from("profiles").select("id, full_name").order("full_name");
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
      res = await supabase.from("time_off_requests").update(payload).eq("id", request.id);
    } else {
      res = await supabase.from("time_off_requests").insert([{ ...payload, created_at: new Date().toISOString() }]);
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
          {request ? "Edit Time-Off Request" : "Add Time-Off Request"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium">Employee</span>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </label>

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

          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full border rounded p-2 capitalize ${
                formData.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : formData.status === "denied"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </select>
          </label>

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
