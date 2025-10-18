import { useNavigate, NavLink } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/admin-dashboard" },
    { name: "Announcements", path: "/admin-dashboard/announcements" },
    { name: "Employee", path: "/admin-dashboard/employees" },
    { name: "Schedule", path: "/admin-dashboard/schedule" },
    { name: "Applications", path: "/admin-dashboard/applications" },
    { name: "Time Off", path: "/admin-dashboard/timeoff" },
    { name: "Shift Logs", path: "/admin-dashboard/shiftlogs" },
    { name: "QuizEditor", path: "/admin-dashboard/quizeditor" },
    { name: "Training Tracker", path: "/admin-dashboard/trainingtracker" },

  ];

  return (
    <nav className="bg-purple-700 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <h1 className="text-xl font-bold tracking-tight">Admin Portal 🌈</h1>

        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-purple-900" : "hover:bg-purple-600"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="ml-4 rounded-full bg-purple-900 px-3 py-2 text-sm hover:bg-purple-800"
            >
              👤
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 rounded-md bg-white text-gray-800 shadow-lg">
                <button
                  onClick={() => navigate("/admin-dashboard/profile")}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Update Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
