import { BrowserRouter as Router, Routes } from "react-router-dom";

// Modular route groups
import PublicRoutes from "@/app/routes/public.routes";
import AdminRoutes from "@/app/routes/admin.routes";
import EmployeeRoutes from "@/app/routes/employee.routes";

export default function App() {
  return (
    <Router>
      <Routes>
        {PublicRoutes}
        {AdminRoutes}
        {EmployeeRoutes}
      </Routes>
    </Router>
  );
}
