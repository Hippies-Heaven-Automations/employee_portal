import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

export default function GuestLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-hemp-mist">
      {/* 🌿 Navbar */}
      <header className="sticky top-0 z-50 bg-hemp-cream shadow-sm">
        <Navbar
          mode="public"
          links={[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/hiring", label: "Hiring" },
            { to: "/contact", label: "Contact" },
            { to: "/login", label: "Login" },
          ]}
        />
      </header>

      {/* 🌿 Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8 animate-fadeInUp">
        <Outlet /> {/* ✅ This renders the active child page (Home, About, etc.) */}
      </main>

      {/* 🌿 Footer */}
      <Footer />
    </div>
  );
}
