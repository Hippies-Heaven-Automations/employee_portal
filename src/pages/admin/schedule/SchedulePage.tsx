import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Button } from "../../../components/Button";
import { CalendarPlus } from "lucide-react";
import { notifySuccess, notifyError } from "../../../utils/notify";
import { confirmAction } from "../../../utils/confirm";
import ScheduleToolbar from "./ScheduleToolbar";
import ScheduleWeekView from "./ScheduleWeekView";
import ScheduleListView from "./ScheduleListView";
import ScheduleForm from "./ScheduleForm";
import { getStartOfWeek } from "./scheduleUtils";
import { Schedule } from "./types";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timezone, setTimezone] = useState<"CST" | "PHT">("CST");
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("*, profiles:employee_id(full_name)")
      .order("date", { ascending: true });
    if (error) notifyError(error.message);
    else setSchedules(data || []);
  };

  const employeeSchedules = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    for (const s of schedules) {
      const name = s.profiles?.full_name || "Unknown";
      if (!map[name]) map[name] = [];
      map[name].push(s);
    }
    return map;
  }, [schedules]);

  const handleDelete = async (id: string) => {
    confirmAction("Delete this schedule?", async () => {
      const { error } = await supabase.from("schedules").delete().eq("id", id);
      if (error) notifyError(error.message);
      else {
        notifySuccess("Deleted.");
        fetchSchedules();
      }
    });
  };

  // Week day generator
  const getWeekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      days.push({ date: d, label: d.toLocaleDateString("en-US", { weekday: "short" }) });
    }
    return days;
  }, [currentWeekStart]);

  return (
    <section className="animate-fadeInUp text-gray-700">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest">Team Schedule</h1>
        <Button onClick={() => setIsFormOpen(true)} className="bg-hemp-green text-white">
          <CalendarPlus size={18} /> Add Schedule
        </Button>
      </div>

      <ScheduleToolbar
        currentWeekStart={currentWeekStart}
        timezone={timezone}
        onPrev={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7)))}
        onNext={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7)))}
        onToggleTz={() => setTimezone(timezone === "CST" ? "PHT" : "CST")}
      />

      <ScheduleWeekView
        schedules={schedules}
        timezone={timezone}
        currentWeekStart={currentWeekStart}
        getWeekDays={getWeekDays}
      />

      <ScheduleListView
        schedules={schedules}
        searchTerm={searchTerm}
        sortOrder={sortOrder}
        selectedEmployee={selectedEmployee}
        employeeSchedules={employeeSchedules}
        onSearchChange={setSearchTerm}
        onEmployeeChange={setSelectedEmployee}
        onSortToggle={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        onEdit={(s) => {
          setSelectedSchedule(s);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
      />

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
