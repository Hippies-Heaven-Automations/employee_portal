import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";

interface AnnouncementFormProps {
  announcement: any | null;
  onClose: () => void;
  onSave: () => void;
}

export default function AnnouncementForm({ announcement, onClose, onSave }: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: announcement?.title || "",
    content: announcement?.content || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: formData.title,
      content: formData.content,
      created_by: null, // placeholder until auth is added
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          {announcement ? "Edit Announcement" : "Add Announcement"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Announcement Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded p-2"
            required
          />

          <textarea
            name="content"
            placeholder="Enter announcement content..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full border rounded p-2 h-48"
            required
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="primary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}