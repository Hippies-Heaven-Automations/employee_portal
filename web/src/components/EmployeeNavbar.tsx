import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Home,
  Calendar,
  Clock,
  Plane,
  GraduationCap,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function EmployeeNavbar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);   // desktop shrink
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const links = [
    { to: "/employee-dashboard", label: "Home", icon: Home },
    { to: "/employee-dashboard/schedule", label: "Schedule", icon: Calendar },
    { to: "/employee-dashboard/timein", label: "Time In", icon: Clock },
    { to: "/employee-dashboard/timeoff", label: "Time Off", icon: Plane },
    { to: "/employee-dashboard/training", label: "Training", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen flex bg-[#F5FBF5] text-green-900">
      {/* ===== Mobile Top Bar ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#F5FBF5]/95 backdrop-blur-md border-b border-green-100">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">🌿</span>
            </div>
            <span className="font-semibold text-green-700">Employee Portal</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-green-700 hover:text-green-600"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* ===== Sidebar ===== */}
      <aside
        className={[
          "fixed lg:static z-50 h-full border-r border-green-100 bg-[#F5FBF5] shadow-sm transition-all duration-300 ease-in-out",
          collapsed ? "lg:w-16" : "lg:w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-64 top-0",
        ].join(" ")}
      >
        {/* Sidebar Header */}
        <div className="relative flex items-center justify-between px-3 py-4 border-b border-green-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">🌿</span>
            </div>
            {/* Hide title when collapsed */}
            <h1
              className={`font-bold text-green-700 text-base whitespace-nowrap hidden lg:block transition-all duration-300 ${
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              }`}
            >
              Employee Portal
            </h1>
          </div>

          {/* Mobile close (X) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-green-700 hover:text-green-600"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* ===== Nav Links ===== */}
        <div className="flex flex-col py-4">
          {links.map((l, idx) => {
            const Icon = l.icon;
            const colors = [
              "text-green-600",
              "text-blue-500",
              "text-cyan-500",
              "text-pink-500",
              "text-purple-500",
            ];

            return (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-green-800/80 hover:text-green-900 hover:bg-green-100"
                  }`
                }
                end
              >
                {Icon && (
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${colors[idx % colors.length]}`}
                  />
                )}
                <span
                  className={`ml-3 truncate transition-all duration-300 ${
                    collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                  }`}
                >
                  {l.label}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* ===== Profile / Logout ===== */}
        <div className="mt-auto border-t border-green-200 pt-3">
          <button
            onClick={() => navigate("/employee-dashboard/profile")}
            className="flex items-center gap-3 px-3 py-2 text-green-700/90 hover:text-green-800 hover:bg-green-100 rounded-md w-full text-left transition-all"
          >
            <User size={18} className="text-green-700" />
            <span
              className={`truncate transition-all duration-300 ${
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              }`}
            >
              Update Profile
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-green-700/90 hover:text-green-800 hover:bg-green-100 rounded-md w-full text-left transition-all"
          >
            <LogOut size={18} className="text-green-700" />
            <span
              className={`truncate transition-all duration-300 ${
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              }`}
            >
              Logout
            </span>
          </button>
        </div>

        {/* 🌿 Floating Chevron (Desktop Only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center absolute top-1/2 -right-4 transform -translate-y-1/2
                     bg-white border border-green-200 rounded-full shadow-md p-1.5
                     hover:bg-green-50 hover:text-green-700 transition-all duration-300"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* ===== Mobile Overlay ===== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== Main Content ===== */}
      <main
        className={`flex-1 min-h-screen overflow-y-auto transition-all duration-300 bg-[#F5FBF5]
        ${collapsed ? "lg:ml-16" : "lg:ml-60"} p-6 lg:p-8 pt-16 lg:pt-0`}
      >
        {/* Your Employee Dashboard content via Outlet */}
      </main>
    </div>
  );
}
