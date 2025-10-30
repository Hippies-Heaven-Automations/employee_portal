import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

export default function GuestLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-hemp-mist text-hemp-ink">
      {/* 🌿 Navbar */}
      <header className="sticky top-0 z-50 bg-hemp-cream/95 backdrop-blur-sm shadow-sm">
        <Navbar
          mode="public"
          links={[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/jobs", label: "Careers" }, 
            { to: "/login", label: "Login" },
          ]}
        />
      </header>

      {/* 🌿 Main content area */}
      <main className="flex-1 w-full">
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      {/* 🌿 Footer */}
      <Footer />
    </div>
  );
}
