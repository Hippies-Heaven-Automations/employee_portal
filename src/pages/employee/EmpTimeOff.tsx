import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import EmpTimeOffForm from "./EmpTimeOffForm";
import { notifySuccess, notifyError } from "../../utils/notify";

interface TimeOff {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function EmpTimeOff() {
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🌿 Fetch employee’s time-off requests
  const fetchTimeOffs = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
        error: userError,
      }: {
        data: { user: { id: string } | null };
        error: Error | null;
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Please log in again.");

      const { data, error } = await supabase
        .from("time_off_requests")
        .select("id, start_date, end_date, reason, status, created_at")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      setTimeOffs(data ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load your time-off records.";
      console.error("Error loading time-offs:", message);
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeOffs();
  }, []);

  const formatted = useMemo(
    () =>
      timeOffs.map((t) => ({
        ...t,
        start: new Date(t.start_date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        end: new Date(t.end_date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
    [timeOffs]
  );

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "denied":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <section className="p-6 max-w-5xl mx-auto animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-hemp-forest mb-1">
            🌴 My Time-Off Requests
          </h1>
          <p className="text-sm text-hemp-ink/70">
            Track and manage your leave requests easily.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold px-6 py-2 rounded-lg shadow-card transition-all duration-300"
        >
          Request Time Off
        </Button>
      </header>

      {/* 🌿 Error Message */}
      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 🌿 Loading shimmer */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-hemp-sage/30 rounded-lg" />
          ))}
        </div>
      )}

      {/* 🌿 No requests */}
      {!loading && !error && timeOffs.length === 0 && (
        <div className="text-gray-600 italic bg-white border border-hemp-sage/40 rounded-lg p-6 shadow-sm text-center">
          No time-off requests yet. Click <strong>“Request Time Off”</strong> to start one.
        </div>
      )}

      {/* 🌿 Table (Desktop) */}
      {!loading && !error && timeOffs.length > 0 && (
        <>
          <div className="hidden sm:block overflow-x-auto border border-hemp-sage/50 rounded-xl bg-white shadow-sm">
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-hemp-sage/40 text-hemp-forest uppercase text-xs font-semibold tracking-wide">
                <tr>
                  <th className="p-3 text-left">Start Date</th>
                  <th className="p-3 text-left">End Date</th>
                  <th className="p-3 text-left">Reason</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {formatted.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition"
                  >
                    <td className="p-3">{t.start}</td>
                    <td className="p-3">{t.end}</td>
                    <td className="p-3 text-gray-700">{t.reason}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusStyle(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🌿 Mobile Cards */}
          <div className="block sm:hidden divide-y divide-hemp-sage/40 bg-white border border-hemp-sage/50 rounded-xl shadow-sm mt-4">
            {formatted.map((t) => (
              <div key={t.id} className="p-4">
                <h3 className="font-semibold text-hemp-forest mb-1">
                  {t.start} → {t.end}
                </h3>
                <p className="text-sm text-gray-700 mb-1">{t.reason}</p>
                <span
                  className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusStyle(
                    t.status
                  )}`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🌿 Form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <EmpTimeOffForm
            onClose={() => setIsFormOpen(false)}
            onSave={() => {
              fetchTimeOffs();
              notifySuccess("✅ Time-off request submitted successfully!");
            }}
          />
        </div>
      )}
    </section>
  );
}
