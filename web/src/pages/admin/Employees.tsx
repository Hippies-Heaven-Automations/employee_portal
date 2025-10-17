import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import EmployeeForm from "./EmployeeForm";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  contact_number?: string;
  address?: string;
  emergency_contact?: string;
  employee_type: string;
  created_at: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setEmployees(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchEmployees();
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={handleAdd}>Add Employee</Button>
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Contact</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-t">
                  <td className="p-2">{emp.full_name}</td>
                  <td className="p-2">{emp.email}</td>
                  <td className="p-2">{emp.employee_type}</td>
                  <td className="p-2">{emp.contact_number}</td>
                  <td className="p-2 space-x-2">
                    <Button onClick={() => handleEdit(emp)} variant="outline">Edit</Button>
                    <Button onClick={() => handleDelete(emp.id)} variant="ghost">Delete</Button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchEmployees}
        />
      )}
    </div>
  );
}
