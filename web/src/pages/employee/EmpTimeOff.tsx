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

  const fetchTimeOffs = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(userError);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("time_off_requests")
      .select("id, start_date, end_date, reason, status, created_at")
      .eq("employee_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTimeOffs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTimeOffs();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Time-Off Requests</h1>
        <Button onClick={() => setIsFormOpen(true)}>Request Time Off</Button>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : timeOffs.length === 0 ? (
        <p>No time-off requests yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Start Date</th>
                <th className="p-2 text-left">End Date</th>
                <th className="p-2 text-left">Reason</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {timeOffs.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-2">
                    {new Date(t.start_date).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    {new Date(t.end_date).toLocaleDateString()}
                  </td>
                  <td className="p-2">{t.reason}</td>
                  <td
                    className={`p-2 font-semibold ${
                      t.status === "Approved"
                        ? "text-green-600"
                        : t.status === "Denied"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {t.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <EmpTimeOffForm
          onClose={() => setIsFormOpen(false)}
          onSave={fetchTimeOffs}
        />
      )}
    </div>
  );
}
