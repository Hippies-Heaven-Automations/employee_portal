import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Hiring from "./pages/Hiring";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import EmployeeLayout from "./components/EmployeeLayout";

// admin pages
import AdminHome from "./pages/admin/AdminHome";
import Announcements from "./pages/admin/Announcements";
import Employees from "./pages/admin/Employees";
import Schedule from "./pages/admin/Schedule";
import Applications from "./pages/admin/Applications";
import TimeOff from "./pages/admin/TimeOff";
import ShiftLogs from "./pages/admin/ShiftLogs";
import QuizEditor from "./pages/admin/QuizEditor";
import TrainingTracker from "./pages/admin/TrainingTracker";
import TrainingManager from "./pages/admin/TrainingManager";
import TrainingPreview from "./pages/admin/TrainingPreview";



// employee pages
import EmpHome from "./pages/employee/EmpHome";
import EmpSchedule from "./pages/employee/EmpSchedule";
import EmpTimeIn from "./pages/employee/EmpTimeIn";
import EmpTimeOff from "./pages/employee/EmpTimeOff";
import EmpAnnouncements from "./pages/employee/EmpAnnouncements";

//training pages
import TrainingDetail from "./pages/training/TrainingDetail";
import TrainingList from "./pages/training/TrainingList";
import TrainingQuiz from "./pages/training/TrainingQuiz";


function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideHeaderFooter =
    location.pathname.startsWith("/admin-dashboard") ||
    location.pathname.startsWith("/employee-dashboard");
  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeaderFooter && <Header />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hiring" element={<Hiring />} />
          <Route path="/login" element={<Login />} />

          {/* Guest dashboard (uses Header/Footer) */}
          {/* <Route path="/guest-dashboard" element={<GuestDashboard />} /> */}

          {/* Admin dashboard nested routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="employees" element={<Employees />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="applications" element={<Applications />} />
            <Route path="timeoff" element={<TimeOff />} />
            <Route path="shiftlogs" element={<ShiftLogs />} />
            <Route path="quizeditor" element={<QuizEditor />} />
            <Route path="trainingtracker" element={<TrainingTracker />} />
            <Route path="trainings" element={<TrainingManager />} />
            <Route path="trainings/:id/preview" element={<TrainingPreview />} />
          </Route>


          {/* Employee dashboard nested routes */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute role="employee">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmpHome />} />
            <Route path="announcements" element={<EmpAnnouncements />} />
            <Route path="schedule" element={<EmpSchedule />} />
            <Route path="timein" element={<EmpTimeIn />} />
            <Route path="timeoff" element={<EmpTimeOff />} />
            <Route path="training" element={<TrainingList />} />
            <Route path="training/:id" element={<TrainingDetail />} />
            <Route path="training/:id/quiz" element={<TrainingQuiz />} />

          </Route>
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}
