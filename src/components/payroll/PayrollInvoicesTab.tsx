import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, CheckCircle, Eye, FileCheck } from "lucide-react";
import { notifyError, notifySuccess } from "../../utils/notify";
import InvoiceModal from "./InvoiceModal";
import { InvoiceData } from "../../types/payroll";


/**
 * 🌿 PayrollInvoicesTab
 * Admin can view all invoices, verify confirmed ones, and mark payroll as released.
 */
export default function PayrollInvoicesTab() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  /** 🧠 Fetch invoices from view */
  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("v_invoice_data")
      .select("*")
      .order("date_ended", { ascending: false });

    if (error) notifyError(error.message);
    else setInvoices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  /** ✅ Verify invoice */
  const handleVerify = async (invoiceId?: string) => {
  if (!invoiceId) return notifyError("Invalid invoice ID");
    setVerifying(true);
    const { error } = await supabase
      .from("payroll_invoices")
      .update({ admin_verified: true })
      .eq("id", invoiceId);

    if (error) notifyError(error.message);
    else {
      notifySuccess("Invoice verified successfully");
      fetchInvoices();
    }
    setVerifying(false);
  };

  /** 💸 Mark payroll released */
  const handleRelease = async (invoiceIds: string[]) => {
    if (!confirm("Release selected payroll invoices?")) return;
    const { error } = await supabase
      .from("payroll_invoices")
      .update({ released: true })
      .in("id", invoiceIds);

    if (error) notifyError(error.message);
    else {
      notifySuccess("Payroll released for selected employees");
      fetchInvoices();
    }
  };

  const verifiedInvoices = invoices.filter((i) => i.admin_verified && !i.released);

  return (
    <div className="space-y-6">
      {/* === Header === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-green-800">Invoices</h2>
          <p className="text-sm text-green-700/70">
            View, verify, and release payroll invoices.
          </p>
        </div>
      </div>

      {/* === Loading State === */}
      {loading ? (
        <div className="text-center py-8 text-green-700">
          <Loader2 className="animate-spin w-6 h-6 inline-block mr-2" />
          Loading invoices...
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-8 text-green-700">No invoices found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-md border border-green-100 shadow-sm">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-green-100 text-green-900 font-medium">
              <tr>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Hours</th>
                <th className="px-4 py-2">Rate</th>
                <th className="px-4 py-2">Subtotal</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.invoice_id}
                  className="border-t border-green-100 hover:bg-green-50 transition"
                >
                  <td className="px-4 py-2">{inv.full_name}</td>
                  <td className="px-4 py-2">
                    {inv.date_started} → {inv.date_ended}
                  </td>
                  <td className="px-4 py-2">{inv.hrs_worked}</td>
                  <td className="px-4 py-2">${inv.rate?.toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium text-green-800">
                    ${inv.total?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {inv.released ? (
                      <span className="text-green-800 font-semibold">Released</span>
                    ) : inv.admin_verified ? (
                      <span className="text-blue-700 font-medium">Verified</span>
                    ) : inv.confirmed ? (
                      <span className="text-yellow-700 font-medium">Awaiting Verification</span>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-green-700 hover:text-green-900"
                      >
                        <Eye size={18} />
                      </button>
                      {!inv.admin_verified && inv.confirmed && (
                        <button
                          onClick={() => handleVerify(inv.invoice_id)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={verifying}
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === Release Payroll Button === */}
      {verifiedInvoices.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() =>
              handleRelease(
                verifiedInvoices
                  .map((v) => v.id)
                  .filter((id): id is string => Boolean(id)) 
              )
            }
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            <FileCheck size={16} /> Release Verified Payroll
          </button>
        </div>
      )}

      {/* === Invoice Preview Modal === */}
      {selectedInvoice && (
        <InvoiceModal
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoiceData={selectedInvoice}
        />
      )}
    </div>
  );
}
