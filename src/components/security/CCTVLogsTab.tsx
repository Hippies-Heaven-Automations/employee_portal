import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Search, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../Button";
import { notifyError } from "../../utils/notify";

interface CctvLog {
  id: string;
  camera_name: string;
  battery_percentage: number;
  updated_by_name: string | null;
  created_at: string;
}

export default function CctvLogsTab() {
  const [logs, setLogs] = useState<CctvLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("v_cctv_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", endDate + "T23:59:59");

    const { data, error } = await query;
    if (error) notifyError(`Error fetching CCTV logs: ${error.message}`);
    else setLogs(data || []);
    setLoading(false);
  }, [startDate, endDate]); 

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]); 

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const lower = searchTerm.toLowerCase();
    return logs.filter(
      (l) =>
        l.camera_name.toLowerCase().includes(lower) ||
        (l.updated_by_name?.toLowerCase() || "").includes(lower)
    );
  }, [logs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filteredLogs.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const batteryColor = (pct: number) => {
    if (pct <= 20) return "bg-red-100 text-red-700";
    if (pct <= 49) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-hemp-forest">CCTV Logs</h1>
          <p className="text-sm text-hemp-forest/70">
            Historical battery updates and camera activity.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-5 bg-white/70 border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        {/* Search bar */}
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by camera or employee..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
          />
        </div>

        {/* Date filter */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-hemp-sage/50 rounded-lg px-3 py-2 bg-white/60 text-gray-700 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-hemp-sage/50 rounded-lg px-3 py-2 bg-white/60 text-gray-700 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green"
            />
          </div>
          <Button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              fetchLogs();
            }}
            variant="outline"
            className="text-sm border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading CCTV logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Camera</th>
                  <th className="px-4 py-3 text-left">Battery %</th>
                  <th className="px-4 py-3 text-left">Updated By</th>
                  <th className="px-4 py-3 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {log.camera_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${batteryColor(
                          log.battery_percentage
                        )}`}
                      >
                        {log.battery_percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{log.updated_by_name || "—"}</td>
                    <td className="px-4 py-3">
                      {new Date(log.created_at).toLocaleString()}
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
            <ArrowLeft size={16} /> Prev
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
            Next <ArrowRight size={16} />
          </Button>
        </div>
      )}
    </section>
  );
}
