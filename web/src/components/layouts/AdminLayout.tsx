import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import {
  Home,
  Megaphone,
  Users,
  Calendar,
  FileText,
  Plane,
  Clock,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";
import { cn } from "../../utils";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/admin-dashboard", label: "Home", icon: Home },
    { to: "/admin-dashboard/announcements", label: "Announcements", icon: Megaphone },
    { to: "/admin-dashboard/employees", label: "Employees", icon: Users },
    { to: "/admin-dashboard/schedule", label: "Schedule", icon: Calendar },
    { to: "/admin-dashboard/applications", label: "Applications", icon: FileText },
    { to: "/admin-dashboard/timeoff", label: "Time Off", icon: Plane },
    { to: "/admin-dashboard/shiftlogs", label: "Shift Logs", icon: Clock },
    { to: "/admin-dashboard/trainingtracker", label: "Training Tracker", icon: GraduationCap },
    { to: "/admin-dashboard/trainings", label: "Trainings", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex bg-[#F5FBF5] text-green-900 relative">
      {/* ===== Mobile Top Bar ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#F5FBF5]/95 backdrop-blur-md border-b border-green-100">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">🌿</span>
            </div>
            <span className="font-semibold text-green-700">Hippies Heaven</span>
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
          collapsed ? "lg:w-16" : "lg:w-64", // unified width
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "top-0",
        ].join(" ")}
      >
        {/* Sidebar Header */}
        <div className="relative flex items-center justify-between px-3 py-4 border-b border-green-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">🌿</span>
            </div>
            <h1
              className={`font-bold text-green-700 text-base whitespace-nowrap hidden lg:block transition-all duration-300 ${
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              }`}
            >
              Hippies Heaven
            </h1>
          </div>

          {/* Mobile Close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-green-700 hover:text-green-600"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <div className="px-1">
          <Navbar
            mode="private"
            userType="admin"
            links={links}
            collapsed={collapsed}
            onLinkClick={() => setMobileOpen(false)}
          />
        </div>

        {/* Toggle Button */}
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

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== Main Content ===== */}
      <main
        className={[
          "flex-1 min-h-screen overflow-y-auto bg-[#F5FBF5] transition-all duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64", // aligns with sidebar width
          "px-2 sm:px-4 lg:px-6",              // ⬅️ reduce horizontal padding
          "pt-20 lg:pt-10 pb-8",               // smaller top padding
        ].join(" ")}
      >
        <Outlet />
      </main>
    </div>
  );
}
