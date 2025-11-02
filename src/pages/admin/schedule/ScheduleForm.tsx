import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Button } from "../../../components/Button";
import {
  Loader2,
  X,
  CalendarPlus,
  CalendarCog,
  Clock,
  Timer,
} from "lucide-react";
import { notifySuccess, notifyError } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";

interface Schedule {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string;
  created_at: string;
  profiles?: { full_name: string };
}

interface Employee {
  id: string;
  full_name: string;
}

interface ScheduleFormProps {
  schedule: Schedule | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ScheduleForm({ schedule, onClose, onSave }: ScheduleFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employee_id: schedule?.employee_id || "",
    date: schedule?.date || "",
    time_in: schedule?.time_in || "",
    time_out: schedule?.time_out || "",
    slot: "",
  });
  const [duration, setDuration] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const timeSlots = [
    "8 AM - 11 AM",
    "11 AM - 2 PM",
    "2 PM - 5 PM",
    "5 PM - 8 PM",
    "8 PM - 11 PM",
    "11 PM - 2 AM",
    "2 AM - 5 AM",
    "5 AM - 8 AM",
  ];

  // 🌿 Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      if (error) notifyError(`Error loading employees: ${error.message}`);
      else setEmployees(data || []);
    };
    fetchEmployees();
  }, []);

  // 🌿 Duration calculator
  const calculateDuration = (timeIn: string, timeOut: string) => {
    if (!timeIn || !timeOut) return "";
    const start = new Date(`1970-01-01T${timeIn}:00`);
    const end = new Date(`1970-01-01T${timeOut}:00`);
    let diff = (end.getTime() - start.getTime()) / 3600000;
    if (diff < 0) diff += 24;
    return `${diff.toFixed(2)} hrs`;
  };

  useEffect(() => {
    setDuration(calculateDuration(formData.time_in, formData.time_out));
  }, [formData.time_in, formData.time_out]);

  const handleSlotSelect = (slot: string) => {
    setFormData((prev) => {
      if (!slot) return { ...prev, slot: "", time_in: "", time_out: "" };
      const [start, end] = slot.split(" - ");
      const to24 = (label: string) => {
        const [num, mer] = label.split(" ");
        let h = parseInt(num, 10);
        if (mer === "PM" && h < 12) h += 12;
        if (mer === "AM" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:00`;
      };
      return { ...prev, slot, time_in: to24(start), time_out: to24(end) };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      employee_id: formData.employee_id,
      date: formData.date,
      time_in: formData.time_in,
      time_out: formData.time_out,
      updated_at: new Date().toISOString(),
    };

    const action = async () => {
      setSaving(true);
      const res = schedule
        ? await supabase.from("schedules").update(payload).eq("id", schedule.id)
        : await supabase.from("schedules").insert([payload]);

      if (res.error) notifyError(`Error saving schedule: ${res.error.message}`);
      else {
        notifySuccess(schedule ? "Schedule updated successfully." : "Schedule added successfully.");
        onSave();
        onClose();
      }
      setSaving(false);
    };

    if (schedule) confirmAction("Save changes to this schedule?", action);
    else await action();
  };

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
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-hemp-sage/40 bg-gradient-to-r from-hemp-green/10 to-hemp-sage/20 sticky top-0">
          <div className="flex items-center gap-2">
            {schedule ? (
              <CalendarCog className="text-hemp-green" size={22} />
            ) : (
              <CalendarPlus className="text-hemp-green" size={22} />
            )}
            <h2 className="text-lg sm:text-xl font-semibold text-hemp-forest">
              {schedule ? "Edit Schedule" : "Add New Schedule"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-hemp-sage/30 text-gray-600 hover:text-hemp-green transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 🌿 Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-5 text-gray-700"
        >
          {/* Info note */}
          <p className="text-xs text-gray-600 bg-hemp-sage/20 border border-hemp-sage/40 rounded-md px-3 py-2">
            All schedules are automatically saved in{" "}
            <strong>Illinois time (CDT/CST)</strong>.
          </p>

          {/* Employee */}
          <div>
            <label className="block text-sm font-semibold mb-2">Employee</label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-hemp-green"
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

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold mb-2">Date (CT)</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-green"
              required
            />
          </div>

          {/* Time slot */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Quick Time Slot (optional)
            </label>
            <select
              name="slot"
              value={formData.slot}
              onChange={(e) => handleSlotSelect(e.target.value)}
              className="w-full border border-hemp-sage/60 bg-white/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-green"
            >
              <option value="">-- Select a slot --</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecting a slot auto-fills the fields below.
            </p>
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Time In (CT)
              </label>
              <input
                type="time"
                name="time_in"
                value={formData.time_in}
                onChange={handleChange}
                className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Time Out (CT)
              </label>
              <input
                type="time"
                name="time_out"
                value={formData.time_out}
                onChange={handleChange}
                className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green"
                required
              />
            </div>
          </div>

          {/* Duration */}
          {duration && (
            <div className="flex items-center gap-2 text-sm text-hemp-forest mt-2">
              <Clock className="text-hemp-green" size={16} />
              <span>
                Duration:{" "}
                <span className="font-semibold text-hemp-green">
                  {duration}
                </span>
              </span>
            </div>
          )}
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
                <Timer size={18} />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
