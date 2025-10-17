import { useNavigate, NavLink } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";

export default function EmployeeNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/employee-dashboard" },
    { name: "Schedule", path: "/employee-dashboard/schedule" },
    { name: "Time In", path: "/employee-dashboard/timein" },
    { name: "Time Off", path: "/employee-dashboard/timeoff" },
  ];

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <h1 className="text-xl font-bold tracking-tight">Employee Portal 🌿</h1>

        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-blue-900" : "hover:bg-blue-600"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="ml-4 rounded-full bg-blue-900 px-3 py-2 text-sm hover:bg-blue-800"
            >
              👤
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 rounded-md bg-white text-gray-800 shadow-lg">
                <button
                  onClick={() => navigate("/employee-dashboard/profile")}
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
