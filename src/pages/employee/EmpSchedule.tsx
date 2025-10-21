import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { notifyError } from "../../utils/notify";

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

      if (authError || !user)
        throw new Error("Unable to fetch user. Please log in again.");

      const { data, error } = await supabase
        .from("schedules")
        .select("id, date, time_in, time_out, created_at")
        .eq("employee_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch your schedule.";
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeSchedules();
  }, []);

  const formatted = useMemo(
    () =>
      schedules.map((s) => {
        const dateObj = new Date(s.date);
        return {
          ...s,
          formattedDate: dateObj.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          day: dateObj.toLocaleDateString(undefined, { weekday: "long" }),
          timeIn: new Date(`1970-01-01T${s.time_in}`).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timeOut: new Date(`1970-01-01T${s.time_out}`).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }),
    [schedules]
  );

  return (
    <section className="animate-fadeInUp p-6 max-w-5xl mx-auto text-gray-700">
      {/* 🌿 Header */}
      <header className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-hemp-forest flex items-center justify-center sm:justify-start gap-2 mb-2">
          🗓️ My Schedule
        </h1>
        <p className="text-hemp-ink/70 text-sm sm:text-base">
          View your assigned work schedule and plan ahead with ease.
        </p>
      </header>

      {/* 🌿 Loading shimmer */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-hemp-sage/30 rounded-lg" />
          ))}
        </div>
      )}

      {/* 🌿 Error */}
      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 🌿 Empty state */}
      {!loading && !error && schedules.length === 0 && (
        <div className="text-gray-600 italic bg-white border border-hemp-sage/40 rounded-lg p-6 shadow-sm text-center">
          No schedule assigned yet.
        </div>
      )}

      {/* 🌿 Table (Desktop) */}
      {!loading && !error && schedules.length > 0 && (
        <>
          <div className="hidden sm:block overflow-x-auto border border-hemp-sage/50 rounded-xl bg-white shadow-sm">
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
                {formatted.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition"
                  >
                    <td className="p-3">{s.formattedDate}</td>
                    <td className="p-3 text-gray-600">{s.day}</td>
                    <td className="p-3 font-medium text-hemp-forest">
                      {s.timeIn}
                    </td>
                    <td className="p-3 font-medium text-hemp-forest">
                      {s.timeOut}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🌿 Cards (Mobile) */}
          <div className="block sm:hidden divide-y divide-hemp-sage/30 bg-white border border-hemp-sage/50 rounded-xl shadow-sm">
            {formatted.map((s) => (
              <div key={s.id} className="p-4">
                <h3 className="font-semibold text-hemp-forest">
                  {s.formattedDate} • {s.day}
                </h3>
                <p className="text-gray-700 mt-1 text-sm">
                  ⏰ {s.timeIn} – {s.timeOut}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
