import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";

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

  // ✅ Fetch logs from view
  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shift_logs_view")
      .select("*")
      .order("shift_start", { ascending: false });

    if (error) console.error(error);
    else setLogs(data || []);
    setLoading(false);
  };

  // ✅ Fetch employee list
  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .order("full_name", { ascending: true });
    if (error) console.error(error);
    else setEmployees(data || []);
  };

  useEffect(() => {
    fetchLogs();
    fetchEmployees();
  }, []);

  // ✅ Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add / Update log
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

  // ✅ Delete log
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shift log?")) return;
    const { error } = await supabase.from("shift_logs").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchLogs();
  };

  // ✅ Format duration
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Shift Logs</h1>
        <Button onClick={() => { setIsFormOpen(true); setSelected(null); }}>Add Shift</Button>
      </div>

      {loading ? (
        <p>Loading shift logs...</p>
      ) : logs.length === 0 ? (
        <p>No shift logs found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Employee</th>
                <th className="p-2 text-left">Time In</th>
                <th className="p-2 text-left">Time Out</th>
                <th className="p-2 text-left">Duration</th>
                <th className="p-2 text-left">Notes</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-2">{log.full_name || "Unknown"}</td>
                  <td className="p-2">{new Date(log.shift_start).toLocaleString()}</td>
                  <td className="p-2">{log.shift_end ? new Date(log.shift_end).toLocaleString() : "-"}</td>
                  <td className="p-2">{formatDuration(log.duration)}</td>
                  <td className="p-2">{log.notes || "-"}</td>
                  <td className="p-2 space-x-2">
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
                    >
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(log.id)} variant="ghost">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {selected ? "Edit Shift Log" : "Add Shift Log"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                name="shift_start"
                value={formData.shift_start ? formData.shift_start.slice(0, 16) : ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
              <input
                type="datetime-local"
                name="shift_end"
                value={formData.shift_end ? formData.shift_end.slice(0, 16) : ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full border rounded p-2"
              ></textarea>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{selected ? "Update" : "Save"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
