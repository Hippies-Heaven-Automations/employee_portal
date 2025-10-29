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
  Calendar,
} from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";

interface ApplicationRow {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
  message: string;
  resume_url: string;
  status: string;
  created_at: string;

  // scheduling
  interview_schedules: string[] | null; // array of ISO strings in CT
  selected_schedule: string | null; // ISO timestamptz
  admin_notes: string | null;

  // relation
  job_openings?: {
    title: string;
    employment_type?: "VA" | "Store";
  };
}

export default function Applications() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // =========================
  // Helpers
  // =========================

  const formatCT = (iso: string | null | undefined) => {
    if (!iso) return "N/A";
    try {
      return new Date(iso).toLocaleString("en-US", {
        timeZone: "America/Chicago", // Illinois time
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const summarizeSlots = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return "N/A";
    return arr
      .map((s) => formatCT(s))
      .join(", ");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "Declined":
      case "declined":
        return "bg-red-100 text-red-700 border-red-200";
      case "interview_set":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-gray-200 text-gray-700 border-gray-300";
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

  const fetchApplications = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        full_name,
        email,
        contact_number,
        message,
        resume_url,
        status,
        created_at,
        interview_schedules,
        selected_schedule,
        admin_notes,
        job_openings:job_id (
          title,
          employment_type
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      notifyError(`Error loading applications: ${error.message}`);
    } else {
      const mapped = (data || []).map(
        (a: {
          id: string;
          full_name: string;
          email: string;
          contact_number: string;
          message: string;
          resume_url: string;
          status: string;
          created_at: string;
          interview_schedules: string[] | null;
          selected_schedule: string | null;
          admin_notes: string | null;
          job_openings?: { title: string; employment_type?: "VA" | "Store" }[] | null;
        }) => ({
          ...a,
          job_openings: a.job_openings?.[0] ?? null, // ✅ flatten array to single object or null
        })
      ) as ApplicationRow[];

      setApplications(mapped);
    }

    setLoading(false);
  };


  useEffect(() => {
    fetchApplications();
  }, []);

  // =========================
  // Actions
  // =========================

  const handleDelete = async (id: string) => {
    confirmAction(
      "Delete this application?",
      async () => {
        const { error } = await supabase
          .from("applications")
          .delete()
          .eq("id", id);

        if (error) {
          notifyError(`Error deleting application: ${error.message}`);
        } else {
          notifySuccess("Application deleted.");
          fetchApplications();
        }
      },
      "Delete",
      "bg-red-600 hover:bg-red-700"
    );
  };

  const openModal = (app: ApplicationRow) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  // Admin picks one interview time to confirm
  const handleSetInterviewFromModal = async (slotISO: string) => {
  if (!selectedApp) return;
  confirmAction(
    `Confirm interview for:\n${formatCT(slotISO)} (CT)?`,
    async () => {
      const { error } = await supabase
        .from("applications")
        .update({
          selected_schedule: slotISO,
          status: "interview_set",
        })
        .eq("id", selectedApp.id);

      if (error) {
        notifyError(`Error setting interview: ${error.message}`);
      } else {
        notifySuccess("Interview scheduled!");

        // ✅ Send interview confirmation email
        try {
          const res = await fetch(
            "https://vnxftftsglekhpczgbcf.functions.supabase.co/send-interview-confirmation",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: selectedApp.full_name,
                email: selectedApp.email,
                jobTitle: selectedApp.job_openings?.title,
                interviewTime: slotISO,
              }),
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to send email");
          console.log("✅ Interview email sent:", data);
        } catch (emailErr) {
          console.error(emailErr);
          notifyError("Interview set, but email failed to send.");
        }

        setSelectedApp({
          ...selectedApp,
          selected_schedule: slotISO,
          status: "interview_set",
        });
        fetchApplications();
      }
    }
  );
};

  // Manual status edit dropdown in modal
  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!selectedApp) return;
    const newStatus = e.target.value;

    confirmAction("Update application status?", async () => {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", selectedApp.id);

      if (error) {
        notifyError(`Error updating status: ${error.message}`);
      } else {
        notifySuccess("Status updated.");
        setSelectedApp({ ...selectedApp, status: newStatus });
        fetchApplications();
      }
    });
  };

  // =========================
  // Filtering / Sorting / Pagination
  // =========================
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.full_name.toLowerCase().includes(lower) ||
          a.email.toLowerCase().includes(lower) ||
          (a.job_openings?.title || "").toLowerCase().includes(lower)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [applications, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredApplications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // =========================
  // UI
  // =========================
  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
        <h1 className="text-3xl font-bold text-hemp-forest">Job Applications</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search applicants or job title…"
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

      {/* Table / Cards */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading applications...
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">
            No applications found.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Position</th>
                    <th className="px-4 py-3 text-left">Preferred Slots</th>
                    <th className="px-4 py-3 text-left">Selected Slot</th>
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
                      <td className="px-4 py-3">
                        {a.job_openings?.title || "(Deleted Job)"}
                      </td>
                      <td className="px-4 py-3">
                        {summarizeSlots(a.interview_schedules)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCT(a.selected_schedule)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusColor(
                            a.status
                          )}`}
                        >
                          {a.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex flex-wrap gap-2">
                        <Button
                          onClick={() => openModal(a)}
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

            {/* Mobile Cards */}
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
                  <p className="text-sm text-gray-600">
                    📄 {a.job_openings?.title || "(Deleted Job)"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Preferred: {summarizeSlots(a.interview_schedules)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Selected: {formatCT(a.selected_schedule)}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusColor(
                        a.status
                      )}`}
                    >
                      {a.status || "pending"}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => openModal(a)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Prev
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (page) => (
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
            )
          )}

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-2 sm:px-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[90vh] animate-fadeInUp">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-gray-700" size={20} />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Application Details
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 py-5 space-y-4 text-gray-700 text-sm sm:text-base">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium text-gray-800">{selectedApp.full_name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium break-all">{selectedApp.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Contact #</p>
                <p className="font-medium">{selectedApp.contact_number || "N/A"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Applying for</p>
                <p className="font-medium">
                  {selectedApp.job_openings?.title || "(Deleted Job)"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Message</p>
                <p className="font-medium whitespace-pre-wrap">
                  {selectedApp.message || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Resume</p>
                {selectedApp.resume_url ? (
                  <a
                    href={selectedApp.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <FileText size={15} /> View Resume
                  </a>
                ) : (
                  <p className="font-medium">N/A</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar size={14} /> Preferred interview slots (CT)
                </p>
                {selectedApp.interview_schedules?.length ? (
                  <ul className="text-sm text-gray-800 list-disc list-inside space-y-1">
                    {selectedApp.interview_schedules.map((slot, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <span>{formatCT(slot)}</span>
                        <button
                          onClick={() => handleSetInterviewFromModal(slot)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 whitespace-nowrap"
                        >
                          Set This
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-medium">No slots provided</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500">Selected interview slot</p>
                <p className="font-medium">{formatCT(selectedApp.selected_schedule)}</p>
              </div>

              {/* Status control */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Application Status
                </label>
                <select
                  value={selectedApp.status || "pending"}
                  onChange={handleStatusChange}
                  className="w-full border rounded-lg px-4 py-2 capitalize font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="interview_set">Interview Set</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
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
