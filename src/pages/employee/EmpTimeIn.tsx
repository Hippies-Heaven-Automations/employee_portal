import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { notifySuccess, notifyError } from "../../utils/notify";

interface ShiftLog {
  id: string;
  shift_start: string;
  shift_end: string | null;
  duration: string | null;
  created_at: string;
}

export default function EmpTimeIn() {
  const [logs, setLogs] = useState<ShiftLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [liveDuration, setLiveDuration] = useState("");
  const [processing, setProcessing] = useState(false);

  // 🌿 Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  // 🌿 Fetch logs
  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("shift_logs")
      .select("*")
      .eq("employee_id", userId)
      .order("shift_start", { ascending: false });

    if (error) {
      console.error(error);
      notifyError("Failed to load your shift logs.");
    } else {
      setLogs(data || []);
      const openShift = data?.find((l) => !l.shift_end);
      setIsClockedIn(!!openShift);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchLogs();
  }, [userId, fetchLogs]);

  // 🌿 Live duration updater
  useEffect(() => {
    if (!isClockedIn) {
      setLiveDuration("");
      return;
    }

    const openShift = logs.find((log) => !log.shift_end);
    if (!openShift) return;

    const updateDuration = () => {
      const diffMs = Date.now() - new Date(openShift.shift_start).getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      setLiveDuration(`${hours}h ${minutes}m`);
    };

    updateDuration();
    const timer = setInterval(updateDuration, 60000);
    return () => clearInterval(timer);
  }, [isClockedIn, logs]);

  // 🌿 Time In / Out
  const handleClock = async () => {
    if (!userId || processing) return;
    setProcessing(true);

    try {
      if (!isClockedIn) {
        const { error: insertError } = await supabase
          .from("shift_logs")
          .insert([{ employee_id: userId, shift_start: new Date().toISOString() }]);
        if (insertError) throw insertError;
        notifySuccess("🕒 Time In recorded successfully!");
      } else {
        const { data: openShift } = await supabase
          .from("shift_logs")
          .select("id")
          .eq("employee_id", userId)
          .is("shift_end", null)
          .maybeSingle();

        if (openShift) {
          const { error: updateError } = await supabase
            .from("shift_logs")
            .update({ shift_end: new Date().toISOString() })
            .eq("id", openShift.id);
          if (updateError) throw updateError;
          notifySuccess("✅ Time Out recorded successfully!");
        }
      }

      await fetchLogs();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to record your shift.";
      notifyError(message);
    } finally {
      setProcessing(false);
    }
  };

  // 🌿 Duration formatter
  const formatDuration = (duration: string | null) => {
    if (!duration) return "-";
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (!match) return duration;
    const [, h, m] = match;
    const hours = parseInt(h);
    const minutes = parseInt(m);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
  };

  return (
    <section className="p-6 max-w-5xl mx-auto animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <header className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-hemp-forest mb-1">
          🕒 My Shift Logs
        </h1>
        <p className="text-sm text-hemp-ink/70">
          Track your working hours and monitor your shift history.
        </p>
      </header>

      {/* 🌿 Time In / Out Button */}
      <div className="flex flex-col items-center mb-10 space-y-3">
        <Button
          onClick={handleClock}
          disabled={processing}
          className={`w-48 sm:w-56 py-4 text-lg font-semibold rounded-xl shadow-md transition-all duration-300 ${
            isClockedIn
              ? "bg-red-500 hover:bg-red-600"
              : "bg-hemp-green hover:bg-hemp-forest"
          } text-white`}
        >
          {processing ? "Processing..." : isClockedIn ? "Time Out" : "Time In"}
        </Button>

        {isClockedIn && (
          <p className="text-hemp-forest font-medium mt-2">
            ⏱ Current Session:{" "}
            <span className="text-hemp-green font-semibold">{liveDuration}</span>
          </p>
        )}
      </div>

      {/* 🌿 Logs Display */}
      {loading ? (
        <div className="text-center text-gray-500">Loading shift logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-600 italic bg-white border border-hemp-sage/40 rounded-lg p-6 shadow-sm">
          No shift logs found.
        </div>
      ) : (
        <>
          {/* 🌿 Desktop Table */}
          <div className="hidden sm:block overflow-x-auto border border-hemp-sage/40 rounded-xl bg-white shadow-sm">
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-hemp-sage/40 text-hemp-forest uppercase text-xs font-semibold tracking-wide">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Time In</th>
                  <th className="p-3 text-left">Time Out</th>
                  <th className="p-3 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition"
                  >
                    <td className="p-3">
                      {new Date(log.shift_start).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3">
                      {new Date(log.shift_start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">
                      {log.shift_end
                        ? new Date(log.shift_end).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="p-3 font-medium text-hemp-forest">
                      {log.shift_end
                        ? formatDuration(log.duration)
                        : liveDuration || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🌿 Mobile Cards */}
          <div className="block sm:hidden divide-y divide-hemp-sage/40 bg-white border border-hemp-sage/50 rounded-xl shadow-sm mt-4">
            {logs.map((log) => (
              <div key={log.id} className="p-4">
                <h3 className="font-semibold text-hemp-forest">
                  {new Date(log.shift_start).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-sm text-gray-700">
                  ⏰ In:{" "}
                  {new Date(log.shift_start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-gray-700">
                  🔚 Out:{" "}
                  {log.shift_end
                    ? new Date(log.shift_end).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>
                <p className="text-sm mt-1 text-hemp-forest font-medium">
                  ⏱ Duration:{" "}
                  <span className="font-semibold">
                    {log.shift_end
                      ? formatDuration(log.duration)
                      : liveDuration || "-"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
