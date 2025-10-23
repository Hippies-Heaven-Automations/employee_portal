import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, Signature, X } from "lucide-react";
import { notifyError } from "../../utils/notify";

interface TrackerRow {
  employee_id: string;
  agreement_id: string;
  employee_name: string;
  employee_type: string;
  agreement_title: string;
  signed_at: string | null;
  status: string;
  signature_base64: string | null;
}

export default function AgreementTracker() {
  const [records, setRecords] = useState<TrackerRow[]>([]);
  const [filtered, setFiltered] = useState<TrackerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState<string[]>([]);
  const [agreements, setAgreements] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedAgreement, setSelectedAgreement] = useState<string>("");

  const [showSignature, setShowSignature] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TrackerRow | null>(null);

    // 🌿 Fetch agreement tracker records
    useEffect(() => {
    const fetchData = async () => {
        try {
        setLoading(true);
        const { data, error } = await supabase
            .from("agreement_summary")
            .select("*")
            .order("signed_at", { ascending: false });

        if (error) throw error;

        interface SummaryRow {
            employee_id: string;
            agreement_id: string;
            employee_name: string;
            employee_type: string;
            agreement_title: string;
            signed_at: string | null;
            status: string;
            signature_base64: string | null;
        }

        const formatted: TrackerRow[] =
            (data as SummaryRow[]).map((row) => ({
            employee_id: row.employee_id,
            agreement_id: row.agreement_id,
            employee_name: row.employee_name || "Unknown",
            employee_type: row.employee_type || "—",
            agreement_title: row.agreement_title || "Untitled Agreement",
            signed_at: row.signed_at,
            status: row.status,
            signature_base64: row.signature_base64,
            })) || [];

        setRecords(formatted);
        setFiltered(formatted);
        setEmployees(Array.from(new Set(formatted.map((r) => r.employee_name))));
        setAgreements(Array.from(new Set(formatted.map((r) => r.agreement_title))));
        } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch agreement tracker.";
        notifyError(message);
        } finally {
        setLoading(false);
        }
    };
    fetchData();
    }, []);


  // 🔍 Filters
  useEffect(() => {
    let results = [...records];
    if (selectedEmployee)
      results = results.filter((r) => r.employee_name === selectedEmployee);
    if (selectedAgreement)
      results = results.filter((r) => r.agreement_title === selectedAgreement);
    setFiltered(results);
  }, [selectedEmployee, selectedAgreement, records]);

  // ⏳ Loading
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        <Loader2 className="mr-2 animate-spin" /> Loading agreement tracker...
      </div>
    );

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest flex items-center gap-2 mb-2 sm:mb-0">
          <Signature size={26} className="text-hemp-green" />
          Agreement Tracker
        </h1>
      </div>

      {/* 🌿 Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-semibold text-hemp-forest mb-1">
            Employee
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="rounded-lg border border-hemp-sage/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green"
          >
            <option value="">All Employees</option>
            {employees.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-hemp-forest mb-1">
            Agreement
          </label>
          <select
            value={selectedAgreement}
            onChange={(e) => setSelectedAgreement(e.target.value)}
            className="rounded-lg border border-hemp-sage/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green"
          >
            <option value="">All Agreements</option>
            {agreements.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        {(selectedEmployee || selectedAgreement) && (
          <button
            onClick={() => {
              setSelectedEmployee("");
              setSelectedAgreement("");
            }}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 🌿 Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-gray-500 italic">
            No matching records found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Agreement</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Signed</th>
                  <th className="p-3 text-center">Signature</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition"
                  >
                    <td className="p-3">{r.employee_name}</td>
                    <td className="p-3">{r.employee_type}</td>
                    <td className="p-3">{r.agreement_title}</td>
                    <td
                      className={`p-3 text-center font-medium ${
                        r.status === "signed"
                          ? "text-green-600"
                          : r.status === "revoked"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {r.status}
                    </td>
                    <td className="p-3 text-center text-gray-600">
                      {r.signed_at
                        ? new Date(r.signed_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                    <td className="p-3 text-center">
                      {r.signature_base64 ? (
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setShowSignature(true);
                          }}
                          className="rounded-md bg-hemp-green/10 px-3 py-1 text-xs font-semibold text-hemp-forest hover:bg-hemp-green/20 transition"
                        >
                          View Signature
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌿 Modal: View Signature */}
      {showSignature && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white border border-hemp-sage rounded-2xl shadow-xl w-full max-w-lg animate-fadeInUp">
            <div className="flex justify-between items-center px-6 py-4 bg-hemp-sage/30 border-b border-hemp-sage/50">
              <h2 className="text-lg font-semibold text-hemp-forest">
                Signature — {selectedRecord.employee_name}
              </h2>
              <button
                onClick={() => {
                  setShowSignature(false);
                  setSelectedRecord(null);
                }}
                className="text-gray-600 hover:text-hemp-green transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 flex justify-center items-center">
              {selectedRecord.signature_base64 ? (
                <img
                  src={`data:image/png;base64,${selectedRecord.signature_base64}`}
                  alt="Employee Signature"
                  className="max-h-64 object-contain border border-hemp-sage/40 rounded-md"
                />
              ) : (
                <p className="text-gray-500 italic">No signature data found.</p>
              )}
            </div>

            <div className="flex justify-end border-t border-hemp-sage/40 px-6 py-4">
              <button
                onClick={() => {
                  setShowSignature(false);
                  setSelectedRecord(null);
                }}
                className="bg-hemp-green hover:bg-hemp-forest text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
