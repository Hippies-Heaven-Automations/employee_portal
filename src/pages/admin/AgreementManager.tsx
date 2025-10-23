import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Edit3,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";

interface Agreement {
  id: string;
  title: string;
  description: string | null;
  doc_links: string[];
  allowed_types: string[];
  created_at: string;
}

export default function AgreementManager() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Agreement | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    doc_links: [] as string[],
    allowed_types: ["VA", "Store"],
  });

  // 🌿 Fetch agreements
  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("agreements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAgreements((data as Agreement[]) || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load agreements.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  // 🌿 Handle save/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.title.trim()) return alert("Title is required");

      const payload = {
        title: form.title,
        description: form.description,
        doc_links: form.doc_links,
        allowed_types: form.allowed_types,
      };

      if (editing) {
        const { error } = await supabase
          .from("agreements")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("agreements").insert([payload]);
        if (error) throw error;
      }

      setForm({
        title: "",
        description: "",
        doc_links: [],
        allowed_types: ["VA", "Store"],
      });
      setEditing(null);
      setShowForm(false);
      fetchAgreements();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      alert(message);
    }
  };

  // 🌿 Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this agreement?")) return;
    const { error } = await supabase.from("agreements").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchAgreements();
  };

  // 🌿 Handle edit
  const handleEdit = (a: Agreement) => {
    setEditing(a);
    setShowForm(true);
    setForm({
      title: a.title,
      description: a.description || "",
      doc_links: a.doc_links || [],
      allowed_types: a.allowed_types || ["VA", "Store"],
    });
  };

  // 🌿 Manage document links
  const addDocLink = () => {
    setForm({ ...form, doc_links: [...form.doc_links, ""] });
  };

  const updateDocLink = (index: number, value: string) => {
    const newLinks = [...form.doc_links];
    newLinks[index] = value;
    setForm({ ...form, doc_links: newLinks });
  };

  const removeDocLink = (index: number) => {
    setForm({
      ...form,
      doc_links: form.doc_links.filter((_, i) => i !== index),
    });
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
        <Loader2 className="animate-spin mr-2" /> Loading agreements...
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-600">⚠️ {error}</div>;

  return (
    <section className="animate-fadeInUp mx-auto max-w-5xl p-6 text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest flex items-center gap-2">
          Manage Agreements
        </h1>
        <button
          onClick={() => {
            if (editing) setEditing(null);
            if (!showForm || editing) {
              setForm({
                title: "",
                description: "",
                doc_links: [],
                allowed_types: ["VA", "Store"],
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
              <ChevronDown size={18} /> Add Agreement
            </>
          )}
        </button>
      </div>

      {/* 🌿 Agreements Table */}
      {agreements.length === 0 ? (
        <p className="text-gray-500 italic text-center">No agreements found.</p>
      ) : (
        <div className="bg-white border border-hemp-sage rounded-xl shadow-sm overflow-hidden mb-6">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-hemp-sage/40 text-gray-800 font-semibold text-xs uppercase tracking-wide">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Allowed</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agreements.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition"
                >
                  <td className="p-3 font-medium text-hemp-forest">{a.title}</td>
                  <td className="p-3">{a.allowed_types?.join(", ")}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(a)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-hemp-green px-3 py-1 text-xs font-medium text-hemp-forest hover:bg-hemp-green hover:text-white transition"
                      >
                        <Edit3 size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(a.id)}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200 transition"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>

                      <button
                        onClick={() =>
                          window.open(
                            `/admin-dashboard/agreements/${a.id}/preview`,
                            "_blank"
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-md bg-hemp-green px-3 py-1 text-xs font-semibold text-white hover:bg-hemp-forest transition"
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

      {/* 🌿 Add/Edit Form */}
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
                placeholder="Agreement title"
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

            {/* Document Links */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-hemp-forest">
                  Document Links
                </label>
                <button
                  type="button"
                  onClick={addDocLink}
                  className="bg-hemp-green/10 text-hemp-green hover:bg-hemp-green/20 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
                >
                  <LinkIcon size={14} /> Add Link
                </button>
              </div>

              {form.doc_links.length > 0 && (
                <div className="space-y-3">
                  {form.doc_links.map((l, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 border border-hemp-sage/40 rounded-lg p-3 bg-hemp-mist/20"
                    >
                      <input
                        type="text"
                        placeholder="Document URL"
                        value={l}
                        onChange={(e) => updateDocLink(i, e.target.value)}
                        className="flex-1 border border-hemp-sage/60 rounded-md px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeDocLink(i)}
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
                      doc_links: [],
                      allowed_types: ["VA", "Store"],
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
                {editing ? "Update Agreement" : "Add Agreement"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
