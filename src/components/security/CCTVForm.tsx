import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../Button";
import { notifyError, notifySuccess } from "../../utils/notify";
import { X, Save, Loader2 } from "lucide-react";

type BatteryType = "battery" | "wired" | "solar";
type CameraStatus = "active" | "disabled";

interface CameraInput {
  id?: string;
  camera_name: string;
  battery_type: BatteryType;
  status: CameraStatus;
  notes?: string | null;
  battery_percentage?: number; // optional on create (defaults 100 if omitted)
}

interface Camera {
  id: string;
  camera_name: string;
  battery_type: string; // ← database version
  status: string;
  notes?: string | null;
  battery_percentage?: number;
}

function toCameraInput(camera: Camera): CameraInput {
  const validBatteryTypes = ["battery", "wired", "solar"] as const;
  const validStatuses = ["active", "disabled"] as const;

  const battery =
    validBatteryTypes.includes(camera.battery_type as BatteryType)
      ? (camera.battery_type as BatteryType)
      : "battery";

  const status =
    validStatuses.includes(camera.status as CameraStatus)
      ? (camera.status as CameraStatus)
      : "active";

  return {
    id: camera.id,
    camera_name: camera.camera_name,
    battery_type: battery, // ✅ explicitly typed as BatteryType
    status: status,         // ✅ explicitly typed as CameraStatus
    notes: camera.notes || "",
    battery_percentage:
      typeof camera.battery_percentage === "number"
        ? camera.battery_percentage
        : 100,
  };
}


export default function CctvForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Camera | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const now = useMemo(() => new Date(), []);
  const [saving, setSaving] = useState(false);

const [form, setForm] = useState<CameraInput>(
  initial ? toCameraInput(initial) : {
    camera_name: "",
    battery_type: "battery",
    status: "active",
    notes: "",
    battery_percentage: 100,
  }
);


  useEffect(() => {
  if (initial) {
    setForm(toCameraInput(initial)); // ✅ reuse the converter, ensures type safety
  }
}, [initial]);


  const onChange = <K extends keyof CameraInput>(
    key: K,
    value: CameraInput[K]
  ) => setForm((s) => ({ ...s, [key]: value }));

  const handleSave = async () => {
    if (!form.camera_name.trim()) {
      notifyError("Camera name is required.");
      return;
    }
    if (!["battery", "wired", "solar"].includes(form.battery_type)) {
      notifyError("Invalid battery type.");
      return;
    }
    if (!["active", "disabled"].includes(form.status)) {
      notifyError("Invalid status.");
      return;
    }

    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id || null;

    const payload = {
      camera_name: form.camera_name.trim(),
      battery_type: form.battery_type,
      status: form.status,
      notes: form.notes || null,
      battery_percentage:
        typeof form.battery_percentage === "number" ? Math.max(0, Math.min(100, form.battery_percentage)) : 100,
      updated_by: uid,
      updated_at: now.toISOString(),
    };

    let errorMsg: string | null = null;
    if (form.id) {
      const { error } = await supabase.from("cctv_cameras").update(payload).eq("id", form.id);
      errorMsg = error?.message || null;
    } else {
      // Default created_at handled by DB; set initial percentage & insert a log
      const { data, error } = await supabase
        .from("cctv_cameras")
        .insert(payload)
        .select("id")
        .single();

      errorMsg = error?.message || null;

      if (!errorMsg && data?.id) {
        await supabase.from("cctv_logs").insert({
          camera_id: data.id,
          battery_percentage: payload.battery_percentage,
          updated_by: uid,
          created_at: now.toISOString(),
          note: "Camera created",
        });
      }
    }

    setSaving(false);

    if (errorMsg) notifyError(`Save failed: ${errorMsg}`);
    else {
      notifySuccess(form.id ? "✅ Camera updated." : "✅ Camera created.");
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-hemp-sage/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hemp-sage/40 bg-hemp-mist/40">
          <h3 className="text-lg font-semibold text-hemp-forest">
            {form.id ? "Edit Camera" : "Add Camera"}
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
          {/* Camera name */}
          <div className="sm:col-span-2 flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Camera Name</label>
            <input
              type="text"
              value={form.camera_name}
              onChange={(e) => onChange("camera_name", e.target.value)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            />
          </div>

          {/* Battery type */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Battery Type</label>
            <select
              value={form.battery_type}
              onChange={(e) => onChange("battery_type", e.target.value as BatteryType)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green capitalize"
            >
              <option value="battery">battery</option>
              <option value="wired">wired</option>
              <option value="solar">solar</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => onChange("status", e.target.value as CameraStatus)}
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green capitalize"
            >
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
          </div>

          {/* Battery % (optional at create/edit) */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Initial Battery %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.battery_percentage ?? 100}
              onChange={(e) =>
                onChange("battery_percentage", Math.max(0, Math.min(100, parseInt(e.target.value || "0", 10))))
              }
              className="rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2 flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Notes</label>
            <textarea
              placeholder="Optional notes about placement, mounting, etc."
              value={form.notes || ""}
              onChange={(e) => onChange("notes", e.target.value)}
              rows={3}
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
            {form.id ? "Save Changes" : "Save Camera"}
          </Button>
        </div>
      </div>
    </div>
  );
}
