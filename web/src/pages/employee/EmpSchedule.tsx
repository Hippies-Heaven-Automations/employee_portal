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

  // 🌿 Fetch schedules for current user
  const fetchEmployeeSchedules = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Unable to fetch user. Please log in again.");
      }

      const { data, error } = await supabase
        .from("schedules")
        .select("id, date, time_in, time_out, created_at")
        .eq("employee_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeSchedules();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-hemp-forest mb-6 flex items-center gap-2">
        🗓️ My Schedule
      </h1>

      {/* 🌿 Loading shimmer */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-hemp-sage/30 rounded-lg" />
          ))}
        </div>
      )}

      {/* 🌿 Error */}
      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* 🌿 Empty state */}
      {!loading && !error && schedules.length === 0 && (
        <div className="text-gray-600 italic bg-white border border-hemp-sage/40 rounded-lg p-4 shadow-sm text-center">
          No schedule assigned yet.
        </div>
      )}

      {/* 🌿 Table */}
      {!loading && !error && schedules.length > 0 && (
        <div className="overflow-x-auto border border-hemp-sage/50 rounded-xl bg-white shadow-sm">
          <table className="min-w-full text-sm text-gray-800">
            <thead className="bg-hemp-sage/40 text-hemp-forest uppercase text-xs font-semibold tracking-wide">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Day</th>
                <th className="p-3 text-left">Time In</th>
                <th className="p-3 text-left">Time Out</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => {
                const dateObj = new Date(s.date);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const day = dateObj.toLocaleDateString(undefined, {
                  weekday: "long",
                });
                const timeIn = new Date(`1970-01-01T${s.time_in}`).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const timeOut = new Date(`1970-01-01T${s.time_out}`).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr
                    key={s.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition"
                  >
                    <td className="p-3">{formattedDate}</td>
                    <td className="p-3 text-gray-600">{day}</td>
                    <td className="p-3 font-medium text-hemp-forest">{timeIn}</td>
                    <td className="p-3 font-medium text-hemp-forest">{timeOut}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
