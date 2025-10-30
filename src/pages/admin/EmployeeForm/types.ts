export interface Employee {
  id: string;
  full_name: string;
  email: string;
  contact_number?: string;
  address?: string;
  emergency_contact?: string;
  emergency_contact_phone?: string;
  ssn_last4?: string;
  driver_license_no?: string;
  start_date?: string;
  pay_rate?: number;
  shirt_size?: string;
  hoodie_size?: string;
  employee_type: "Store" | "VA";
  position?: string;
  acronym?: string;
  nickname?: string;
  wise_tag?: string;
  wise_email?: string;
  bank_name?: string;
  account_number?: string;
  wecard_certified?: boolean;
  wecard_certificate_url?: string;
  created_at?: string;
}

export interface EmployeeFormProps {
  employee: Employee | null;
  onClose: () => void;
  onSave: () => void;
}
