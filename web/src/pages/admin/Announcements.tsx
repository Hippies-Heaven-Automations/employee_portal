import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import AnnouncementForm from "./AnnouncementForm";

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

  const [viewContent, setViewContent] = useState<string | null>(null);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Button onClick={handleAdd}>Add Announcement</Button>
      </div>

      {loading ? (
        <p>Loading announcements...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.title}</td>
                  <td className="p-2">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="p-2 space-x-2">
                    <Button onClick={() => setViewContent(a.content)} variant="ghost">View</Button>
                    <Button onClick={() => handleEdit(a)} variant="outline">Edit</Button>
                    <Button onClick={() => handleDelete(a.id)} variant="ghost">Delete</Button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No announcements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <AnnouncementForm
          announcement={selectedAnnouncement}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchAnnouncements}
        />
      )}

      {viewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Announcement</h2>
            <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: viewContent }} />
            <div className="flex justify-end">
              <Button onClick={() => setViewContent(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
