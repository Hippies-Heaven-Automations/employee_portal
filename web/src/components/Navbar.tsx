import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../utils";
import { LogOut, User, Menu, X } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon?: React.ElementType;
}

export interface NavbarProps {
  links: NavItem[];
  mode?: "public" | "private";
  userType?: "admin" | "employee";
  onLinkClick?: () => void;
  collapsed?: boolean;
}

export default function Navbar({
  links,
  mode = "public",
  userType,
  onLinkClick,
  collapsed = false,
}: NavbarProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Lock body scroll while drawer open
  useEffect(() => {
    const el = document.documentElement; // more reliable than body across browsers
    if (mobileOpen) {
      el.style.overflow = "hidden";
    } else {
      el.style.overflow = "";
    }
    return () => {
      el.style.overflow = "";
    };
  }, [mobileOpen]);

  /* 🌿 PUBLIC NAVBAR (mobile drawer fixed) */
  if (mode === "public") {
    return (
      <nav className="relative w-full border-b border-hemp-sage bg-hemp-cream/95 backdrop-blur-md shadow-sm z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-2 text-xl font-bold text-hemp-forest">
            <span>Hippies Heaven</span>
            <span role="img" aria-label="leaf">🌿</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex gap-6">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "font-medium transition-colors",
                    isActive
                      ? "text-hemp-green underline"
                      : "hover:text-hemp-brown text-hemp-forest"
                  )
                }
                end
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-hemp-forest hover:text-hemp-green focus:outline-none focus:ring-2 focus:ring-hemp-green rounded-md"
            aria-label="Open menu"
          >
            <Menu size={26} strokeWidth={2.2} />
          </button>
        </div>

        {/* ===== Mobile Overlay + Drawer (always mounted for smooth animations) ===== */}
        {/* Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <aside
          className={cn(
            "fixed right-0 top-0 z-50 h-svh w-80 max-w-[85vw] bg-hemp-cream shadow-2xl lg:hidden",
            "transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
          aria-hidden={!mobileOpen}
        >
          {/* Drawer header (sticky) */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-hemp-sage bg-hemp-cream">
            <span className="font-semibold text-hemp-forest text-lg">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-hemp-forest hover:text-hemp-green focus:outline-none"
              aria-label="Close menu"
            >
              <X size={24} strokeWidth={2.2} />
            </button>
          </div>

          {/* Drawer content scrolls independently */}
          <div className="px-5 py-4 overflow-y-auto h-[calc(100svh-56px)]">
            <nav className="flex flex-col">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "py-3 border-b border-hemp-sage/30 font-medium",
                      isActive
                        ? "text-hemp-green"
                        : "text-hemp-forest hover:text-hemp-brown"
                    )
                  }
                  end
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
      </nav>
    );
  }

  /* 🪴 PRIVATE SIDEBAR NAVBAR (Admin / Employee) */
  return (
    <nav className="flex flex-col py-2 px-1">
      <div className="flex flex-col flex-grow">
        {links.map((l, idx) => {
          const Icon = l.icon;
          const colors = [
            "text-orange-500",
            "text-emerald-600",
            "text-blue-500",
            "text-amber-600",
            "text-cyan-500",
            "text-pink-500",
            "text-purple-500",
            "text-lime-600",
          ];

          return (
            <NavLink
              key={l.to}
              to={l.to}
              end
              onClick={() => onLinkClick?.()}
              className={({ isActive }) =>
                cn(
                  "group flex items-center px-3 py-2 rounded-md font-medium transition-all duration-200",
                  isActive
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-green-800/80 hover:text-green-900 hover:bg-green-100"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {Icon && (
                    <Icon
                      size={18}
                      className={cn(
                        "flex-shrink-0 transition-colors duration-200",
                        isActive ? "text-white" : colors[idx % colors.length],
                        !isActive && "group-hover:text-green-800"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "ml-3 truncate transition-all duration-300",
                      collapsed && "opacity-0 w-0 overflow-hidden"
                    )}
                  >
                    {l.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>


      <div className="mt-auto border-t border-green-200 pt-3">
        <button
          onClick={() => {
            onLinkClick?.();
            navigate(
              userType === "admin"
                ? "/admin-dashboard/profile"
                : "/employee-dashboard/profile"
            );
          }}
          className="flex items-center gap-3 px-3 py-2 text-green-700/90 hover:text-green-800 hover:bg-green-100 rounded-md w-full text-left transition-all"
        >
          <User size={18} className="text-green-700" />
          <span
            className={cn(
              "truncate transition-all duration-300",
              collapsed && "opacity-0 w-0 overflow-hidden"
            )}
          >
            Profile
          </span>
        </button>

        <button
          onClick={() => {
            onLinkClick?.();
            handleLogout();
          }}
          className="flex items-center gap-3 px-3 py-2 text-green-700/90 hover:text-green-800 hover:bg-green-100 rounded-md w-full text-left transition-all"
        >
          <LogOut size={18} className="text-green-700" />
          <span
            className={cn(
              "truncate transition-all duration-300",
              collapsed && "opacity-0 w-0 overflow-hidden"
            )}
          >
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}
