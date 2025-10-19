import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import EmployeeForm from "./EmployeeForm";
import { Pencil, Trash2, UserPlus } from "lucide-react";

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
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2 sm:mb-0">
          Employees
        </h1>
        <Button
          onClick={handleAdd}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 shadow-card inline-flex items-center gap-2"
        >
          <UserPlus size={18} />
          Add Employee
        </Button>
      </div>

      {/* 🌿 Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading employees...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {emp.full_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{emp.email}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">
                      {emp.employee_type}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {emp.contact_number || "-"}
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      {/* ✏️ Edit */}
                      <Button
                        onClick={() => handleEdit(emp)}
                        variant="outline"
                        className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                      >
                        <Pencil size={15} />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

                      {/* 🗑 Delete */}
                      <Button
                        onClick={() => handleDelete(emp.id)}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-gray-500 italic"
                    >
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌿 Add/Edit Modal */}
      {isFormOpen && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchEmployees}
        />
      )}
    </section>
  );
}
