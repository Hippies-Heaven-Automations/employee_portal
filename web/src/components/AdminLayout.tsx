import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AdminNavbar />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
