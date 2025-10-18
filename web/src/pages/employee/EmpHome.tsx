import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Link } from "react-router-dom";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}
// const { data } = await supabase.from("profiles").select("id").limit(1);
// console.log(data);

const { data } = await supabase.auth.getUser();
console.log(data.user?.id);

export default function EmpHome() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, content, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) console.error(error);
    else setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>

      <h2 className="text-xl font-semibold mb-2">Latest Announcements</h2>
      {loading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <Button variant="ghost" onClick={() => setSelectedAnnouncement(a)}>View</Button>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                {new Date(a.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}

          <div className="flex justify-end mt-4">
            <Link to="/employee-dashboard/announcements">
              <Button variant="outline">View All Announcements</Button>
            </Link>
          </div>
        </div>
      )}

      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">{selectedAnnouncement.title}</h2>
            <div className="prose max-w-none mb-4">
              {selectedAnnouncement.content}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setSelectedAnnouncement(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}