export interface Schedule {
  id: string;
  employee_id: string;
  date: string;
  time_in: string;
  time_out: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}
