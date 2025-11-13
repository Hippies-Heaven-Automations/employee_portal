import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/layouts/AdminLayout";

import AdminHome from "@/pages/admin/AdminHome";
import Announcements from "@/pages/admin/Announcements";
import Employees from "@/pages/admin/Employees";
import SchedulePage from "@/pages/admin/schedule";
import Applications from "@/pages/admin/Applications";
import TimeOff from "@/pages/admin/TimeOff";
import ShiftLogs from "@/pages/admin/ShiftLogs";
import QuizEditor from "@/pages/admin/QuizEditor";
import TrainingTracker from "@/pages/admin/TrainingTracker";
import TrainingManager from "@/pages/admin/TrainingManager";
import TrainingPreview from "@/pages/admin/TrainingPreview";
import PayrollManager from "@/pages/admin/PayrollManager";
import AgreementTracker from "@/pages/admin/AgreementTracker";
import AgreementManager from "@/pages/admin/AgreementManager";
import AgreementPreview from "@/pages/admin/AgreementPreview";

import SecurityLogsManager from "@/pages/security/SecurityLogsManager";

import TaskManager from "@/pages/tasks/TaskManager";
import TaskDetail from "@/pages/tasks/TaskDetail";

import JobManager from "@/pages/jobs/JobManager";

import Inbox from "@/pages/messaging/Inbox";
import ChatRoute from "@/pages/messaging/ChatRoute";

import Profile from "@/pages/Profile";

const AdminRoutes = (
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
    <Route path="schedule" element={<SchedulePage />} />
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
    <Route path="messaging/chat/:userId" element={<ChatRoute />} />

    <Route path="tasks" element={<TaskManager />} />
    <Route path="tasks/:id" element={<TaskDetail />} />

    <Route path="jobopenings" element={<JobManager />} />
    <Route path="profile" element={<Profile />} />
  </Route>
);

export default AdminRoutes;
