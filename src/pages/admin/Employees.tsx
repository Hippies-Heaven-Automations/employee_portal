import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import EmployeeForm from "./EmployeeForm";
import {
  Pencil,
  Trash2,
  UserPlus,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { confirmAction } from "../../utils/confirm";
import { notifySuccess, notifyError } from "../../utils/notify";

interface Employee {
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
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [employeeType, setEmployeeType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) notifyError(`Error fetching employees: ${error.message}`);
    else setEmployees(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = (id: string) => {
    confirmAction("Are you sure you want to delete this employee?", async () => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) notifyError(`Error deleting employee: ${error.message}`);
      else {
        notifySuccess("✅ Employee deleted successfully!");
        fetchEmployees();
      }
    });
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

  const highlightMatch = (text: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(
      regex,
      `<mark class='bg-hemp-sage/40 text-hemp-forest font-semibold'>$1</mark>`
    );
  };

  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    if (employeeType !== "all") {
      filtered = filtered.filter(
        (emp) => emp.employee_type?.toLowerCase() === employeeType
      );
    }

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.full_name.toLowerCase().includes(lower) ||
          emp.email.toLowerCase().includes(lower)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === "asc") return a.full_name.localeCompare(b.full_name);
      return b.full_name.localeCompare(a.full_name);
    });

    return filtered;
  }, [employees, searchTerm, employeeType, sortOrder]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
        <h1 className="text-3xl font-bold text-hemp-forest">Employees</h1>
        <Button
          onClick={handleAdd}
          className="w-full sm:w-auto bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-6 py-2 transition-all duration-300 shadow-card inline-flex justify-center items-center gap-2"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">Add Employee</span>
        </Button>
      </div>

      {/* 🌿 Smart Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green transition-all"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={employeeType}
              onChange={(e) => {
                setEmployeeType(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none border border-hemp-sage/50 bg-white/60 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green cursor-pointer transition-all w-full sm:w-auto"
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

        {/* Sort Button */}
        <Button
          onClick={toggleSortOrder}
          variant="outline"
          className="w-full sm:w-auto border-hemp-green/60 text-hemp-forest hover:bg-hemp-green hover:text-white transition-all rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowUpDown size={18} />
          <span className="hidden sm:inline font-medium">
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
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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
                  {paginatedEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all"
                    >
                      <td
                        className="px-4 py-3 font-medium text-gray-800"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(emp.full_name),
                        }}
                      />
                      <td
                        className="px-4 py-3 text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(emp.email),
                        }}
                      />
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
                          <Pencil size={15} /> Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(emp.id)}
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
                        >
                          <Trash2 size={16} /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-hemp-sage/40">
              {paginatedEmployees.map((emp) => (
                <div key={emp.id} className="p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2
                        className="text-lg font-semibold text-hemp-forest"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(emp.full_name),
                        }}
                      />
                      <p
                        className="text-sm text-gray-500"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(emp.email),
                        }}
                      />
                    </div>
                    <span className="px-2 py-1 text-xs rounded bg-hemp-sage/30 text-hemp-forest capitalize">
                      {emp.employee_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    📞 {emp.contact_number || "No contact"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(emp)}
                      variant="outline"
                      className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <Pencil size={14} />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      onClick={() => handleDelete(emp.id)}
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 px-3 py-1 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 🌿 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === page
                  ? "bg-hemp-green text-white"
                  : "bg-white text-hemp-forest border border-hemp-sage hover:bg-hemp-mist"
              }`}
            >
              {page}
            </button>
          ))}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Next
          </Button>
        </div>
      )}

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
