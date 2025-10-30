import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { EmployeeForm } from "./EmployeeForm/index";

import {
  Pencil,
  Trash2,
  UserPlus,
  Search,
  ArrowUpDown,
  Phone,
} from "lucide-react";
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Pagination,
  Stack,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
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

const EdgyCard = styled(Card)({
  borderRadius: 0,
  border: "1px solid #d1d5db",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
});

const EdgyButton = styled(Button)({
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 600,
});

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [employeeType, setEmployeeType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
        notifySuccess("Employee deleted successfully!");
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
      "<mark style=\"background:#e5ede6;color:#14532d;font-weight:600;\">$1</mark>"
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
    filtered = [...filtered].sort((a, b) =>
      sortOrder === "asc"
        ? a.full_name.localeCompare(b.full_name)
        : b.full_name.localeCompare(a.full_name)
    );
    return filtered;
  }, [employees, searchTerm, employeeType, sortOrder]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        gap={2}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{ color: "#1e293b", fontWeight: 700 }}
        >
          Employees
        </Typography>
        <EdgyButton
          fullWidth={isMobile}
          variant="contained"
          onClick={handleAdd}
          sx={{
            backgroundColor: "#15803d",
            color: "white",
            "&:hover": { backgroundColor: "#14532d", color: "white" },
          }}
          startIcon={<UserPlus size={18} />}
        >
          Add Employee
        </EdgyButton>
      </Stack>

      {/* Filters */}
      <EdgyCard sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <TextField
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#6b7280" />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              "& fieldset": { borderRadius: 0 },
            }}
          />
          <FormControl fullWidth={isMobile} sx={{ minWidth: { sm: 160 } }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={employeeType}
              label="Type"
              onChange={(e) => setEmployeeType(e.target.value)}
              sx={{ borderRadius: 0 }}
            >
              <MenuItem value="all">All Employees</MenuItem>
              <MenuItem value="va">Virtual Assistants</MenuItem>
              <MenuItem value="store">Store Staff</MenuItem>
            </Select>
          </FormControl>
          <EdgyButton
            variant="outlined"
            fullWidth={isMobile}
            onClick={toggleSortOrder}
            sx={{
              color: "#1e293b",
              borderColor: "#15803d",
              "&:hover": { background: "#15803d", color: "white" },
            }}
            startIcon={<ArrowUpDown size={18} />}
          >
            {sortOrder === "asc" ? "Sort A–Z" : "Sort Z–A"}
          </EdgyButton>
        </Stack>
      </EdgyCard>

      {/* Table / Mobile List */}
      <EdgyCard>
        {loading ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <CircularProgress sx={{ color: "#15803d" }} />
          </Box>
        ) : isMobile ? (
          // Mobile card layout
          <Stack divider={<Box sx={{ borderBottom: "1px solid #e5e7eb" }} />}>
            {paginatedEmployees.map((emp) => (
              <Box key={emp.id} sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: "#14532d" }}
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(emp.full_name),
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "#374151" }}
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(emp.email),
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "#6b7280", mt: 0.5 }}
                    >
                      <Phone size={14} style={{ marginRight: 4 }} />
                      {emp.contact_number || "No contact"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        display: "inline-block",
                        textTransform: "capitalize",
                        backgroundColor: "#e5ede6",
                        color: "#14532d",
                        px: 1,
                        py: 0.25,
                      }}
                    >
                      {emp.employee_type}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={() => handleEdit(emp)}
                      sx={{
                        color: "#15803d",
                        "&:hover": { backgroundColor: "#dcfce7" },
                      }}
                      size="small"
                    >
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(emp.id)}
                      sx={{
                        color: "#dc2626",
                        "&:hover": { backgroundColor: "#fee2e2" },
                      }}
                      size="small"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          // Desktop table layout
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 0, overflowX: "auto" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#15803d" }}>
                  {["Name", "Email", "Type", "Contact", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ color: "white", fontWeight: 700 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "#f1f5f9" },
                    }}
                  >
                    <TableCell
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(emp.full_name),
                      }}
                    />
                    <TableCell
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(emp.email),
                      }}
                    />
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {emp.employee_type}
                    </TableCell>
                    <TableCell>{emp.contact_number || "-"}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(emp)}
                        sx={{
                          color: "#15803d",
                          "&:hover": { backgroundColor: "#dcfce7" },
                        }}
                        size="small"
                      >
                        <Pencil size={16} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(emp.id)}
                        sx={{
                          color: "#dc2626",
                          "&:hover": { backgroundColor: "#fee2e2" },
                        }}
                        size="small"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </EdgyCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack alignItems="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            shape="square"
            size={isMobile ? "small" : "medium"}
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 0,
                "&.Mui-selected": {
                  backgroundColor: "#15803d",
                  color: "white",
                },
              },
            }}
          />
        </Stack>
      )}

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchEmployees}
        />
      )}
    </Box>
  );
}
