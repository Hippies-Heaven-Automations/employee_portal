import { Outlet } from "react-router-dom";
import EmployeeNavbar from "../components/EmployeeNavbar";

export default function EmployeeLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <EmployeeNavbar />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
