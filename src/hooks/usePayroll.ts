import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { notifyError } from "../utils/notify";

interface PayrollPeriod {
  id: string;
  date_started: string;
  date_ended: string;
  release_date: string;
}

interface PayrollItem {
  id?: string;
  payroll_id: string;
  employee_id: string;
  hrs_worked: number;
  rate: number;
  subtotal: number;
  total: number;
}

export function usePayroll() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(false);

  /** 🌿 Fetch payroll periods */
  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payrolls")
      .select("*")
      .order("date_started", { ascending: false });
    if (error) notifyError(error.message);
    else setPeriods(data || []);
    setLoading(false);
  }, []);

  /** 🌿 Fetch payroll items by period */
  const fetchItems = useCallback(async (payrollId: string) => {
    if (!payrollId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("payroll_items")
      .select(
        `
        id,
        payroll_id,
        employee_id,
        hrs_worked,
        rate,
        subtotal,
        total,
        profiles(full_name, position)
      `
      )
      .eq("payroll_id", payrollId)
      .order("date_ended", { ascending: false });
    if (error) notifyError(error.message);
    else setItems(data || []);
    setLoading(false);
  }, []);

  /** ➕ Create new payroll period */
  const addPeriod = useCallback(
    async (period: Omit<PayrollPeriod, "id">) => {
      const { error } = await supabase.from("payrolls").insert([period]);
      if (error) throw error;
      await fetchPeriods();
    },
    [fetchPeriods]
  );

  /** ❌ Delete payroll period */
  const deletePeriod = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("payrolls").delete().eq("id", id);
      if (error) throw error;
      setPeriods((prev) => prev.filter((p) => p.id !== id));
    },
    []
  );

  /** 💾 Save payroll items for a period */
  const saveItems = useCallback(
    async (payrollId: string, newItems: PayrollItem[]) => {
      if (!payrollId) throw new Error("No payroll selected");
      await supabase.from("payroll_items").delete().eq("payroll_id", payrollId);

      const payload = newItems.map((i) => ({
        payroll_id: payrollId,
        employee_id: i.employee_id,
        hrs_worked: i.hrs_worked,
        rate: i.rate,
        subtotal: i.hrs_worked * i.rate,
        total: i.hrs_worked * i.rate,
      }));

      const { error } = await supabase.from("payroll_items").insert(payload);
      if (error) throw error;
      await fetchItems(payrollId);
    },
    [fetchItems]
  );

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  return {
    periods,
    items,
    loading,
    fetchPeriods,
    fetchItems,
    addPeriod,
    deletePeriod,
    saveItems,
  };
}
