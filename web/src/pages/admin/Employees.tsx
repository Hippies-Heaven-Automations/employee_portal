import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import EmployeeForm from "./EmployeeForm";
import { Pencil, Trash2, UserPlus, Search, ArrowUpDown } from "lucide-react";

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

  // 🌿 New states for filters and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeType, setEmployeeType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // 🌿 Apply filters + search + sorting client-side
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // filter by employee type
    if (employeeType !== "all") {
      filtered = filtered.filter(
        (emp) => emp.employee_type?.toLowerCase() === employeeType
      );
    }

    // search by name or email
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.full_name.toLowerCase().includes(lowerSearch) ||
          emp.email.toLowerCase().includes(lowerSearch)
      );
    }

    // sort by name
    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === "asc") return a.full_name.localeCompare(b.full_name);
      return b.full_name.localeCompare(a.full_name);
    });

    return filtered;
  }, [employees, searchTerm, employeeType, sortOrder]);

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

      {/* 🌿 Smart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm transition-all duration-300">
        {/* Left side: search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 sm:min-w-[260px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green transition-all"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={employeeType}
              onChange={(e) => setEmployeeType(e.target.value)}
              className="appearance-none border border-hemp-sage/50 bg-white/60 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green cursor-pointer transition-all"
            >
              <option value="all">All Employees</option>
              <option value="va">Virtual Assistants</option>
              <option value="store">Store Staff</option>
            </select>
            <svg
              className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Right side: sort toggle */}
        <Button
          onClick={toggleSortOrder}
          variant="outline"
          className="border-hemp-green/60 text-hemp-forest hover:bg-hemp-green hover:text-white transition-all rounded-lg px-5 py-2.5 flex items-center gap-2 shadow-sm"
        >
          <ArrowUpDown size={18} />
          <span className="font-medium">
            {sortOrder === "asc" ? "Sort A–Z" : "Sort Z–A"}
          </span>
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
                {filteredEmployees.map((emp) => (
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
                      <Button
                        onClick={() => handleEdit(emp)}
                        variant="outline"
                        className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                      >
                        <Pencil size={15} />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

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
                {filteredEmployees.length === 0 && (
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
