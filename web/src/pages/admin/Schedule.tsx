import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import ScheduleForm from "./ScheduleForm";

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
      .select(`*, profiles:employee_id(full_name)`) // join for employee name
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
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Schedules</h1>
        <Button onClick={handleAdd}>Add Schedule</Button>
      </div>

      {loading ? (
        <p>Loading schedules...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Employee</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Time In</th>
                <th className="p-2 text-left">Time Out</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.profiles?.full_name || "Unknown"}</td>
                  <td className="p-2">{s.date}</td>
                  <td className="p-2">{s.time_in}</td>
                  <td className="p-2">{s.time_out}</td>
                  <td className="p-2 space-x-2">
                    <Button onClick={() => handleEdit(s)} variant="outline">Edit</Button>
                    <Button onClick={() => handleDelete(s.id)} variant="ghost">Delete</Button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No schedules found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <ScheduleForm
          schedule={selectedSchedule}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchSchedules}
        />
      )}
    </div>
  );
}
