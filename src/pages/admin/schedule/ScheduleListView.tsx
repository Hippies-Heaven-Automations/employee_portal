import { useMemo } from "react";
import { Button } from "../../../components/Button";
import { Search, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { formatDate, formatDisplayTimeRaw } from "./scheduleUtils";
import { Schedule } from "./types";

interface ScheduleListViewProps {
  schedules: Schedule[];
  searchTerm: string;
  sortOrder: "asc" | "desc";
  selectedEmployee: string;
  employeeSchedules: Record<string, Schedule[]>;
  onSearchChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onSortToggle: () => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
}

export default function ScheduleListView({
  schedules,
  searchTerm,
  sortOrder,
  selectedEmployee,
  employeeSchedules,
  onSearchChange,
  onEmployeeChange,
  onSortToggle,
  onEdit,
  onDelete,
}: ScheduleListViewProps) {
  // ---------- Filter + Sort ----------
  const filteredFlatSchedules = useMemo(() => {
    let list = [...schedules];
    if (selectedEmployee !== "all")
      list = list.filter((s) => s.profiles?.full_name === selectedEmployee);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.profiles?.full_name.toLowerCase().includes(q) ||
          s.date.includes(q)
      );
    }
    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "asc" ? da - db : db - da;
    });
    return list;
  }, [schedules, searchTerm, selectedEmployee, sortOrder]);

  return (
    <div className="bg-white border border-hemp-sage rounded-lg shadow-sm p-4">
      <h2 className="text-2xl font-semibold text-hemp-forest mb-4">
        All Schedules
      </h2>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-3 shadow-sm">
        {/* Search Box */}
        <div className="relative w-full sm:w-1/3">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green transition-all"
          />
        </div>

        {/* Employee Filter */}
        <select
          value={selectedEmployee}
          onChange={(e) => onEmployeeChange(e.target.value)}
          className="border border-hemp-sage/50 bg-white/60 rounded-lg px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green cursor-pointer transition-all"
        >
          <option value="all">View All</option>
          {Object.keys(employeeSchedules).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Sort Toggle */}
        <Button
          onClick={onSortToggle}
          variant="outline"
          className="flex items-center gap-2 border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white rounded-lg px-4 py-2"
        >
          <ArrowUpDown size={16} />
          {sortOrder === "asc" ? "Sort by Date ↑" : "Sort by Date ↓"}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700 border border-hemp-sage/30 rounded-lg overflow-hidden">
          <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase text-xs">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Time In</th>
              <th className="px-4 py-2 text-left">Time Out</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlatSchedules.map((s) => (
              <tr
                key={s.id}
                className="border-t border-hemp-sage/20 hover:bg-hemp-mist/40 transition-all"
              >
                <td className="px-4 py-2">{formatDate(new Date(s.date))}</td>
                <td className="px-4 py-2">
                  {s.profiles?.full_name || "Unknown"}
                </td>
                <td className="px-4 py-2">{formatDisplayTimeRaw(s.time_in)}</td>
                <td className="px-4 py-2">{formatDisplayTimeRaw(s.time_out)}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    onClick={() => onEdit(s)}
                    variant="outline"
                    className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white text-xs px-3 py-1"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    onClick={() => onDelete(s.id)}
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 text-xs px-3 py-1"
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}

            {filteredFlatSchedules.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 italic py-4"
                >
                  No schedules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
