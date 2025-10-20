import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Loader2, X, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
}
interface AnnouncementFormProps {
  announcement: Announcement | null;
  onClose: () => void;
  onSave: () => void;
}

export default function AnnouncementForm({
  announcement,
  onClose,
  onSave,
}: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: announcement?.title || "",
    content: announcement?.content || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      created_by: null,
      updated_at: new Date().toISOString(),
    };

    let res;
    if (announcement) {
      res = await supabase.from("announcements").update(payload).eq("id", announcement.id);
    } else {
      res = await supabase.from("announcements").insert([payload]);
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
      <div className="bg-white border border-hemp-sage rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-hemp-sage/30 border-b border-hemp-sage/50">
          <div className="flex items-center gap-2">
            <Megaphone className="text-hemp-green" size={22} />
            <h2 className="text-xl font-semibold text-gray-800">
              {announcement ? "Edit Announcement" : "Create Announcement"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-hemp-green transition"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 text-gray-700">
          {/* Title Input */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              placeholder="Enter announcement title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
              required
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              placeholder="Write your announcement details here..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full border border-hemp-sage/60 rounded-lg px-4 py-3 text-gray-800 h-48 resize-none focus:outline-none focus:ring-2 focus:ring-hemp-green"
              required
            />
          </div>

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
