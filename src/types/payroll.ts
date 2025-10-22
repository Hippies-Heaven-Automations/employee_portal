// Single source of truth for invoice rows coming from v_invoice_data
export interface InvoiceData {
  // ids
  id: string;
  invoice_id: string;
  employee_id: string;
  payroll_item_id?: string;

  // display / naming
  invoice_no?: string;
  full_name?: string;
  position?: string;
  description?: string;

  // dates
  date_issued?: string;
  date_started?: string;
  date_ended?: string;

  // numbers
  hrs_worked?: number;
  rate?: number;
  subtotal?: number;
  total?: number;

  // statuses
  confirmed?: boolean;
  admin_verified?: boolean;
  released?: boolean;

  // payout details (needed by InvoicePreview)
  wise_tag?: string;
  wise_email?: string;
  bank_name?: string;
  account_number?: string;
}
