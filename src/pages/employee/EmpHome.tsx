import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Link } from "react-router-dom";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function EmpHome() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  // 🌿 Fetch latest announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, content, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching announcements:", error);
    } else {
      setAnnouncements(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <section className="p-6 max-w-5xl mx-auto animate-fadeInUp">
      {/* 🌿 Welcome Header */}
      <header className="text-center sm:text-left mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-hemp-forest mb-2">
          Welcome to Your Dashboard 🌿
        </h1>
        <p className="text-hemp-ink/70 text-sm sm:text-base">
          Stay updated with the latest news and announcements from your team.
        </p>
      </header>

      {/* 🌿 Latest Announcements */}
      <h2 className="text-lg sm:text-xl font-semibold text-hemp-green mb-4">
        Latest Announcements
      </h2>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-hemp-sage/30 rounded-lg shadow-sm"
            ></div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-gray-600 italic text-center">
          No announcements available.
        </p>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <article
              key={a.id}
              className="border border-hemp-sage/50 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-hemp-forest">
                    {a.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(a.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="self-start sm:self-center text-hemp-green hover:bg-hemp-sage/40 text-sm px-3 py-2"
                  onClick={() => setSelectedAnnouncement(a)}
                >
                  View
                </Button>
              </div>
            </article>
          ))}

          {/* 🌿 Link to all announcements */}
          <div className="flex justify-end mt-6">
            <Link to="/employee-dashboard/announcements">
              <Button
                variant="outline"
                className="border-hemp-green text-hemp-forest hover:bg-hemp-sage/40"
              >
                View All Announcements
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 🌿 Modal View */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-all animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-hemp-forest mb-3">
              {selectedAnnouncement.title}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
              {selectedAnnouncement.content}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Posted on{" "}
              {new Date(selectedAnnouncement.created_at).toLocaleString(
                undefined,
                { dateStyle: "medium", timeStyle: "short" }
              )}
            </p>
            <div className="flex justify-end">
              <Button
                onClick={() => setSelectedAnnouncement(null)}
                className="bg-hemp-green text-white hover:bg-hemp-forest"
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
