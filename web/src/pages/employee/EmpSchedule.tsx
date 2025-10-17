import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Schedule {
  id: string;
  date: string;
  time_in: string;
  time_out: string;
  created_at: string;
}

export default function EmpSched() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployeeSchedules = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Unable to fetch user. Please log in again.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("schedules")
      .select("id, date, time_in, time_out, created_at")
      .eq("employee_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setSchedules(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEmployeeSchedules();
  }, []);

  if (loading) return <p className="p-6">Loading your schedule...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Schedule</h1>

      {schedules.length === 0 ? (
        <p>No schedule assigned yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Time In</th>
                <th className="p-2 text-left">Time Out</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{new Date(s.date).toLocaleDateString()}</td>
                  <td className="p-2">{s.time_in}</td>
                  <td className="p-2">{s.time_out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
