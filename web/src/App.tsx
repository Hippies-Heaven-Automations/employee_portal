import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Hiring from "./pages/Hiring";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";   // ✅ add this
import EmployeeDashboard from "./pages/EmployeeDashboard"; // ✅ add this
import ProtectedRoute from "./components/ProtectedRoute";   // ✅ add this (if not yet added)

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/hiring" element={<Hiring />} />
            <Route path="/login" element={<Login />} />

            {/* ✅ protected routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute role="employee">
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
