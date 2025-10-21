import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import AnnouncementForm from "./AnnouncementForm";
import { Eye, Pencil, Trash2, Plus, Search, ArrowUpDown } from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewContent, setViewContent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) notifyError(`Error loading announcements: ${error.message}`);
    else setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    confirmAction("Delete this announcement?", async () => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);
      if (error) notifyError(`Error deleting: ${error.message}`);
      else {
        notifySuccess("✅ Announcement deleted successfully!");
        fetchAnnouncements();
      }
    }, "Delete", "bg-red-600 hover:bg-red-700");
  };

  const handleEdit = (a: Announcement) => {
    setSelectedAnnouncement(a);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedAnnouncement(null);
    setIsFormOpen(true);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const highlightMatch = (text: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(
      regex,
      `<mark class='bg-hemp-sage/40 text-hemp-forest font-semibold'>$1</mark>`
    );
  };

  
  const filteredAnnouncements = useMemo(() => {
    let filtered = announcements;

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(lower));
    }

    // 🌿 Sort by date
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [announcements, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredAnnouncements.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
        <h1 className="text-3xl font-bold text-hemp-forest">
          Announcements
        </h1>
        <Button
          onClick={handleAdd}
          className="w-full sm:w-auto bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 shadow-card inline-flex justify-center items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Announcement</span>
        </Button>
      </div>

      {/* 🌿 Smart Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green transition-all"
          />
        </div>

        {/* Sort Button */}
        <Button
          onClick={toggleSortOrder}
          variant="outline"
          className="w-full sm:w-auto border-hemp-green/60 text-hemp-forest hover:bg-hemp-green hover:text-white transition-all rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowUpDown size={18} />
          <span className="hidden sm:inline font-medium">
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </span>
        </Button>
      </div>

      {/* 🌿 Table / Cards */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading announcements...
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a) => (
                    <tr
                      key={a.id}
                      className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                    >
                      <td
                        className="px-4 py-3 font-medium text-gray-800"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(a.title),
                        }}
                      />
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 flex flex-wrap gap-2">
                        <Button
                          onClick={() => setViewContent(a.content)}
                          variant="ghost"
                          className="text-hemp-green hover:bg-hemp-sage/30 inline-flex items-center gap-1.5"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline">View</span>
                        </Button>

                        <Button
                          onClick={() => handleEdit(a)}
                          variant="outline"
                          className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                        >
                          <Pencil size={15} />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>

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
                  {paginated.length === 0 && (
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

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-hemp-sage/40">
              {paginated.map((a) => (
                <div key={a.id} className="p-4 bg-white">
                  <h2
                    className="text-lg font-semibold text-hemp-forest mb-1"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(a.title),
                    }}
                  />
                  <p className="text-sm text-gray-500 mb-3">
                    📅 {new Date(a.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setViewContent(a.content)}
                      variant="ghost"
                      className="text-hemp-green hover:bg-hemp-sage/30 px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      onClick={() => handleEdit(a)}
                      variant="outline"
                      className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <Pencil size={14} />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      onClick={() => handleDelete(a.id)}
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 🌿 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === page
                  ? "bg-hemp-green text-white"
                  : "bg-white text-hemp-forest border border-hemp-sage hover:bg-hemp-mist"
              }`}
            >
              {page}
            </button>
          ))}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Next
          </Button>
        </div>
      )}

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
