import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../Button";
import { notifyError, notifySuccess } from "../../utils/notify";
import { X, Save, Loader2 } from "lucide-react";

interface ViolationInput {
  id?: string;
  date: string;
  time: string;
  employee_id: string | null;
  description: string;
  footage_link?: string | null;
  notes?: string | null;
}

interface EmployeeLite {
  id: string;
  full_name: string;
}

export default function EmployeeViolationForm({
  initial,
  storeEmployees,
  onClose,
  onSaved,
}: {
  initial: Partial<ViolationInput> | null; // ✅ replaces any | null
  storeEmployees: EmployeeLite[];
  onClose: () => void;
  onSaved: () => void;
}) {

  const now = useMemo(() => new Date(), []);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  const toHHMM = (d: Date) => d.toTimeString().slice(0, 5);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ViolationInput>({
    id: initial?.id,
    date: initial?.date || toISODate(now),
    time: initial?.time ? initial.time.slice(0, 5) : toHHMM(now),
    employee_id: initial?.employee_id || null,
    description: initial?.description || "",
    footage_link: initial?.footage_link || "",
    notes: initial?.notes || "",
  });

useEffect(() => {
  if (initial) {
    setForm({
      id: initial.id ?? undefined,
      date: initial.date ?? toISODate(now),
      time: initial.time?.slice(0, 5) ?? toHHMM(now),
      employee_id: initial.employee_id ?? null,
      description: initial.description ?? "",
      footage_link: initial.footage_link ?? "",
      notes: initial.notes ?? "",
    });
  }
}, [initial, now]);


  const onChange = <K extends keyof ViolationInput>(
  key: K,
  value: ViolationInput[K]
) => setForm((s) => ({ ...s, [key]: value }));

  const handleSave = async () => {
    if (!form.date || !form.time) {
      notifyError("Please provide both date and time.");
      return;
    }
    if (!form.employee_id) {
      notifyError("Please select an employee (store only).");
      return;
    }
    if (!form.description.trim()) {
      notifyError("Please describe the violation.");
      return;
    }

    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id || null;

    const payload = {
      date: form.date,
      time: form.time + ":00",
      employee_id: form.employee_id,
      description: form.description.trim(),
      footage_link: form.footage_link || null,
      notes: form.notes || null,
      inputted_by: uid,
    };

    let errorMsg: string | null = null;
    if (form.id) {
      const { error } = await supabase.from("employee_violations").update(payload).eq("id", form.id);
      errorMsg = error?.message || null;
    } else {
      const { error } = await supabase.from("employee_violations").insert(payload);
      errorMsg = error?.message || null;
    }

    setSaving(false);

    if (errorMsg) notifyError(`Save failed: ${errorMsg}`);
    else {
      notifySuccess(form.id ? "✅ Violation updated." : "✅ Violation recorded.");
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-hemp-sage/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hemp-sage/40 bg-hemp-mist/40">
          <h3 className="text-lg font-semibold text-hemp-forest">
            {form.id ? "Edit Violation Record" : "Add Violation Record"}
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

          {/* Employee dropdown */}
          <div className="sm:col-span-2 flex flex-col">
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

          {/* Description */}
          <div className="sm:col-span-2 flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Description</label>
            <textarea
              placeholder="Describe the violation..."
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={3}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green resize-none"
            />
          </div>

          {/* Footage Link */}
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

          {/* Notes */}
          <div className="sm:col-span-2 flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Notes (Optional)</label>
            <textarea
              placeholder="Additional notes..."
              value={form.notes || ""}
              onChange={(e) => onChange("notes", e.target.value)}
              rows={2}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green resize-none"
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
            {form.id ? "Save Changes" : "Save Record"}
          </Button>
        </div>
      </div>
    </div>
  );
}
