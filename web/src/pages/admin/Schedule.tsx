import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import ScheduleForm from "./ScheduleForm";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";

interface Schedule {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string;
  created_at: string;
  profiles?: { full_name: string };
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("schedules")
      .select(`*, profiles:employee_id(full_name)`)
      .order("date", { ascending: false });

    if (error) console.error(error);
    else setSchedules(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchSchedules();
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedSchedule(null);
    setIsFormOpen(true);
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2 sm:mb-0">
          Schedules
        </h1>
        <Button
          onClick={handleAdd}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 shadow-card inline-flex items-center gap-2"
        >
          <CalendarPlus size={18} />
          Add Schedule
        </Button>
      </div>

      {/* 🌿 Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading schedules...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time In</th>
                  <th className="px-4 py-3 text-left">Time Out</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {s.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.date}</td>
                    <td className="px-4 py-3 text-gray-700">{s.time_in}</td>
                    <td className="px-4 py-3 text-gray-700">{s.time_out}</td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      {/* ✏️ Edit */}
                      <Button
                        onClick={() => handleEdit(s)}
                        variant="outline"
                        className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                      >
                        <Pencil size={15} />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

                      {/* 🗑 Delete */}
                      <Button
                        onClick={() => handleDelete(s.id)}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-gray-500 italic"
                    >
                      No schedules found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌿 Add/Edit Modal */}
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
