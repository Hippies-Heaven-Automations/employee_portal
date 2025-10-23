import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../Button";
import { notifyError, notifySuccess } from "../../utils/notify";
import { X, Save, Loader2 } from "lucide-react";

interface IncidentInput {
  id?: string;
  date: string;
  time: string;
  description: string;
  footage_link?: string | null;
  management_contacted: boolean;
  police_contacted: boolean;
}

export default function IncidentReportForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Partial<IncidentInput> | null; // ✅ replaces any | null
  onClose: () => void;
  onSaved: () => void;
}) {

  const now = useMemo(() => new Date(), []);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  const toHHMM = (d: Date) => d.toTimeString().slice(0, 5);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<IncidentInput>({
    id: initial?.id,
    date: initial?.date || toISODate(now),
    time: initial?.time ? initial.time.slice(0, 5) : toHHMM(now),
    description: initial?.description || "",
    footage_link: initial?.footage_link || "",
    management_contacted: !!initial?.management_contacted,
    police_contacted: !!initial?.police_contacted,
  });

useEffect(() => {
  if (initial) {
    setForm({
      id: initial.id ?? undefined,
      date: initial.date ?? toISODate(now),
      time: initial.time?.slice(0, 5) ?? toHHMM(now),
      description: initial.description ?? "",
      footage_link: initial.footage_link ?? "",
      management_contacted: !!initial.management_contacted,
      police_contacted: !!initial.police_contacted,
    });
  }
}, [initial, now]);


const onChange = <K extends keyof IncidentInput>(
  key: K,
  value: IncidentInput[K]
) => setForm((s) => ({ ...s, [key]: value }));


  const handleSave = async () => {
    if (!form.date || !form.time) {
      notifyError("Please provide both date and time.");
      return;
    }
    if (!form.description.trim()) {
      notifyError("Please provide an incident description.");
      return;
    }

    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id || null;

    const payload = {
      date: form.date,
      time: form.time + ":00",
      description: form.description.trim(),
      footage_link: form.footage_link || null,
      management_contacted: form.management_contacted,
      police_contacted: form.police_contacted,
      inputted_by: uid,
    };

    let errorMsg: string | null = null;
    if (form.id) {
      const { error } = await supabase.from("incident_reports").update(payload).eq("id", form.id);
      errorMsg = error?.message || null;
    } else {
      const { error } = await supabase.from("incident_reports").insert(payload);
      errorMsg = error?.message || null;
    }

    setSaving(false);

    if (errorMsg) notifyError(`Save failed: ${errorMsg}`);
    else {
      notifySuccess(form.id ? "✅ Report updated." : "✅ Report added.");
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-hemp-sage/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hemp-sage/40 bg-hemp-mist/40">
          <h3 className="text-lg font-semibold text-hemp-forest">
            {form.id ? "Edit Incident Report" : "Add Incident Report"}
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

          {/* Description */}
          <div className="sm:col-span-2 flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Incident Description</label>
            <textarea
              placeholder="Describe the incident..."
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={4}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green resize-none"
            />
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

          {/* Contacted management */}
          <div className="flex items-center gap-2 sm:col-span-1">
            <input
              type="checkbox"
              id="management_contacted"
              checked={form.management_contacted}
              onChange={(e) => onChange("management_contacted", e.target.checked)}
              className="w-4 h-4 accent-hemp-green"
            />
            <label htmlFor="management_contacted" className="text-sm text-gray-700">
              Contacted Management?
            </label>
          </div>

          {/* Contacted police */}
          <div className="flex items-center gap-2 sm:col-span-1">
            <input
              type="checkbox"
              id="police_contacted"
              checked={form.police_contacted}
              onChange={(e) => onChange("police_contacted", e.target.checked)}
              className="w-4 h-4 accent-hemp-green"
            />
            <label htmlFor="police_contacted" className="text-sm text-gray-700">
              Contacted Police?
            </label>
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
            {form.id ? "Save Changes" : "Save Report"}
          </Button>
        </div>
      </div>
    </div>
  );
}
