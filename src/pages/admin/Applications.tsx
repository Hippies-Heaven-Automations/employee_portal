import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import {
  FileText,
  Eye,
  Trash2,
  Search,
  ArrowUpDown,
  ClipboardList,
} from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";

interface Application {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
  message: string;
  resume_url: string;
  preferred_interview_date: string | null;
  preferred_interview_time: string | null;
  status: string;
  created_at: string;
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) notifyError(`Error loading applications: ${error.message}`);
    else setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id: string) => {
    confirmAction("Delete this application?", async () => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) notifyError(`Error deleting application: ${error.message}`);
      else {
        notifySuccess("Application deleted successfully.");
        fetchApplications();
      }
    }, "Delete", "bg-red-600 hover:bg-red-700");
  };

  const handleEdit = (app: Application) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedApp) return;
    const newStatus = e.target.value;

    confirmAction("Update application status?", async () => {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", selectedApp.id);

      if (error) notifyError(`Error updating status: ${error.message}`);
      else {
        notifySuccess("Application status updated.");
        setSelectedApp({ ...selectedApp, status: newStatus });
        fetchApplications();
      }
    });
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "declined":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const highlightMatch = (text: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(
      regex,
      `<mark class='bg-hemp-sage/40 text-hemp-forest font-semibold'>$1</mark>`
    );
  };

  // 🌿 Filter + sort
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.full_name.toLowerCase().includes(lower) ||
          a.email.toLowerCase().includes(lower)
      );
    }

    // Sort by date (newest or oldest)
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [applications, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
        <h1 className="text-3xl font-bold text-hemp-forest">Job Applications</h1>
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
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green transition-all"
          />
        </div>

        {/* Sort */}
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

      {/* 🌿 Table or Card view */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading applications...</div>
        ) : paginated.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">No applications found.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Resume</th>
                    <th className="px-4 py-3 text-left">Interview</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a) => (
                    <tr
                      key={a.id}
                      className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition-all"
                    >
                      <td
                        className="px-4 py-3 font-medium text-gray-800"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(a.full_name),
                        }}
                      />
                      <td
                        className="px-4 py-3"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(a.email),
                        }}
                      />
                      <td className="px-4 py-3">{a.contact_number}</td>
                      <td className="px-4 py-3">
                        {a.resume_url ? (
                          <a
                            href={a.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-hemp-green hover:underline inline-flex items-center gap-1"
                          >
                            <FileText size={15} /> Resume
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {a.preferred_interview_date || "N/A"}{" "}
                        {a.preferred_interview_time || ""}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusColor(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleEdit(a)}
                          variant="outline"
                          className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                        >
                          <Eye size={15} />
                          <span className="hidden sm:inline">View</span>
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
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-hemp-sage/40">
              {paginated.map((a) => (
                <div key={a.id} className="p-4 bg-white">
                  <h2
                    className="text-lg font-semibold text-hemp-forest"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(a.full_name),
                    }}
                  />
                  <p
                    className="text-sm text-gray-500"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(a.email),
                    }}
                  />
                  <p className="text-sm text-gray-600">📞 {a.contact_number}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    📅 {a.preferred_interview_date || "N/A"}{" "}
                    {a.preferred_interview_time || ""}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusColor(
                        a.status
                      )}`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => handleEdit(a)}
                      variant="outline"
                      className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">View</span>
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

      {/* 🌿 Modal */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white border border-hemp-sage rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeInUp">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-hemp-sage/30 border-b border-hemp-sage/50">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-hemp-green" size={22} />
                <h2 className="text-xl font-semibold text-hemp-forest">
                  Application Details
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-hemp-green transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-3 text-gray-700">
              <p>
                <strong>Name:</strong> {selectedApp.full_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedApp.email}
              </p>
              <p>
                <strong>Contact:</strong> {selectedApp.contact_number}
              </p>
              <p>
                <strong>Message:</strong> {selectedApp.message || "N/A"}
              </p>
              <p>
                <strong>Resume:</strong>{" "}
                {selectedApp.resume_url ? (
                  <a
                    href={selectedApp.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-hemp-green hover:underline inline-flex items-center gap-1"
                  >
                    <FileText size={15} /> View
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong>Preferred Interview:</strong>{" "}
                {selectedApp.preferred_interview_date || "N/A"}{" "}
                {selectedApp.preferred_interview_time || ""}
              </p>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Application Status
                </label>
                <select
                  value={selectedApp.status}
                  onChange={handleStatusChange}
                  className={`w-full border rounded-lg px-4 py-2 capitalize font-medium focus:outline-none focus:ring-2 focus:ring-hemp-green ${getStatusColor(
                    selectedApp.status
                  )}`}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-hemp-sage/40">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg px-6 py-2 transition"
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
