import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeLayout from "@/components/layouts/EmployeeLayout";
import EmpHome from "@/pages/employee/EmpHome";
import EmpSchedule from "@/pages/employee/EmpSchedule";
import EmpTimeIn from "@/pages/employee/EmpTimeIn";
import EmpTimeOff from "@/pages/employee/EmpTimeOff";
import EmpAnnouncements from "@/pages/employee/EmpAnnouncements";
import EmpPayroll from "@/pages/employee/EmpPayroll";
import EmpTasks from "@/pages/employee/EmpTasks";

import AgreementList from "@/pages/agreement/AgreementList";
import AgreementDetail from "@/pages/agreement/AgreementDetail";

import TrainingList from "@/pages/training/TrainingList";
import TrainingDetail from "@/pages/training/TrainingDetail";
import TrainingQuiz from "@/pages/training/TrainingQuiz";

import Inbox from "@/pages/messaging/Inbox";
import ChatRoute from "@/pages/messaging/ChatRoute";

import SecurityLogsManager from "@/pages/security/SecurityLogsManager";

import Profile from "@/pages/Profile";

const EmployeeRoutes = (
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

    {/* Agreements */}
    <Route path="agreement" element={<AgreementList />} />
    <Route path="agreement/:id" element={<AgreementDetail />} />

    {/* Training */}
    <Route path="training" element={<TrainingList />} />
    <Route path="training/:id" element={<TrainingDetail />} />
    <Route path="training/:id/quiz" element={<TrainingQuiz />} />

    {/* Messaging */}
    <Route path="messaging" element={<Inbox />} />
    <Route path="messaging/chat/:userId" element={<ChatRoute />} />

    {/* Security */}
    <Route path="security" element={<SecurityLogsManager />} />

    {/* Tasks */}
    <Route path="tasks" element={<EmpTasks />} />

    {/* Payroll */}
    <Route path="payroll" element={<EmpPayroll />} />

    <Route path="profile" element={<Profile />} />
  </Route>
);

export default EmployeeRoutes;
