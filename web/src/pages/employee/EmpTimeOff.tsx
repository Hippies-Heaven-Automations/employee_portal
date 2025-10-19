import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import EmpTimeOffForm from "./EmpTimeOffForm";

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

  // 🌿 Fetch employee’s time-off requests
  const fetchTimeOffs = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        return;
      }

      const { data, error } = await supabase
        .from("time_off_requests")
        .select("id, start_date, end_date, reason, status, created_at")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTimeOffs(data || []);
    } catch (err) {
      console.error("Error loading time-offs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeOffs();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* 🌿 Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest">
          🌴 My Time-Off Requests
        </h1>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-hemp-green hover:bg-hemp-forest text-white"
        >
          Request Time Off
        </Button>
      </div>

      {/* 🌿 Loading shimmer */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-hemp-sage/30 rounded-lg" />
          ))}
        </div>
      )}

      {/* 🌿 No requests */}
      {!loading && timeOffs.length === 0 && (
        <div className="text-gray-600 italic bg-white border border-hemp-sage/40 rounded-lg p-4 shadow-sm text-center">
          No time-off requests yet. Click “Request Time Off” to start one.
        </div>
      )}

      {/* 🌿 Table */}
      {!loading && timeOffs.length > 0 && (
        <div className="overflow-x-auto border border-hemp-sage/50 rounded-xl bg-white shadow-sm">
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
              {timeOffs.map((t) => {
                const statusColor =
                  t.status === "Approved"
                    ? "text-hemp-green font-semibold"
                    : t.status === "Denied"
                    ? "text-red-600 font-semibold"
                    : "text-amber-600 font-medium";

                return (
                  <tr
                    key={t.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition"
                  >
                    <td className="p-3">
                      {new Date(t.start_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3">
                      {new Date(t.end_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3 text-gray-700">{t.reason}</td>
                    <td className={`p-3 ${statusColor}`}>{t.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 🌿 Form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <EmpTimeOffForm
            onClose={() => setIsFormOpen(false)}
            onSave={fetchTimeOffs}
          />
        </div>
      )}
    </div>
  );
}
