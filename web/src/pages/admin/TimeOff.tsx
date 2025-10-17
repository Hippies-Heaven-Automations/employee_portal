import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import TimeOffForm from "./TimeOffForm";

interface TimeOff {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  full_name: string | null;
}


export default function TimeOff() {
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TimeOff | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchRequests = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .rpc("get_time_off_with_profiles"); // call a SQL function instead

  if (error) console.error(error);
  else setTimeOffs(data || []);
  setLoading(false);
};


  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    const { error } = await supabase.from("time_off_requests").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchRequests();
  };

  const handleEdit = (request: TimeOff) => {
    setSelectedRequest(request);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedRequest(null);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Time-Off Requests</h1>
        <Button onClick={handleAdd}>Add Request</Button>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : timeOffs.length === 0 ? (
        <p>No time-off requests found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Employee</th>
                <th className="p-2 text-left">Start Date</th>
                <th className="p-2 text-left">End Date</th>
                <th className="p-2 text-left">Reason</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timeOffs.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-2">{t.full_name || "Unknown"}</td>
                  <td className="p-2">{new Date(t.start_date).toLocaleDateString()}</td>
                  <td className="p-2">{new Date(t.end_date).toLocaleDateString()}</td>
                  <td className="p-2">{t.reason}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        t.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : t.status === "denied"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-2 space-x-2">
                    <Button onClick={() => handleEdit(t)} variant="outline">Edit</Button>
                    <Button onClick={() => handleDelete(t.id)} variant="ghost">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <TimeOffForm
          request={selectedRequest}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchRequests}
        />
      )}
    </div>
  );
}