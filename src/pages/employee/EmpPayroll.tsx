import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";
import { useInvoice } from "../../hooks/useInvoice";
import { notifyError } from "../../utils/notify";
import InvoiceModal from "../../components/payroll/InvoiceModal";
import type { InvoiceData } from "../../types/payroll";


/**
 * 🌿 EmpPayroll
 * Employees view, confirm, or decline their payroll invoices.
 */
export default function EmpPayroll() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const { invoices, loading, fetchEmployeeInvoices, confirmInvoice, declineInvoice } =
    useInvoice();

  /** 🔐 Load logged-in user */
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        notifyError(error.message);
        return;
      }
      setUserId(user?.id || null);
      if (user?.id) fetchEmployeeInvoices(user.id);
    };
    loadUser();
  }, [fetchEmployeeInvoices]);

  /** 🧾 Confirm invoice */
  const handleConfirm = async (id: string) => {
    await confirmInvoice(id);
    if (userId) fetchEmployeeInvoices(userId);
  };

  /** ❌ Decline invoice */
  const handleDecline = async (id: string) => {
    await declineInvoice(id);
    if (userId) fetchEmployeeInvoices(userId);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* === Header === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-green-800">My Payroll</h1>
          <p className="text-sm text-green-700/70">
            Review and confirm your payroll invoices.
          </p>
        </div>
      </div>

      {/* === Invoices Table === */}
      <div className="overflow-x-auto bg-white rounded-md border border-green-100 shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-green-100 text-green-900 font-medium">
            <tr>
              <th className="px-4 py-2">Period</th>
              <th className="px-4 py-2">Hours</th>
              <th className="px-4 py-2">Rate</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-green-600">
                  <Loader2 className="animate-spin w-5 h-5 inline-block mr-2" />
                  Loading invoices...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-green-600">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.invoice_id}
                  className="border-t border-green-100 hover:bg-green-50 transition"
                >
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
                    ) : inv.confirmed ? (
                      <span className="text-blue-700 font-medium">Confirmed</span>
                    ) : (
                      <span className="text-gray-600">Pending</span>
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
                      {!inv.confirmed && !inv.released && (
                        <>
                          <button
                            onClick={() => handleConfirm(inv.invoice_id)}
                            className="text-blue-700 hover:text-blue-900"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleDecline(inv.invoice_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
