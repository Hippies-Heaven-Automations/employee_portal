import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { Clock, Edit3, Trash2, FilePlus } from "lucide-react";

interface ShiftLog {
  id: string;
  employee_id: string;
  full_name: string;
  shift_start: string;
  shift_end: string | null;
  duration: string | null;
  notes: string | null;
}

interface Employee {
  id: string;
  full_name: string;
}

export default function ShiftLogs() {
  const [logs, setLogs] = useState<ShiftLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ShiftLog | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    shift_start: "",
    shift_end: "",
    notes: "",
  });

  // ✅ Fetch logs and employees
  useEffect(() => {
    fetchLogs();
    fetchEmployees();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shift_logs_view")
      .select("*")
      .order("shift_start", { ascending: false });
    if (!error) setLogs(data || []);
    setLoading(false);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .order("full_name", { ascending: true });
    if (!error) setEmployees(data || []);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      employee_id: formData.employee_id,
      shift_start: formData.shift_start ? new Date(formData.shift_start).toISOString() : null,
      shift_end: formData.shift_end ? new Date(formData.shift_end).toISOString() : null,
      notes: formData.notes,
    };

    let res;
    if (selected) {
      res = await supabase.from("shift_logs").update(payload).eq("id", selected.id);
    } else {
      res = await supabase.from("shift_logs").insert([payload]);
    }

    if (res.error) alert(res.error.message);
    else {
      setIsFormOpen(false);
      setSelected(null);
      fetchLogs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shift log?")) return;
    const { error } = await supabase.from("shift_logs").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchLogs();
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) return "-";
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (!match) return duration;
    const [, h, m] = match;
    return `${parseInt(h)}h ${parseInt(m)}m`;
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2 sm:mb-0 flex items-center gap-2">
          <Clock size={24} className="text-hemp-green" />
          Shift Logs
        </h1>
        <Button
          onClick={() => {
            setFormData({ employee_id: "", shift_start: "", shift_end: "", notes: "" });
            setSelected(null);
            setIsFormOpen(true);
          }}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 shadow-card flex items-center gap-2"
        >
          <FilePlus size={18} />
          Add Shift
        </Button>
      </div>

      {/* 🌿 Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading shift logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">No shift logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Time In</th>
                  <th className="px-4 py-3 text-left">Time Out</th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium">{log.full_name}</td>
                    <td className="px-4 py-3">
                      {new Date(log.shift_start).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {log.shift_end ? new Date(log.shift_end).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">{formatDuration(log.duration)}</td>
                    <td className="px-4 py-3">{log.notes || "-"}</td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          setSelected(log);
                          setFormData({
                            employee_id: log.employee_id,
                            shift_start: log.shift_start,
                            shift_end: log.shift_end || "",
                            notes: log.notes || "",
                          });
                          setIsFormOpen(true);
                        }}
                        variant="outline"
                        className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                      >
                        <Edit3 size={15} />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        onClick={() => handleDelete(log.id)}
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

      {/* 🌿 Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white border border-hemp-sage rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeInUp">
            <div className="flex items-center justify-between px-6 py-4 bg-hemp-sage/30 border-b border-hemp-sage/50">
              <h2 className="text-xl font-semibold text-hemp-forest">
                {selected ? "Edit Shift Log" : "Add Shift Log"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-600 hover:text-hemp-green transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 text-gray-700">
              <div>
                <label className="block text-sm font-semibold mb-2">Employee</label>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-hemp-green"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Time In</label>
                  <input
                    type="datetime-local"
                    name="shift_start"
                    value={formData.shift_start ? formData.shift_start.slice(0, 16) : ""}
                    onChange={handleChange}
                    className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Time Out</label>
                  <input
                    type="datetime-local"
                    name="shift_end"
                    value={formData.shift_end ? formData.shift_end.slice(0, 16) : ""}
                    onChange={handleChange}
                    className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 focus:ring-2 focus:ring-hemp-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Add remarks or summary..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border border-hemp-sage/60 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-hemp-green"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-hemp-sage/40">
                <Button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg px-5 py-2 transition"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition"
                >
                  {selected ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
