import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../Button";
import { notifyError, notifySuccess } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";
import { Search, Plus, Pencil, Trash2, Loader2, Shield } from "lucide-react";
import SafeRoomForm from "./SafeRoomForm";

interface SafeRoomLog {
  id: string;
  date: string;
  time: string;
  employee_id: string | null;
  footage_link?: string | null;
  reason_for_entry?: string | null;
  inputted_by: string | null;
  created_at?: string;
  updated_at?: string;
}

interface EmployeeLite {
  id: string;
  full_name: string;
  employee_type?: string;
}

export default function SafeRoomTab() {
  const [logs, setLogs] = useState<SafeRoomLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SafeRoomLog | null>(null);

  const [storeEmployees, setStoreEmployees] = useState<EmployeeLite[]>([]);
  const empMap = useMemo(
    () => new Map(storeEmployees.map((e) => [e.id, e.full_name] as [string, string])),
    [storeEmployees]
  );

  const fetchStoreEmployees = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, employee_type")
      .ilike("employee_type", "store")
      .order("full_name", { ascending: true });

    if (error) notifyError(`Error loading employees: ${error.message}`);
    else setStoreEmployees(data || []);
  };

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("safe_room_logs")
      .select("*")
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (error) notifyError(`Error loading safe room logs: ${error.message}`);
    else setLogs((data as SafeRoomLog[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStoreEmployees();
    fetchLogs();
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
    if (!searchTerm.trim()) return logs;
    const q = searchTerm.toLowerCase();
    return logs.filter((l) => {
      const name = l.employee_id ? (empMap.get(l.employee_id) || "") : "";
      return (
        name.toLowerCase().includes(q) ||
        (l.reason_for_entry || "").toLowerCase().includes(q)
      );
    });
  }, [logs, searchTerm, empMap]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const onAdd = () => {
    setSelectedLog(null);
    setIsFormOpen(true);
  };

  const onEdit = (log: SafeRoomLog) => {
    setSelectedLog(log);
    setIsFormOpen(true);
  };

  const onDelete = (id: string) => {
    confirmAction("Delete this safe room log? This cannot be undone.", async () => {
      const { error } = await supabase.from("safe_room_logs").delete().eq("id", id);
      if (error) notifyError(`Error deleting log: ${error.message}`);
      else {
        notifySuccess("🗑️ Safe room log deleted.");
        setLogs((prev) => prev.filter((l) => l.id !== id));
      }
    });
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Shield size={22} className="text-hemp-forest" />
          <h2 className="text-xl font-bold text-hemp-forest">Safe Room Logs</h2>
        </div>
        <Button
          onClick={onAdd}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-4 py-2 transition-all shadow-card inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Add Log
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
            placeholder="Search by employee or reason..."
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
            <Loader2 className="animate-spin" /> Loading logs...
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No records found.</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Footage</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((row) => {
                    const empName = row.employee_id ? empMap.get(row.employee_id) || "-" : "-";
                    return (
                      <tr
                        key={row.id}
                        className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                      >
                        <td className="px-4 py-3">{row.date}</td>
                        <td className="px-4 py-3">{row.time?.slice(0, 5)}</td>
                        <td
                          className="px-4 py-3 font-medium text-gray-800"
                          dangerouslySetInnerHTML={{ __html: highlightMatch(empName) }}
                        />
                        <td
                          className="px-4 py-3"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(row.reason_for_entry || ""),
                          }}
                        />
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
                    );
                  })}
                </tbody>
              </table>
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
        <SafeRoomForm
          storeEmployees={storeEmployees}
          initial={selectedLog}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            setIsFormOpen(false);
            fetchLogs();
          }}
        />
      )}
    </section>
  );
}
