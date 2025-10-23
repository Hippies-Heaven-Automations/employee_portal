import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../Button";
import { notifyError, notifySuccess } from "../../utils/notify";
import { X, Save, Loader2 } from "lucide-react";

type DoorLocation = "Inside Lobby Side Door" | "Inside Front Door View";
type DoorNote = "Door Locked" | "Door Unlocked";

interface DoorLogInput {
  id?: string;
  date: string;         // yyyy-mm-dd
  time: string;         // HH:mm
  employee_id: string | null;
  door_location: DoorLocation;
  footage_link?: string | null;
  note: DoorNote;
}

interface EmployeeLite {
  id: string;
  full_name: string;
}

export default function DoorLogForm({
  initial,
  storeEmployees,
  onClose,
  onSaved,
}: {
  initial: Partial<DoorLogInput> | null; // ✅ replaces any | null
  storeEmployees: EmployeeLite[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const now = useMemo(() => new Date(), []);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  const toHHMM = (d: Date) => d.toTimeString().slice(0, 5);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<DoorLogInput>({
    id: initial?.id ?? undefined,
    date: initial?.date ?? toISODate(now),
    time: initial?.time?.slice(0, 5) ?? toHHMM(now),
    employee_id: initial?.employee_id ?? null,
    door_location: (initial?.door_location as DoorLocation) ?? "Inside Lobby Side Door",
    footage_link: initial?.footage_link ?? "",
    note: (initial?.note as DoorNote) ?? "Door Locked",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id ?? undefined,
        date: initial.date ?? toISODate(now),
        time: initial.time?.slice(0, 5) ?? toHHMM(now),
        employee_id: initial.employee_id ?? null,
        door_location: (initial.door_location as DoorLocation) ?? "Inside Lobby Side Door",
        footage_link: initial.footage_link ?? "",
        note: (initial.note as DoorNote) ?? "Door Locked",
      });
    }
  }, [initial, now]); // ✅ include now to satisfy exhaustive-deps

  // ✅ remove any: make type-safe generic handler
  const onChange = <K extends keyof DoorLogInput>(
    key: K,
    value: DoorLogInput[K]
  ) => setForm((s) => ({ ...s, [key]: value }));


  const handleSave = async () => {
    // basic validation
    if (!form.date || !form.time) {
      notifyError("Please provide both date and time.");
      return;
    }
    if (!form.employee_id) {
      notifyError("Please select an employee (store staff only).");
      return;
    }

    setSaving(true);
    const { data: authUser } = await supabase.auth.getUser();
    const uid = authUser.user?.id || null;

    const payload = {
      date: form.date,
      time: form.time + ":00", // store as HH:mm:ss
      employee_id: form.employee_id,
      door_location: form.door_location,
      footage_link: form.footage_link || null,
      note: form.note,
      inputted_by: uid,
    };

    let errorMsg: string | null = null;
    if (form.id) {
      const { error } = await supabase.from("door_logs").update(payload).eq("id", form.id);
      errorMsg = error?.message || null;
    } else {
      const { error } = await supabase.from("door_logs").insert(payload);
      errorMsg = error?.message || null;
    }

    setSaving(false);

    if (errorMsg) {
      notifyError(`Save failed: ${errorMsg}`);
    } else {
      notifySuccess(form.id ? "✅ Log updated." : "✅ Log added.");
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-hemp-sage/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hemp-sage/40 bg-hemp-mist/40">
          <h3 className="text-lg font-semibold text-hemp-forest">
            {form.id ? "Edit Door Log" : "Add Door Log"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-hemp-mist/80 text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => onChange("date", e.target.value)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            />
          </div>

          {/* Time */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => onChange("time", e.target.value)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            />
          </div>

          {/* Employee (store only list) */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Employee (Store)</label>
            <select
              value={form.employee_id || ""}
              onChange={(e) => onChange("employee_id", e.target.value || null)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            >
              <option value="">Select employee...</option>
              {storeEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Door Location</label>
            <select
              value={form.door_location}
              onChange={(e) => onChange("door_location", e.target.value as DoorLocation)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            >
              <option>Inside Lobby Side Door</option>
              <option>Inside Front Door View</option>
            </select>
          </div>

          {/* Note */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Note</label>
            <select
              value={form.note}
              onChange={(e) => onChange("note", e.target.value as DoorNote)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            >
              <option>Door Locked</option>
              <option>Door Unlocked</option>
            </select>
          </div>

          {/* Footage link */}
          <div className="sm:col-span-2 flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Footage Link</label>
            <input
              type="url"
              placeholder="https://…"
              value={form.footage_link || ""}
              onChange={(e) => onChange("footage_link", e.target.value)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-hemp-sage/40 flex items-center justify-end gap-3 bg-white">
          <Button
            onClick={onClose}
            variant="ghost"
            className="px-4 py-2 text-gray-700 hover:bg-hemp-mist rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-hemp-green hover:bg-hemp-forest text-white rounded-lg inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {form.id ? "Save Changes" : "Save Log"}
          </Button>
        </div>
      </div>
    </div>
  );
}
