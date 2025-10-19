import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import ScheduleForm from "./ScheduleForm";
import {
  CalendarPlus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Search,
  ArrowUpDown,
} from "lucide-react";

interface Schedule {
  id: string;
  employee_id: string;
  date: string;        // yyyy-mm-dd (stored in America/Chicago date)
  time_in: string;     // HH:mm (Chicago wall time)
  time_out: string;    // HH:mm (Chicago wall time)
  created_at: string;
  profiles?: { full_name: string };
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [timezone, setTimezone] = useState<"CST" | "PHT">("CST");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  // ---------- Fetch ----------
  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("schedules")
      .select(`*, profiles:employee_id(full_name)`)
      .order("date", { ascending: true });
    if (!error) setSchedules(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // ---------- Date utils ----------
  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(d.setDate(diff));
  }
  function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  }

  // ---------- DST-aware Chicago→Manila diff (13h in CDT, 14h in CST) ----------
  function getTzDiffHours(dateISO: string) {
    // Use schedule's actual date (Illinois noon to detect DST)
    const probe = new Date(dateISO + "T12:00:00Z");
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      timeZoneName: "short",
    }).formatToParts(probe);
    const tzName = parts.find((p) => p.type === "timeZoneName")?.value || "";
    const chicagoOffset = tzName.includes("CDT") ? -5 : -6; // hours vs UTC
    return 8 - chicagoOffset; // PHT(UTC+8) - Chicago(UTC-5/-6)
  }

  // ---------- Bottom table: format a stored Chicago wall time for display ----------
  function formatDisplayTime(timeString: string, dateISO: string, tz: "CST" | "PHT") {
    if (!timeString) return "";
    const [hh, mm] = timeString.split(":").map(Number);
    // Build a neutral UTC base = Chicago wall time at UTC (we will shift by diff)
    let dt = new Date(Date.UTC(2024, 0, 1, hh, mm));
    if (tz === "PHT") {
      const diff = getTzDiffHours(dateISO);
      dt = new Date(dt.getTime() + diff * 60 * 60 * 1000);
    }
    return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  // ---------- Weekly header slot conversion ----------
  // For PHT, show EXACT mapping style you specified (9pm-12mn, 12mn-3am, ...).
  // We compute via diff but format with nn/mn rules.
  function formatHourCompact(h: number) {
    // h = 0..23 in PHT
    if (h === 0) return "12mn";   // midnight
    if (h === 12) return "12nn";  // noon
    if (h < 12) return `${h}am`;
    return `${h - 12}pm`;
  }
  function convertSlotLabel(slot: string, dateISO: string, tz: "CST" | "PHT") {
    const [a, b] = slot.split(" - ");
    const to24 = (label: string) => {
      const [num, mer] = label.split(" ");
      let h = parseInt(num, 10);
      if (mer === "PM" && h < 12) h += 12;
      if (mer === "AM" && h === 12) h = 0;
      return h; // 0..23
    };
    if (tz === "CST") return slot;

    const diff = getTzDiffHours(dateISO);
    const startH = (to24(a) + diff + 24) % 24;
    const endH = (to24(b) + diff + 24) % 24;

    // Style like: 9pm - 12mn, 12mn - 3am, ...
    return `${formatHourCompact(startH)} - ${formatHourCompact(endH)}`;
  }

  // ---------- Weekly grid helpers ----------
  const getWeekDays = useMemo(() => {
    const days: { date: Date; label: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push({ date: day, label: day.toLocaleDateString("en-US", { weekday: "short" }) });
    }
    return days;
  }, [currentWeekStart]);

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };
  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  // Filter to current week (by stored Chicago date)
  const filteredSchedules = useMemo(() => {
    const start = currentWeekStart;
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 7);
    return schedules.filter((s) => {
      const d = new Date(s.date);
      return d >= start && d < end;
    });
  }, [schedules, currentWeekStart]);

  // Group for dropdown
  const employeeSchedules = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    for (const s of schedules) {
      const name = s.profiles?.full_name || "Unknown";
      if (!map[name]) map[name] = [];
      map[name].push(s);
    }
    return map;
  }, [schedules]);

  // Bottom table filtering/sorting
  const filteredFlatSchedules = useMemo(() => {
    let list = [...schedules];
    if (selectedEmployee !== "all") list = list.filter((s) => s.profiles?.full_name === selectedEmployee);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((s) => s.profiles?.full_name.toLowerCase().includes(q) || s.date.includes(q));
    }
    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "asc" ? da - db : db - da;
    });
    return list;
  }, [schedules, searchTerm, selectedEmployee, sortOrder]);

  // ---------- CRUD ----------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (!error) fetchSchedules();
  };
  const handleEdit = (s: Schedule) => {
    setSelectedSchedule(s);
    setIsFormOpen(true);
  };
  const handleAdd = () => {
    setSelectedSchedule(null);
    setIsFormOpen(true);
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2 sm:mb-0">Team Schedule</h1>
        <Button
          onClick={handleAdd}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 shadow-card inline-flex items-center gap-2"
        >
          <CalendarPlus size={18} />
          Add Schedule
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button onClick={prevWeek} variant="outline" className="rounded-full p-2 border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white">
            <ChevronLeft size={18} />
          </Button>
          <div className="text-center">
            <p className="font-semibold text-hemp-forest">Week of {formatDate(currentWeekStart)}</p>
            <p className="text-sm text-gray-500">{timezone === "CST" ? "Central Time (Illinois)" : "Philippine Time"}</p>
          </div>
          <Button onClick={nextWeek} variant="outline" className="rounded-full p-2 border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white">
            <ChevronRight size={18} />
          </Button>
        </div>

        <Button
          onClick={() => setTimezone(timezone === "CST" ? "PHT" : "CST")}
          variant="outline"
          className="flex items-center gap-2 border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition-all rounded-lg px-5 py-2"
        >
          <Globe size={18} />
          <span>Switch to {timezone === "CST" ? "PHT" : "CST"}</span>
        </Button>
      </div>

      {/* Weekly Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-x-auto mb-8">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading schedules...</div>
        ) : (
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                {getWeekDays.map((d) => (
                  <th key={d.label} className="px-4 py-3 text-center">
                    {d.label}
                    <br />
                    <span className="text-xs text-gray-500">{formatDate(d.date)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {generateTimeSlots().map((slot) => {
                // Left column label: CST slots or PHT mapping
                const leftLabel =
                  timezone === "CST"
                    ? slot
                    : convertSlotLabel(slot, currentWeekStart.toISOString().slice(0, 10), "PHT");

                return (
                  <tr key={slot} className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition-all">
                    <td className="px-4 py-3 font-semibold text-gray-800">{leftLabel}</td>

                    {getWeekDays.map((d) => {
                      // Put schedule into correct day column after conversion
                      const cellSchedules = filteredSchedules.filter((s) => {
                        const schedDate = new Date(s.date); // Chicago calendar date
                        if (timezone === "PHT") {
                          const diff = getTzDiffHours(s.date);
                          schedDate.setHours(schedDate.getHours() + diff); // shift to Manila calendar date
                        }
                        return schedDate.toDateString() === d.date.toDateString();
                      });

                      // Check if any schedule’s (converted) time falls within this displayed slot
                      const match = cellSchedules.find((s) => {
                        // Base Chicago hours from stored times
                        const baseStartH = new Date(`1970-01-01T${s.time_in}`).getHours();
                        const baseEndH   = new Date(`1970-01-01T${s.time_out}`).getHours();

                        // Shift to display (Manila) if needed
                        const diff = timezone === "PHT" ? getTzDiffHours(s.date) : 0;
                        const startH = (baseStartH + diff + 24) % 24;
                        const endH   = (baseEndH   + diff + 24) % 24;

                        // Convert current slot boundaries into display hours (PHT or CST)
                        const [a, b] = slot.split(" - ");
                        const to24 = (label: string) => {
                          const [num, mer] = label.split(" ");
                          let h = parseInt(num, 10);
                          if (mer === "PM" && h < 12) h += 12;
                          if (mer === "AM" && h === 12) h = 0;
                          return h;
                        };

                        let slotStartH = to24(a);
                        let slotEndH   = to24(b);
                        if (timezone === "PHT") {
                          slotStartH = (slotStartH + diff + 24) % 24;
                          slotEndH   = (slotEndH   + diff + 24) % 24;
                        }

                        const inRange = (h: number, a: number, b: number) =>
                          a <= b ? (h >= a && h < b) : (h >= a || h < b);

                        // Check start within slot
                        if (inRange(startH, slotStartH, slotEndH)) return true;
                        // Or end within slot
                        if (inRange(endH, slotStartH, slotEndH)) return true;

                        return false;
                      });

                      return (
                        <td key={d.label + slot} className="px-4 py-3 text-center text-gray-700">
                          {match ? <span className="font-medium text-hemp-forest">{match.profiles?.full_name}</span> : "-"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* All Schedules (flat) */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm p-4">
        <h2 className="text-2xl font-semibold text-hemp-forest mb-4">All Schedules</h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-3 shadow-sm">
          <div className="relative w-full sm:w-1/3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green transition-all"
            />
          </div>

          <select
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="border border-hemp-sage/50 bg-white/60 rounded-lg px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green cursor-pointer transition-all"
          >
            <option value="all">View All</option>
            {Object.keys(employeeSchedules).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <Button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            variant="outline"
            className="flex items-center gap-2 border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white rounded-lg px-4 py-2"
          >
            <ArrowUpDown size={16} />
            {sortOrder === "asc" ? "Sort by Date ↑" : "Sort by Date ↓"}
          </Button>
        </div>

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
                <tr key={s.id} className="border-t border-hemp-sage/20 hover:bg-hemp-mist/40 transition-all">
                  <td className="px-4 py-2">{formatDate(new Date(s.date))}</td>
                  <td className="px-4 py-2">{s.profiles?.full_name || "Unknown"}</td>
                  <td className="px-4 py-2">{formatDisplayTime(s.time_in, s.date, timezone)}</td>
                  <td className="px-4 py-2">{formatDisplayTime(s.time_out, s.date, timezone)}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      onClick={() => handleEdit(s)}
                      variant="outline"
                      className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white text-xs px-3 py-1"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(s.id)}
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
                  <td colSpan={5} className="text-center text-gray-500 italic py-4">
                    No schedules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ScheduleForm
          schedule={selectedSchedule}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchSchedules}
        />
      )}
    </section>
  );
}

// ---------- CST base slots ----------
function generateTimeSlots() {
  return [
    "8 AM - 11 AM",
    "11 AM - 2 PM",
    "2 PM - 5 PM",
    "5 PM - 8 PM",
    "8 PM - 11 PM",
    "11 PM - 2 AM",
    "2 AM - 5 AM",
    "5 AM - 8 AM",
  ];
}

