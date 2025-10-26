import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import {
  Home,
  Calendar,
  Plane,
  Clock,
  BookOpen,
  DollarSign,
  MessageSquare,
  ShieldAlert,
  ScrollText ,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";
import hhLogo from "../../assets/hh_careers_logo.png";
import { useUnreadMessages } from "../../hooks/useUnreadMessages";

export default function EmployeeLayout() {
  const [collapsed, setCollapsed] = useState(false);   // desktop shrink
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
  const { count } = useUnreadMessages();

  const links = [
    { to: "/employee-dashboard", label: "Home", icon: Home }, 
    {
      to: "/employee-dashboard/messaging",
      label: "Messages",
      icon: () => (
        <div className="relative inline-block">
          <MessageSquare className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
          )}
        </div>
      ),
    },
    { to: "/employee-dashboard/schedule", label: "Schedule", icon: Calendar },
    { to: "/employee-dashboard/timeoff", label: "Leaves", icon: Plane },
    { to: "/employee-dashboard/timein", label: "Time In", icon: Clock },
    { to: "/employee-dashboard/agreement", label: "Agreement", icon: ScrollText  },
    { to: "/employee-dashboard/training", label: "Training", icon: BookOpen },
    { to: "/employee-dashboard/payroll", label: "Payroll", icon: DollarSign },
    
    // 💰 Security
    { to: "/employee-dashboard/security", label: "Security Logs", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen flex bg-[#F5FBF5] text-green-900 relative">
      {/* ===== Mobile Top Bar (only on <lg) ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#F5FBF5]/95 backdrop-blur-md border-b border-green-100">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white-400 to-white-600 flex items-center justify-center shadow-sm">
              <img
              src={hhLogo}
              alt="Hippies Heaven Logo"
              className="w-10 h-10 object-contain"
            />
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
          "w-64",
          "top-0",
        ].join(" ")}
      >
        {/* Sidebar Header */}
        <div className="relative flex items-center justify-between px-3 py-4 border-b border-green-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white-400 to-white-600 flex items-center justify-center shadow-sm">
              <img
                src={hhLogo}
                alt="Hippies Heaven Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            {/* Hide title when collapsed (desktop only) */}
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

        {/* Nav */}
        <div className="p-2">
          <Navbar
            mode="private"
            userType="employee"
            links={links}
            collapsed={collapsed}
            onLinkClick={() => setMobileOpen(false)}
          />
        </div>

        {/* 🌿 Floating Chevron Toggle (Desktop Only) */}
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

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== Main Content ===== */}
      <main
        className="flex-1 min-h-screen overflow-y-auto bg-[#F5FBF5] transition-all duration-300 
                  px-4 lg:px-6 pt-20 lg:pt-10 pb-8"
      >
        <Outlet />
      </main>
    </div>
  );
}
