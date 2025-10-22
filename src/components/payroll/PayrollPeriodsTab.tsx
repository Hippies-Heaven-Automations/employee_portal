import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, CalendarPlus, Trash2 } from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";

interface PayrollPeriod {
  id: string;
  date_started: string;
  date_ended: string;
  release_date: string;
  created_at?: string;
}

export default function PayrollPeriodsTab() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [dateStarted, setDateStarted] = useState("");
  const [dateEnded, setDateEnded] = useState("");
  const [releaseDate, setReleaseDate] = useState("");

  /** 🧠 Fetch payroll periods */
  const fetchPeriods = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payrolls")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) notifyError(error.message);
    else setPeriods((data as PayrollPeriod[]) || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  /** ➕ Create a new payroll period */
  const handleAddPeriod = async () => {
    if (!dateStarted || !dateEnded || !releaseDate) {
      notifyError("Please fill all date fields");
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("payrolls").insert([
      {
        date_started: dateStarted,
        date_ended: dateEnded,
        release_date: releaseDate,
      },
    ]);
    if (error) notifyError(error.message);
    else {
      notifySuccess("Payroll period added");
      setDateStarted("");
      setDateEnded("");
      setReleaseDate("");
      fetchPeriods();
    }
    setAdding(false);
  };

  /** 🗑️ Delete payroll period */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payroll period?")) return;
    const { error } = await supabase.from("payrolls").delete().eq("id", id);
    if (error) notifyError(error.message);
    else {
      notifySuccess("Deleted successfully");
      setPeriods(periods.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* === Add New Payroll Period === */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h2 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
          <CalendarPlus size={18} /> Add New Payroll Period
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-green-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateStarted}
              onChange={(e) => setDateStarted(e.target.value)}
              className="w-full border border-green-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-green-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateEnded}
              onChange={(e) => setDateEnded(e.target.value)}
              className="w-full border border-green-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-green-700 mb-1">Release Date</label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full border border-green-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAddPeriod}
            disabled={adding}
            className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            {adding ? <Loader2 className="animate-spin inline w-4 h-4 mr-2" /> : "Add Period"}
          </button>
        </div>
      </div>

      {/* === Payroll Periods Table === */}
      <div className="overflow-x-auto bg-white rounded-md border border-green-100 shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-green-100 text-green-900 font-medium">
            <tr>
              <th className="px-4 py-2">Start</th>
              <th className="px-4 py-2">End</th>
              <th className="px-4 py-2">Release</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-green-600">
                  <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" />
                  Loading payroll periods...
                </td>
              </tr>
            ) : periods.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-green-600">
                  No payroll periods yet.
                </td>
              </tr>
            ) : (
              periods.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-green-100 hover:bg-green-50 transition"
                >
                  <td className="px-4 py-2">{p.date_started}</td>
                  <td className="px-4 py-2">{p.date_ended}</td>
                  <td className="px-4 py-2">{p.release_date}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
