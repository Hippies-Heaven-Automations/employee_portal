import { useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { notifySuccess, notifyError } from "../utils/notify";
import { InvoiceData } from "../types/payroll";


export interface InvoiceRecord {
  id: string;
  employee_id: string;
  payroll_item_id: string;
  admin_verified: boolean;
  confirmed: boolean;
  released: boolean;
  date_ended?: string;
}

export function useInvoice() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);

  /** 🌿 Fetch all invoices (admin) */
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("v_invoice_data")
      .select("*")
      .order("date_ended", { ascending: false });
    if (error) notifyError(error.message);
    else setInvoices((data as InvoiceData[]) || []);
    setLoading(false);
  }, []);

  /** 🌿 Fetch employee-specific invoices */
  const fetchEmployeeInvoices = useCallback(async (employeeId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("v_invoice_data")
      .select("*")
      .eq("employee_id", employeeId)
      .order("date_ended", { ascending: false });
    if (error) notifyError(error.message);
    else setInvoices((data as InvoiceData[]) || []);
    setLoading(false);
  }, []);

  /** 🧾 Create invoice (employee auto-generation) */
  const createInvoice = useCallback(
    async (employeeId: string, payrollItemId: string) => {
      const { error } = await supabase.from("payroll_invoices").insert([
        {
          employee_id: employeeId,
          payroll_item_id: payrollItemId,
          confirmed: false,
          admin_verified: false,
          released: false,
        },
      ]);
      if (error) throw error;
      notifySuccess("Invoice created successfully");
    },
    []
  );

  /** ✅ Employee confirm invoice */
  const confirmInvoice = useCallback(async (invoiceId: string) => {
    const { error } = await supabase
      .from("payroll_invoices")
      .update({ confirmed: true })
      .eq("id", invoiceId);
    if (error) notifyError(error.message);
    else notifySuccess("Invoice confirmed");
  }, []);

  /** ❌ Employee decline invoice */
  const declineInvoice = useCallback(async (invoiceId: string) => {
    const { error } = await supabase
      .from("payroll_invoices")
      .update({ confirmed: false })
      .eq("id", invoiceId);
    if (error) notifyError(error.message);
    else notifySuccess("Invoice declined");
  }, []);

  /** 🔎 Admin verify invoice */
  const verifyInvoice = useCallback(async (invoiceId: string) => {
    const { error } = await supabase
      .from("payroll_invoices")
      .update({ admin_verified: true })
      .eq("id", invoiceId);
    if (error) notifyError(error.message);
    else notifySuccess("Invoice verified");
  }, []);

  /** 💸 Admin release payroll */
  const releaseInvoices = useCallback(async (invoiceIds: string[]) => {
    const { error } = await supabase
      .from("payroll_invoices")
      .update({ released: true })
      .in("id", invoiceIds);
    if (error) notifyError(error.message);
    else notifySuccess("Payroll released successfully");
  }, []);

  return {
    invoices,
    loading,
    fetchInvoices,
    fetchEmployeeInvoices,
    createInvoice,
    confirmInvoice,
    declineInvoice,
    verifyInvoice,
    releaseInvoices,
  };
}
