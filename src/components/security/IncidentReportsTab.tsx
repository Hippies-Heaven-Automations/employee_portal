import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../Button";
import { notifyError, notifySuccess } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";
import { Search, Plus, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import IncidentReportForm from "./IncidentReportForm";

interface IncidentReport {
  id: string;
  date: string;
  time: string;
  description: string;
  footage_link?: string | null;
  management_contacted?: boolean;
  police_contacted?: boolean;
  inputted_by: string | null;
  created_at?: string;
}

export default function IncidentReportsTab() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("incident_reports")
      .select("*")
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (error) notifyError(`Error loading incident reports: ${error.message}`);
    else setReports((data as IncidentReport[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const highlightMatch = (text: string) => {
    if (!text) return "";
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(
      regex,
      `<mark class='bg-hemp-sage/40 text-hemp-forest font-semibold'>$1</mark>`
    );
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return reports;
    const q = searchTerm.toLowerCase();
    return reports.filter(
      (r) =>
        (r.description || "").toLowerCase().includes(q) ||
        (r.management_contacted ? "yes" : "no").includes(q) ||
        (r.police_contacted ? "yes" : "no").includes(q)
    );
  }, [reports, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const onAdd = () => {
    setSelectedReport(null);
    setIsFormOpen(true);
  };

  const onEdit = (report: IncidentReport) => {
    setSelectedReport(report);
    setIsFormOpen(true);
  };

  const onDelete = (id: string) => {
    confirmAction("Delete this incident report? This cannot be undone.", async () => {
      const { error } = await supabase.from("incident_reports").delete().eq("id", id);
      if (error) notifyError(`Error deleting report: ${error.message}`);
      else {
        notifySuccess("🗑️ Incident report deleted.");
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    });
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={22} className="text-hemp-forest" />
          <h2 className="text-xl font-bold text-hemp-forest">Security Incident Reports</h2>
        </div>
        <Button
          onClick={onAdd}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-4 py-2 transition-all shadow-card inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Add Report
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search description or status..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500 inline-flex items-center gap-2 justify-center">
            <Loader2 className="animate-spin" /> Loading reports...
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No incident reports found.</div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Mgmt Contacted</th>
                  <th className="px-4 py-3 text-left">Police Contacted</th>
                  <th className="px-4 py-3 text-left">Footage</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                  >
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3">{row.time?.slice(0, 5)}</td>
                    <td
                      className="px-4 py-3"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(row.description || ""),
                      }}
                    />
                    <td className="px-4 py-3">
                      {row.management_contacted ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {row.police_contacted ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {row.footage_link ? (
                        <a
                          href={row.footage_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-hemp-green underline underline-offset-2"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      <Button
                        onClick={() => onEdit(row)}
                        variant="outline"
                        className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                      >
                        <Pencil size={15} /> Edit
                      </Button>
                      <Button
                        onClick={() => onDelete(row.id)}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
                      >
                        <Trash2 size={16} /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Modal */}
      {isFormOpen && (
        <IncidentReportForm
          initial={selectedReport}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            setIsFormOpen(false);
            fetchReports();
          }}
        />
      )}
    </section>
  );
}
