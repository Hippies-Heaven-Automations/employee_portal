import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Loader2, X, Megaphone, Sparkles } from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";

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
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 🌿 Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [formData.content]);

  // 🌿 Track word/char count
  useEffect(() => {
    setCharCount(formData.content.trim().length);
  }, [formData.content]);

  // 🌿 Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      created_by: null,
      updated_at: new Date().toISOString(),
    };

    const action = async () => {
      setSaving(true);
      const { error } = announcement
        ? await supabase
            .from("announcements")
            .update(payload)
            .eq("id", announcement.id)
        : await supabase.from("announcements").insert([payload]);

      if (error) {
        notifyError(
          `Error ${announcement ? "updating" : "creating"}: ${error.message}`
        );
      } else {
        notifySuccess(
          `Announcement ${
            announcement ? "updated" : "created"
          } successfully 🌿`
        );
        onSave();
        onClose();
      }
      setSaving(false);
    };

    if (announcement) confirmAction("Save changes to this announcement?", action);
    else await action();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-3 sm:px-6 py-6 animate-fadeIn">
      <div
        className="
          bg-white/90 border border-hemp-sage rounded-2xl shadow-2xl
          w-full max-w-2xl 
          flex flex-col 
          max-h-[calc(100vh-4rem)]
          overflow-hidden
          ring-1 ring-hemp-sage/30
          transition-all duration-300 backdrop-blur-xl
        "
      >
        {/* 🌿 Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-hemp-green/10 to-hemp-sage/20 border-b border-hemp-sage/40 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Megaphone className="text-hemp-green" size={22} />
            <h2 className="text-lg sm:text-xl font-semibold text-hemp-forest">
              {announcement ? "Edit Announcement" : "Create Announcement"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-hemp-sage/30 text-gray-600 hover:text-hemp-green transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* 🌿 Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-5 text-gray-700"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-hemp-forest mb-2"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              placeholder="e.g. System maintenance notice"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-hemp-sage/50 bg-white/60 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green text-sm sm:text-base transition-all"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-semibold text-hemp-forest mb-2"
            >
              Content
            </label>
            <div className="relative">
              <textarea
                id="content"
                ref={textareaRef}
                placeholder="Write your announcement details here..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="
                  w-full border border-hemp-sage/50 bg-white/70 rounded-lg 
                  px-4 py-3 text-gray-800 resize-none 
                  focus:outline-none focus:ring-2 focus:ring-hemp-green 
                  text-sm sm:text-base transition-all min-h-[8rem]
                "
                required
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {charCount} chars
              </div>
            </div>
          </div>
        </form>

        {/* 🌿 Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end sm:items-center gap-3 px-5 sm:px-6 py-4 border-t border-hemp-sage/40 bg-white/80 backdrop-blur-md sticky bottom-0">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg px-5 py-2 w-full sm:w-auto transition-all"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            onClick={handleSubmit}
            className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-5 sm:px-6 py-2 flex items-center justify-center gap-2 w-full sm:w-auto transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-hemp-sage" />
                Save Announcement
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
