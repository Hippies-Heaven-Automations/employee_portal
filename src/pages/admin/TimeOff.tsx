import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import TimeOffForm from "./TimeOffForm";
import { Edit3, Trash2, PlaneTakeoff, Search, ArrowUpDown } from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";

interface TimeOff {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  full_name: string | null;
}

export default function TimeOff() {
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TimeOff | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_time_off_with_profiles");
    if (error) notifyError(`Failed to load requests: ${error.message}`);
    else setTimeOffs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id: string) => {
    confirmAction(
      "Are you sure you want to delete this request?",
      async () => {
        const { error } = await supabase
          .from("time_off_requests")
          .delete()
          .eq("id", id);
        if (error) notifyError(`Delete failed: ${error.message}`);
        else {
          notifySuccess("Leave request deleted successfully.");
          fetchRequests();
        }
      },
      "Delete",
      "bg-red-600 hover:bg-red-700"
    );
  };

  const handleEdit = (request: TimeOff) => {
    setSelectedRequest(request);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedRequest(null);
    setIsFormOpen(true);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "denied":
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
      "<mark class='bg-hemp-sage/40 text-hemp-forest font-semibold'>$1</mark>"
    );
  };

  // 🌿 Filtering + sorting
  const filteredRequests = useMemo(() => {
    let filtered = timeOffs;
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.full_name?.toLowerCase().includes(lower) ||
          t.reason.toLowerCase().includes(lower)
      );
    }

    // Sort by start_date (newest to oldest)
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.start_date).getTime();
      const dateB = new Date(b.start_date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [timeOffs, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
        <h1 className="text-3xl font-bold text-hemp-forest">Leave Request</h1>
        <Button
          onClick={handleAdd}
          className="w-full sm:w-auto bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 shadow-card inline-flex justify-center items-center gap-2"
        >
          <PlaneTakeoff size={18} />
          <span className="hidden sm:inline">Add Request</span>
        </Button>
      </div>

      {/* 🌿 Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by employee or reason..."
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

      {/* 🌿 Table / Card */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading requests...</div>
        ) : paginated.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">No requests found.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-left">Start</th>
                    <th className="px-4 py-3 text-left">End</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr
                      key={t.id}
                      className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                    >
                      <td
                        className="px-4 py-3 font-medium text-gray-800"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(t.full_name || "Unknown"),
                        }}
                      />
                      <td className="px-4 py-3">
                        {new Date(t.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(t.end_date).toLocaleDateString()}
                      </td>
                      <td
                        className="px-4 py-3"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(t.reason),
                        }}
                      />
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusStyle(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleEdit(t)}
                          variant="outline"
                          className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                        >
                          <Edit3 size={15} />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          onClick={() => handleDelete(t.id)}
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

            {/* Mobile Cards */}
            <div className="block md:hidden divide-y divide-hemp-sage/40">
              {paginated.map((t) => (
                <div key={t.id} className="p-4 bg-white">
                  <h2
                    className="text-lg font-semibold text-hemp-forest"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(t.full_name || "Unknown"),
                    }}
                  />
                  <p className="text-sm text-gray-600">
                    📅 {new Date(t.start_date).toLocaleDateString()} –{" "}
                    {new Date(t.end_date).toLocaleDateString()}
                  </p>
                  <p
                    className="text-sm text-gray-600 mt-1"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(t.reason),
                    }}
                  />
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusStyle(
                        t.status
                      )}`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => handleEdit(t)}
                      variant="outline"
                      className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <Edit3 size={14} />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      onClick={() => handleDelete(t.id)}
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
        <TimeOffForm
          request={selectedRequest}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchRequests}
        />
      )}
    </section>
  );
}
