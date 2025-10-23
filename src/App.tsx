import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// 🌿 Layouts
import GuestLayout from "./components/layouts/GuestLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import EmployeeLayout from "./components/layouts/EmployeeLayout";

// 🌿 Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Hiring from "./pages/Hiring";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

// 🌿 Admin pages
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
import PayrollManager from "./pages/admin/PayrollManager";
import AgreementTracker from "./pages/admin/AgreementTracker";
import AgreementManager from "./pages/admin/AgreementManager";
import AgreementPreview from "./pages/admin/AgreementPreview";
import SecurityLogsManager from "./pages/security/SecurityLogsManager";

// 🌿 Employee pages
import EmpHome from "./pages/employee/EmpHome";
import EmpSchedule from "./pages/employee/EmpSchedule";
import EmpTimeIn from "./pages/employee/EmpTimeIn";
import EmpTimeOff from "./pages/employee/EmpTimeOff";
import EmpAnnouncements from "./pages/employee/EmpAnnouncements";
import EmpPayroll from "./pages/employee/EmpPayroll";
// 🌿 Training pages
import TrainingDetail from "./pages/training/TrainingDetail";
import TrainingList from "./pages/training/TrainingList";
import TrainingQuiz from "./pages/training/TrainingQuiz";

// 🌿 Agreement pages
import AgreementDetail from "./pages/agreement/AgreementDetail";
import AgreementList from "./pages/agreement/AgreementList";
export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🌿 Public / Guest routes wrapped in GuestLayout */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hiring" element={<Hiring />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* 🌿 Admin Dashboard */}
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
          <Route path="agreementtracker" element={<AgreementTracker />} />
          <Route path="agreements" element={<AgreementManager />} />
          <Route path="agreements/:id/preview" element={<AgreementPreview />} />
          <Route path="quizeditor" element={<QuizEditor />} />
          <Route path="trainingtracker" element={<TrainingTracker />} />
          <Route path="trainings" element={<TrainingManager />} />
          <Route path="trainings/:id/preview" element={<TrainingPreview />} />
          <Route path="security" element={<SecurityLogsManager />} />
          <Route path="payroll" element={<PayrollManager />} />
          
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 🌿 Employee Dashboard */}
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
          <Route path="agreement" element={<AgreementList />} />
          <Route path="agreement/:id" element={<AgreementDetail />} />
          <Route path="training" element={<TrainingList />} />
          <Route path="training/:id" element={<TrainingDetail />} />
          <Route path="training/:id/quiz" element={<TrainingQuiz />} />
          <Route path="security" element={<SecurityLogsManager />} />
          <Route path="payroll" element={<EmpPayroll />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
