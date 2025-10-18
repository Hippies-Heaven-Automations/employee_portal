import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
  const [form, setForm] = useState({
    title: "",
    description: "",
    media: [] as MediaItem[],
    allowed_types: ["VA", "Store"],
    requires_signature: false,
  });

  // ✅ Load trainings
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

  // ✅ Handle save/update
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
      fetchTrainings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ✅ Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this training?")) return;
    const { error } = await supabase.from("trainings").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchTrainings();
  };

  // ✅ Handle edit
  const handleEdit = (t: Training) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || "",
      media: t.media || [],
      allowed_types: t.allowed_types || ["VA", "Store"],
      requires_signature: t.requires_signature || false,
    });
  };

  // ✅ Add or remove media items
  const addMedia = (type: "video" | "doc") => {
    setForm({
      ...form,
      media: [...form.media, { type, title: "", url: "" }],
    });
  };

  // ✅ Type-safe updater for any MediaItem field
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
    const newMedia = form.media.filter((_, i) => i !== index);
    setForm({ ...form, media: newMedia });
  };

  // ✅ Toggle employee types
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
      <div className="flex h-64 items-center justify-center text-gray-600">
        Loading trainings...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        ⚠️ {error}
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        Manage Trainings
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            placeholder="Training title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            rows={3}
            placeholder="Short description..."
          />
        </div>

        {/* Media Section */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Media (Videos / Documents)
            </label>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => addMedia("video")}
                className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
              >
                + Video
              </button>
              <button
                type="button"
                onClick={() => addMedia("doc")}
                className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
              >
                + Document
              </button>
            </div>
          </div>

          {form.media.length > 0 && (
            <div className="mt-2 space-y-3">
              {form.media.map((m, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-md border border-gray-200 p-3 sm:flex-row sm:items-center sm:space-x-2"
                >
                    <select
                        value={m.type}
                        onChange={(e) => updateMedia(i, "type", e.target.value as MediaItem["type"])}
                        className="rounded-md border border-gray-300 p-1 text-sm"
                    >
                        <option value="video">Video</option>
                        <option value="doc">Document</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Title"
                        value={m.title}
                        onChange={(e) => updateMedia(i, "title", e.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-300 p-1 text-sm sm:mt-0"
                    />
                    <input
                        type="text"
                        placeholder="URL"
                        value={m.url}
                        onChange={(e) => updateMedia(i, "url", e.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-300 p-1 text-sm sm:mt-0"
                    />
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="mt-2 rounded-md bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 sm:mt-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Allowed Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Allowed Employee Types
          </label>
          <div className="mt-1 flex space-x-4">
            {["VA", "Store"].map((type) => (
              <label key={type} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={form.allowed_types.includes(type)}
                  onChange={() => toggleType(type)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Requires Signature */}
        <div className="flex items-center space-x-2">
          <input
            id="requiresSignature"
            type="checkbox"
            checked={form.requires_signature}
            onChange={(e) =>
              setForm({ ...form, requires_signature: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="requiresSignature" className="text-sm text-gray-700">
            Requires employee signature before quiz
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
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
              className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            {editing ? "Update Training" : "Add Training"}
          </button>
        </div>
      </form>

      {/* Table */}
      {trainings.length === 0 ? (
        <p className="text-gray-600">No trainings found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Allowed</th>
                <th className="p-3">Signature</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{t.title}</td>
                  <td className="p-3">{t.allowed_types?.join(", ")}</td>
                  <td className="p-3 text-center">
                    {t.requires_signature ? "✅" : "—"}
                  </td>
                  <td className="p-3 text-center space-x-2">
  <button
    onClick={() => handleEdit(t)}
    className="rounded-md bg-yellow-400 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-500"
  >
    Edit
  </button>
  <button
    onClick={() => handleDelete(t.id)}
    className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
  >
    Delete
  </button>
  <button
    onClick={() =>
      window.open(`/admin-dashboard/trainings/${t.id}/preview`, "_blank")
    }
    className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
  >
    Preview
  </button>
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
