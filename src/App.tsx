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

// 🌿 Job pages (NEW)
import JobList from "./pages/jobs/JobList";
import JobDetail from "./pages/jobs/JobDetail";
import JobApplication from "./pages/jobs/JobApplication";

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
import TaskManager from "./pages/tasks/TaskManager";
import TaskDetail from "./pages/tasks/TaskDetail";
import JobManager from "./pages/jobs/JobManager"; // ✅ New Admin Page

// 🌿 Employee pages
import EmpHome from "./pages/employee/EmpHome";
import EmpSchedule from "./pages/employee/EmpSchedule";
import EmpTimeIn from "./pages/employee/EmpTimeIn";
import EmpTimeOff from "./pages/employee/EmpTimeOff";
import EmpAnnouncements from "./pages/employee/EmpAnnouncements";
import EmpPayroll from "./pages/employee/EmpPayroll";
import EmpTasks from "./pages/employee/EmpTasks";
import TrainingDetail from "./pages/training/TrainingDetail";
import TrainingList from "./pages/training/TrainingList";
import TrainingQuiz from "./pages/training/TrainingQuiz";
import AgreementDetail from "./pages/agreement/AgreementDetail";
import AgreementList from "./pages/agreement/AgreementList";
import Inbox from "./pages/messaging/Inbox";
import Chat from "./pages/messaging/Chat";

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

          {/* 🌿 Job Openings (Public) */}
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/apply/:id" element={<JobApplication />} />
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
          <Route path="messaging" element={<Inbox />} />
          <Route path="messaging/chat/:userId" element={<Chat />} />
          <Route path="tasks" element={<TaskManager />} />
          <Route path="tasks/:id" element={<TaskDetail />} />

          {/* 🌿 Job Openings (Admin) */}
          <Route path="jobopenings" element={<JobManager />} />

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
          <Route path="messaging" element={<Inbox />} />
          <Route path="messaging/chat/:userId" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tasks" element={<EmpTasks />} />
        </Route>
      </Routes>
    </Router>
  );
}
