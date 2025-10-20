import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Edit3,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  Video,
  FileText,
} from "lucide-react";

interface MediaItem {
  type: "video" | "doc";
  title: string;
  url: string;
}

interface Training {
  id: string;
  title: string;
  description: string | null;
  media: MediaItem[];
  allowed_types: string[];
  requires_signature: boolean;
  created_at: string;
}

export default function TrainingManager() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Training | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    media: [] as MediaItem[],
    allowed_types: ["VA", "Store"],
    requires_signature: false,
  });

  // 🌿 Fetch trainings
  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTrainings((data as Training[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  // 🌿 Handle save/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.title.trim()) return alert("Title is required");

      const payload = {
        title: form.title,
        description: form.description,
        media: form.media,
        allowed_types: form.allowed_types,
        requires_signature: form.requires_signature,
      };

      if (editing) {
        const { error } = await supabase
          .from("trainings")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("trainings").insert([payload]);
        if (error) throw error;
      }

      setForm({
        title: "",
        description: "",
        media: [],
        allowed_types: ["VA", "Store"],
        requires_signature: false,
      });
      setEditing(null);
      setShowForm(false);
      fetchTrainings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 🌿 Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this training?")) return;
    const { error } = await supabase.from("trainings").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchTrainings();
  };

  // 🌿 Handle edit
  const handleEdit = (t: Training) => {
    setEditing(t);
    setShowForm(true);
    setForm({
      title: t.title,
      description: t.description || "",
      media: t.media || [],
      allowed_types: t.allowed_types || ["VA", "Store"],
      requires_signature: t.requires_signature || false,
    });
  };

  // 🌿 Manage media
  const addMedia = (type: "video" | "doc") => {
    setForm({
      ...form,
      media: [...form.media, { type, title: "", url: "" }],
    });
  };

  const updateMedia = <K extends keyof MediaItem>(
    index: number,
    field: K,
    value: MediaItem[K]
  ) => {
    const newMedia = [...form.media];
    newMedia[index] = { ...newMedia[index], [field]: value };
    setForm({ ...form, media: newMedia });
  };

  const removeMedia = (index: number) => {
    setForm({ ...form, media: form.media.filter((_, i) => i !== index) });
  };

  // 🌿 Allowed types toggle
  const toggleType = (type: string) => {
    setForm((prev) => {
      const exists = prev.allowed_types.includes(type);
      return {
        ...prev,
        allowed_types: exists
          ? prev.allowed_types.filter((t) => t !== type)
          : [...prev.allowed_types, type],
      };
    });
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        <Loader2 className="animate-spin mr-2" /> Loading trainings...
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-600">⚠️ {error}</div>;

  return (
    <section className="animate-fadeInUp mx-auto max-w-5xl p-6 text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest flex items-center gap-2">
          Manage Trainings
        </h1>
        <button
          onClick={() => {
            if (editing) setEditing(null);
            // Always reset the form when toggling to "Add Training"
            if (!showForm || editing) {
              setForm({
                title: "",
                description: "",
                media: [],
                allowed_types: ["VA", "Store"],
                requires_signature: false,
              });
            }

            setShowForm((prev) => !prev);
          }}
          className="flex items-center gap-2 rounded-md bg-hemp-green text-white px-4 py-2 text-sm font-medium hover:bg-hemp-forest transition"
        >
          {showForm ? (
            <>
              <ChevronUp size={18} /> Hide Form
            </>
          ) : (
            <>
              <ChevronDown size={18} /> Add Training
            </>
          )}
        </button>
      </div>

      {/* 🌿 Trainings Table */}
      {trainings.length === 0 ? (
        <p className="text-gray-500 italic text-center">No trainings found.</p>
      ) : (
        <div className="bg-white border border-hemp-sage rounded-xl shadow-sm overflow-hidden mb-6">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-hemp-sage/40 text-gray-800 font-semibold text-xs uppercase tracking-wide">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Allowed</th>
                <th className="p-3 text-center">Signature</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition"
                >
                  <td className="p-3 font-medium text-hemp-forest">{t.title}</td>
                  <td className="p-3">{t.allowed_types?.join(", ")}</td>
                  <td className="p-3 text-center">
                    {t.requires_signature ? "✅" : "—"}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(t)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-hemp-green px-3 py-1 text-xs font-medium text-hemp-forest hover:bg-hemp-green hover:text-white transition"
                        aria-label="Edit training"
                      >
                        <Edit3 size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200 transition"
                        aria-label="Delete training"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>

                      {/* Preview */}
                      <button
                        onClick={() =>
                          window.open(`/admin-dashboard/trainings/${t.id}/preview`, "_blank")
                        }
                        className="inline-flex items-center gap-1.5 rounded-md bg-hemp-green px-3 py-1 text-xs font-semibold text-white hover:bg-hemp-forest transition"
                        aria-label="Preview training"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🌿 Collapsible Add/Edit Form */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showForm ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-hemp-sage rounded-xl shadow-sm p-6 space-y-5"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-hemp-forest mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-hemp-sage/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green"
                placeholder="Training title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-hemp-forest mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border border-hemp-sage/60 px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-hemp-green"
                placeholder="Short description..."
              />
            </div>

            {/* Media */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-hemp-forest">
                  Media Files
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addMedia("video")}
                    className="bg-hemp-green/10 text-hemp-green hover:bg-hemp-green/20 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
                  >
                    <Video size={14} /> Add Video
                  </button>
                  <button
                    type="button"
                    onClick={() => addMedia("doc")}
                    className="bg-hemp-sage/40 hover:bg-hemp-sage/60 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
                  >
                    <FileText size={14} /> Add Document
                  </button>
                </div>
              </div>

              {form.media.length > 0 && (
                <div className="space-y-3">
                  {form.media.map((m, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 border border-hemp-sage/40 rounded-lg p-3 bg-hemp-mist/20"
                    >
                      <select
                        value={m.type}
                        onChange={(e) =>
                          updateMedia(i, "type", e.target.value as MediaItem["type"])
                        }
                        className="border border-hemp-sage/60 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="video">Video</option>
                        <option value="doc">Document</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Title"
                        value={m.title}
                        onChange={(e) => updateMedia(i, "title", e.target.value)}
                        className="flex-1 border border-hemp-sage/60 rounded-md px-2 py-1 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="URL"
                        value={m.url}
                        onChange={(e) => updateMedia(i, "url", e.target.value)}
                        className="flex-1 border border-hemp-sage/60 rounded-md px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-md px-2 py-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Allowed types */}
            <div>
              <label className="block text-sm font-semibold text-hemp-forest mb-1">
                Allowed Employee Types
              </label>
              <div className="flex gap-4">
                {["VA", "Store"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.allowed_types.includes(type)}
                      onChange={() => toggleType(type)}
                      className="text-hemp-green focus:ring-hemp-green"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div className="flex items-center gap-2">
              <input
                id="requiresSignature"
                type="checkbox"
                checked={form.requires_signature}
                onChange={(e) =>
                  setForm({ ...form, requires_signature: e.target.checked })
                }
                className="text-hemp-green focus:ring-hemp-green"
              />
              <label htmlFor="requiresSignature" className="text-sm text-gray-700">
                Requires employee signature before quiz
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-hemp-sage/40">
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({
                      title: "",
                      description: "",
                      media: [],
                      allowed_types: ["VA", "Store"],
                      requires_signature: false,
                    });
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-hemp-green hover:bg-hemp-forest text-white rounded-md px-5 py-2 text-sm font-semibold"
              >
                {editing ? "Update Training" : "Add Training"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
