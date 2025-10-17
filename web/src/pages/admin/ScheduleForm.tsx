import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";

interface ScheduleFormProps {
  schedule: any | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ScheduleForm({ schedule, onClose, onSave }: ScheduleFormProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    employee_id: schedule?.employee_id || "",
    date: schedule?.date || "",
    time_in: schedule?.time_in || "",
    time_out: schedule?.time_out || "",
  });
  const [duration, setDuration] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name").order("full_name");
      if (error) console.error(error);
      else setEmployees(data || []);
    };
    fetchEmployees();
  }, []);

  const calculateDuration = (timeIn: string, timeOut: string) => {
    if (!timeIn || !timeOut) return "";
    const start = new Date(`1970-01-01T${timeIn}:00`);
    const end = new Date(`1970-01-01T${timeOut}:00`);
    let diff = (end.getTime() - start.getTime()) / 1000 / 60 / 60; // hours
    if (diff < 0) diff += 24; // handle overnight shifts
    return `${diff.toFixed(2)} hrs`;
  };

  useEffect(() => {
    setDuration(calculateDuration(formData.time_in, formData.time_out));
  }, [formData.time_in, formData.time_out]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      employee_id: formData.employee_id,
      date: formData.date,
      time_in: formData.time_in,
      time_out: formData.time_out,
      updated_at: new Date().toISOString(),
    };

    let res;
    if (schedule) {
      res = await supabase.from("schedules").update(payload).eq("id", schedule.id);
    } else {
      res = await supabase.from("schedules").insert([payload]);
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
          {schedule ? "Edit Schedule" : "Add Schedule"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
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

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />

          <div className="flex gap-2">
            <input
              type="time"
              name="time_in"
              value={formData.time_in}
              onChange={handleChange}
              className="w-1/2 border rounded p-2"
              required
            />

            <input
              type="time"
              name="time_out"
              value={formData.time_out}
              onChange={handleChange}
              className="w-1/2 border rounded p-2"
              required
            />
          </div>

          {duration && (
            <p className="text-sm text-gray-600">
              ⏱ Duration: <span className="font-semibold">{duration}</span>
            </p>
          )}

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
