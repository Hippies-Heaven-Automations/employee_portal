import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Search, ArrowUpDown, Eye } from "lucide-react";
import { notifyError } from "../../utils/notify";

interface ShiftLog {
  id: string;
  employee_id: string;
  shift_start: string;
  shift_end: string | null;
  duration: string | null;
  end_of_shift_report: string | null;
  report_submitted_at: string | null;
  full_name: string | null;
}

export default function ShiftLogs() {
  const [logs, setLogs] = useState<ShiftLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const itemsPerPage = 10;

  // 🌿 Fetch Shift Logs
  const fetchLogs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("shift_logs")
      .select(
        `
        id,
        employee_id,
        shift_start,
        shift_end,
        duration,
        end_of_shift_report,
        report_submitted_at,
        profiles(full_name)
      `
      )
      .order("shift_start", { ascending: false });

    if (error) {
      console.error(error);
      notifyError("Failed to load shift logs.");
    } else {
      const formatted: ShiftLog[] = (data || []).map((d) => ({
        id: d.id,
        employee_id: d.employee_id,
        shift_start: d.shift_start,
        shift_end: d.shift_end,
        duration: d.duration,
        end_of_shift_report: d.end_of_shift_report,
        report_submitted_at: d.report_submitted_at,
        full_name:
          (d as { profiles?: { full_name?: string } }).profiles?.full_name || "Unknown",
      }));
      setLogs(formatted);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 🌿 Filtering + Sorting
  const filtered = useMemo(() => {
    let f = logs;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      f = f.filter((l) => l.full_name?.toLowerCase().includes(q));
    }
    return [...f].sort((a, b) => {
      const A = new Date(a.shift_start).getTime();
      const B = new Date(b.shift_start).getTime();
      return sortOrder === "asc" ? A - B : B - A;
    });
  }, [logs, searchTerm, sortOrder]);

  const total = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSortOrder = () =>
    setSortOrder((p) => (p === "asc" ? "desc" : "asc"));

  const page = (p: number) => p >= 1 && p <= total && setCurrentPage(p);

  // 🌿 Duration Formatter
  const formatDuration = (duration: string | null) => {
    if (!duration) return "-";
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (!match) return duration;
    const [, h, m] = match;
    const hours = parseInt(h);
    const minutes = parseInt(m);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
        <h1 className="text-3xl font-bold text-hemp-forest">Shift Logs</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
          />
        </div>

        <Button
          onClick={toggleSortOrder}
          variant="outline"
          className="w-full sm:w-auto border-hemp-green/60 text-hemp-forest hover:bg-hemp-green hover:text-white rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 shadow-sm"
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
          <div className="p-6 text-center text-gray-500">Loading shift logs...</div>
        ) : paginated.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">
            No shift records found.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time In</th>
                    <th className="px-4 py-3 text-left">Time Out</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                    >
                      <td className="px-4 py-3 font-medium">{r.full_name}</td>
                      <td className="px-4 py-3">
                        {new Date(r.shift_start).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(r.shift_start).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {r.shift_end
                          ? new Date(r.shift_end).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3 font-medium text-hemp-forest">
                        {r.shift_end ? formatDuration(r.duration) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {r.end_of_shift_report ? (
                          <Button
                            onClick={() => setSelectedReport(r.end_of_shift_report!)}
                            variant="outline"
                            className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white inline-flex items-center gap-1.5"
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </Button>
                        ) : (
                          <span className="text-gray-400 italic">No report</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden divide-y divide-hemp-sage/40">
              {paginated.map((r) => (
                <div key={r.id} className="p-4 bg-white">
                  <h2 className="text-base font-semibold text-hemp-forest">
                    {r.full_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    📅 {new Date(r.shift_start).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    ⏰ In:{" "}
                    {new Date(r.shift_start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm text-gray-700">
                    🔚 Out:{" "}
                    {r.shift_end
                      ? new Date(r.shift_end).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                  <p className="text-sm mt-1 text-hemp-forest font-medium">
                    ⏱ Duration: {r.shift_end ? formatDuration(r.duration) : "-"}
                  </p>

                  {r.end_of_shift_report && (
                    <Button
                      onClick={() => setSelectedReport(r.end_of_shift_report!)}
                      variant="outline"
                      className="mt-3 border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white w-full justify-center"
                    >
                      <Eye size={15} />
                      View Report
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {total > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <Button
            onClick={() => page(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Prev
          </Button>
          {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => page(p)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                currentPage === p
                  ? "bg-hemp-green text-white"
                  : "bg-white text-hemp-forest border border-hemp-sage hover:bg-hemp-mist"
              }`}
            >
              {p}
            </button>
          ))}
          <Button
            onClick={() => page(currentPage + 1)}
            disabled={currentPage === total}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Next
          </Button>
        </div>
      )}

      {/* 🧾 View Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-hemp-sage/50 overflow-hidden animate-fadeInUp">
            <div className="px-5 py-4 border-b border-hemp-sage/40 bg-hemp-mist/40 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-hemp-forest">
                End of Shift Report
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-600 hover:text-hemp-forest text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto text-gray-700 whitespace-pre-wrap">
              {selectedReport}
            </div>
            <div className="px-5 py-4 border-t border-hemp-sage/40 bg-white flex justify-end">
              <Button
                onClick={() => setSelectedReport(null)}
                variant="ghost"
                className="px-4 py-2 text-gray-700 hover:bg-hemp-mist rounded-lg"
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
