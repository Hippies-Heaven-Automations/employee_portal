import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import AnnouncementForm from "./AnnouncementForm";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewContent, setViewContent] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchAnnouncements();
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedAnnouncement(null);
    setIsFormOpen(true);
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2 sm:mb-0">
          Announcements
        </h1>
        <Button
          onClick={handleAdd}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 shadow-card"
        >
          + Add Announcement
        </Button>
      </div>

      {/* 🌿 Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading announcements...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {a.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      {/* 👁 View */}
                      <Button
                        onClick={() => setViewContent(a.content)}
                        variant="ghost"
                        className="text-hemp-green hover:bg-hemp-sage/30 inline-flex items-center gap-1.5"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">View</span>
                      </Button>

                      {/* ✏️ Edit */}
                      <Button
                        onClick={() => handleEdit(a)}
                        variant="outline"
                        className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                      >
                        <Pencil size={15} />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

                      {/* 🗑 Delete */}
                      <Button
                        onClick={() => handleDelete(a.id)}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-6 text-center text-gray-500 italic"
                    >
                      No announcements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌿 Add/Edit Modal */}
      {isFormOpen && (
        <AnnouncementForm
          announcement={selectedAnnouncement}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchAnnouncements}
        />
      )}

      {/* 🌿 View Modal */}
      {viewContent && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 border border-hemp-sage animate-fadeInUp">
            <h2 className="text-xl font-bold text-hemp-forest mb-4">
              Announcement Details
            </h2>
            <div
              className="prose max-w-none text-gray-700 mb-6"
              dangerouslySetInnerHTML={{ __html: viewContent }}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => setViewContent(null)}
                className="bg-hemp-green hover:bg-hemp-forest text-white rounded-lg px-6 py-2"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
