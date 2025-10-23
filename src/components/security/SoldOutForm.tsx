import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../Button";
import { notifyError, notifySuccess } from "../../utils/notify";
import { X, Save, Loader2 } from "lucide-react";

interface SoldOutInput {
  id?: string;
  date: string;
  time: string;
  employee_id: string | null;
  number_of_items: number;
  footage_link?: string | null;
  id_verified: "Yes" | "No" | "Not Needed";
  notes?: string | null;
}

interface EmployeeLite {
  id: string;
  full_name: string;
}

export default function SoldOutForm({
  initial,
  storeEmployees,
  onClose,
  onSaved,
}: {
  initial: Partial<SoldOutInput> | null; // ✅ replaces any | null
  storeEmployees: EmployeeLite[];
  onClose: () => void;
  onSaved: () => void;
}) {

  const now = useMemo(() => new Date(), []);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  const toHHMM = (d: Date) => d.toTimeString().slice(0, 5);

  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; full_name?: string } | null>(null);

  const [form, setForm] = useState<SoldOutInput>({
    id: initial?.id,
    date: initial?.date || toISODate(now),
    time: initial?.time ? initial.time.slice(0, 5) : toHHMM(now),
    employee_id: initial?.employee_id || null,
    number_of_items: initial?.number_of_items || 1,
    footage_link: initial?.footage_link || "",
    id_verified: initial?.id_verified || "Not Needed",
    notes: initial?.notes || "",
  });

  // Load logged-in user info
  useEffect(() => {
    const loadUser = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", uid)
        .single();
      if (profile) setCurrentUser(profile);
    };
    loadUser();
  }, []);

useEffect(() => {
  if (initial) {
    setForm({
      id: initial.id ?? undefined,
      date: initial.date ?? toISODate(now),
      time: initial.time?.slice(0, 5) ?? toHHMM(now),
      employee_id: initial.employee_id ?? null,
      number_of_items: initial.number_of_items ?? 1,
      footage_link: initial.footage_link ?? "",
      id_verified: initial.id_verified ?? "Not Needed",
      notes: initial.notes ?? "",
    });
  }
}, [initial, now]);

const onChange = <K extends keyof SoldOutInput>(
  key: K,
  value: SoldOutInput[K]
) => setForm((s) => ({ ...s, [key]: value }));


  const handleSave = async () => {
    if (!form.date || !form.time) {
      notifyError("Please provide both date and time.");
      return;
    }
    if (!form.employee_id) {
      notifyError("Please select the store employee.");
      return;
    }
    if (!form.number_of_items || form.number_of_items <= 0) {
      notifyError("Number of items must be at least 1.");
      return;
    }
    if (!currentUser?.id) {
      notifyError("Unable to identify current verifier. Please re-login.");
      return;
    }

    setSaving(true);

    const payload = {
      date: form.date,
      time: form.time + ":00",
      employee_id: form.employee_id,
      number_of_items: form.number_of_items,
      footage_link: form.footage_link || null,
      id_verified: form.id_verified,
      verifier_id: currentUser.id, // 👈 auto from logged-in user
      notes: form.notes || null,
      inputted_by: currentUser.id,
    };

    let errorMsg: string | null = null;
    if (form.id) {
      const { error } = await supabase.from("sold_out_logs").update(payload).eq("id", form.id);
      errorMsg = error?.message || null;
    } else {
      const { error } = await supabase.from("sold_out_logs").insert(payload);
      errorMsg = error?.message || null;
    }

    setSaving(false);

    if (errorMsg) notifyError(`Save failed: ${errorMsg}`);
    else {
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
            {form.id ? "Edit Sold-Out Log" : "Add Sold-Out Log"}
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

          {/* Employee */}
          <div className="flex flex-col sm:col-span-2">
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

          {/* Number of Items */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Number of Items</label>
            <input
              type="number"
              min={1}
              value={form.number_of_items}
              onChange={(e) => onChange("number_of_items", parseInt(e.target.value, 10) || 1)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            />
          </div>

          {/* ID Verified */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">ID Verified</label>
            <select
              value={form.id_verified}
              onChange={(e) => onChange("id_verified", e.target.value as SoldOutInput["id_verified"])}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            >
              <option>Yes</option>
              <option>No</option>
              <option>Not Needed</option>
            </select>
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
            <label className="text-sm text-gray-600 mb-1">Notes</label>
            <textarea
              placeholder="Additional notes..."
              value={form.notes || ""}
              onChange={(e) => onChange("notes", e.target.value)}
              rows={3}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green resize-none"
            />
          </div>

          {/* Verifier info */}
          {currentUser && (
            <div className="sm:col-span-2 text-sm text-gray-500 italic">
              Verified by: <span className="font-semibold text-hemp-forest">{currentUser.full_name || "Current User"}</span>
            </div>
          )}
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
