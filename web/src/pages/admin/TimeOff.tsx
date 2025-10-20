import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import TimeOffForm from "./TimeOffForm";
import { Edit3, Trash2, PlaneTakeoff } from "lucide-react";

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
    const { data, error } = await supabase.rpc("get_time_off_with_profiles");
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "denied":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2 sm:mb-0">
          Leave Request
        </h1>
        <Button
          onClick={handleAdd}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 shadow-card inline-flex items-center gap-2"
        >
          <PlaneTakeoff size={18} />
          Add Request
        </Button>
      </div>

      {/* 🌿 Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading requests...</div>
        ) : timeOffs.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">No requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Start Date</th>
                  <th className="px-4 py-3 text-left">End Date</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeOffs.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {t.full_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(t.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(t.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{t.reason}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusStyle(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleEdit(t)}
                        variant="outline"
                        className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                      >
                        <Edit3 size={15} />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        onClick={() => handleDelete(t.id)}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌿 Add/Edit Modal */}
      {isFormOpen && (
        <TimeOffForm
          request={selectedRequest}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchRequests}
        />
      )}
    </section>
  );
}
