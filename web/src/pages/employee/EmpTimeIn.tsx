import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";

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

  // ✅ Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  // ✅ Fetch all logs
  const fetchLogs = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("shift_logs")
      .select("*")
      .eq("employee_id", userId)
      .order("shift_start", { ascending: false });

    if (!error && data) {
      setLogs(data);
      const openShift = data.find((log) => !log.shift_end);
      setIsClockedIn(!!openShift);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  // ✅ Live duration updater
  useEffect(() => {
    if (!isClockedIn || !logs.length) {
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

    updateDuration(); // Run immediately
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isClockedIn, logs]);

  // ✅ Time In / Time Out logic
  const handleClock = async () => {
    if (!userId) return;

    if (!isClockedIn) {
      const { error } = await supabase
        .from("shift_logs")
        .insert([{ employee_id: userId, shift_start: new Date().toISOString() }]);
      if (error) alert(error.message);
    } else {
      const { data: openShift } = await supabase
        .from("shift_logs")
        .select("id")
        .eq("employee_id", userId)
        .is("shift_end", null)
        .limit(1)
        .maybeSingle();

      if (openShift) {
        const { error } = await supabase
          .from("shift_logs")
          .update({ shift_end: new Date().toISOString() })
          .eq("id", openShift.id);
        if (error) alert(error.message);
      }
    }

    fetchLogs();
  };

  // ✅ Format DB duration for closed shifts
  const formatDuration = (duration: string | null) => {
    if (!duration) return "-";
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (!match) return duration;
    const [_, hours, minutes] = match;
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    return `${h > 0 ? `${h}h ` : ""}${m}m`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">My Time Logs</h1>

      {/* ✅ Big dynamic button */}
      <div className="flex flex-col items-center mb-6 space-y-2">
        <Button
          onClick={handleClock}
          className={`px-12 py-4 text-lg font-semibold rounded-xl shadow-md ${
            isClockedIn ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          } text-white`}
        >
          {isClockedIn ? "Time Out" : "Time In"}
        </Button>

        {/* ✅ Live timer */}
        {isClockedIn && (
          <p className="text-gray-700 font-medium mt-2">
            ⏱️ Current Session: {liveDuration}
          </p>
        )}
      </div>

      {/* ✅ Table of past logs */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-500">No shift logs yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Time In</th>
                <th className="p-2 text-left">Time Out</th>
                <th className="p-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-2">{new Date(log.shift_start).toLocaleDateString()}</td>
                  <td className="p-2">{new Date(log.shift_start).toLocaleTimeString()}</td>
                  <td className="p-2">
                    {log.shift_end ? new Date(log.shift_end).toLocaleTimeString() : "-"}
                  </td>
                  <td className="p-2">{formatDuration(log.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
