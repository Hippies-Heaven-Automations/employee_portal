import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Loader2, X, CalendarPlus, CalendarCog, Clock } from "lucide-react";

interface Schedule {
  id: string;
  employee_id: string;
  date: string;        // yyyy-mm-dd (stored in America/Chicago date)
  time_in: string;     // HH:mm (Chicago wall time)
  time_out: string;    // HH:mm (Chicago wall time)
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

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase.from("profiles").select("id, full_name").order("full_name");
      setEmployees(data || []);
    };
    fetchEmployees();
  }, []);

  // Compute Chicago offset (detect CDT/CST)
  function chicagoOffsetHours(dateISO: string) {
    if (!dateISO) return -6;
    const probe = new Date(dateISO + "T12:00:00Z");
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      timeZoneName: "short",
    }).formatToParts(probe);
    const abbr = parts.find(p => p.type === "timeZoneName")?.value || "";
    return abbr.includes("CDT") ? -5 : -6;
  }

  // Convert local (browser) time string to Chicago HH:mm string
  function toChicagoHHMM(localTime: string, dateISO: string) {
    if (!localTime) return "";

    const [hh, mm] = localTime.split(":").map(Number);

    // Get the offset for Chicago at that date
    const chicagoOffset = chicagoOffsetHours(dateISO); // -5 (CDT) or -6 (CST)

    // Create a UTC datetime representing *Chicago wall clock time*
    const chicagoTimeUTC = new Date(Date.UTC(2024, 0, 1, hh - chicagoOffset, mm, 0));

    // Return in 24-hour HH:mm format relative to Chicago local wall clock
    return chicagoTimeUTC.toISOString().slice(11, 16);
  }


  // Duration display
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

  // Slot selection autofill
  const handleSlotSelect = (slot: string) => {
    setFormData(prev => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const chicagoTimeIn = toChicagoHHMM(formData.time_in, formData.date);
    const chicagoTimeOut = toChicagoHHMM(formData.time_out, formData.date);

    const payload = {
      employee_id: formData.employee_id,
      date: formData.date, // Chicago date
      time_in: chicagoTimeIn,
      time_out: chicagoTimeOut,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white border border-hemp-sage rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-hemp-sage/30 border-b border-hemp-sage/50">
          <div className="flex items-center gap-2">
            {schedule ? <CalendarCog className="text-hemp-green" size={22} /> : <CalendarPlus className="text-hemp-green" size={22} />}
            <h2 className="text-xl font-semibold text-hemp-forest">{schedule ? "Edit Schedule" : "Add Schedule"}</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-hemp-green transition" aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        {/* Notice */}
        <div className="px-6 pt-3 text-xs text-gray-600">
          <span className="inline-block bg-hemp-sage/40 rounded px-2 py-1">
            All schedules are saved in <strong>Illinois time (CDT/CST)</strong>.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 text-gray-700">
          {/* Employee */}
          <div>
            <label htmlFor="employee_id" className="block text-sm font-semibold mb-2">Employee</label>
            <select
              id="employee_id"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-hemp-green"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold mb-2">Date (Central Time)</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-hemp-green"
              required
            />
          </div>

          {/* Slot Dropdown */}
          <div>
            <label htmlFor="slot" className="block text-sm font-semibold mb-2">Select Time Slot (Optional)</label>
            <select
              id="slot"
              name="slot"
              value={formData.slot}
              onChange={(e) => handleSlotSelect(e.target.value)}
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-hemp-green"
            >
              <option value="">-- Select a slot --</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecting a slot will auto-fill Time In and Time Out below.
            </p>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="time_in" className="block text-sm font-semibold mb-2">Time In (CT)</label>
              <input
                type="time"
                id="time_in"
                name="time_in"
                value={formData.time_in}
                onChange={handleChange}
                className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-hemp-green"
                required
              />
            </div>
            <div>
              <label htmlFor="time_out" className="block text-sm font-semibold mb-2">Time Out (CT)</label>
              <input
                type="time"
                id="time_out"
                name="time_out"
                value={formData.time_out}
                onChange={handleChange}
                className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-hemp-green"
                required
              />
            </div>
          </div>

          {/* Duration */}
          {duration && (
            <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
              <Clock className="text-hemp-green" size={16} />
              <span>Duration: <span className="font-semibold">{duration}</span></span>
            </div>
          )}

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
