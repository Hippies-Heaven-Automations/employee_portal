import { useState } from "react";
import { Tabs, Tab } from "../../components/payroll/PayrollTabs";
import DoorLogsTab from "../../components/security/DoorLogsTab";
import ClockLogsTab from "../../components/security/ClockLogsTab";
import CashRemovalTab from "../../components/security/CashRemovalTab";
import SafeRoomTab from "../../components/security/SafeRoomTab";
import SoldOutTab from "../../components/security/SoldOutTab";
import IncidentReportsTab from "../../components/security/IncidentReportsTab";
import EmployeeViolationsTab from "../../components/security/EmployeeViolationsTab";
import CCTVTab from "../../components/security/CCTVTab";
import CCTVLogsTab from "../../components/security/CCTVLogsTab";
import {
  DoorOpen,
  Clock,
  Wallet,
  Shield,
  PackageX,
  AlertTriangle,
  Ban,
  Video,
} from "lucide-react";

export default function SecurityLogsManager() {
  const [activeTab, setActiveTab] = useState("door");

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Security Logs</h1>
          <p className="text-sm text-green-700/70">
            Manage and review store security activity, incidents, and CCTV data.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab id="door" label="Door Logs" icon={<DoorOpen size={18} />}>
          <DoorLogsTab />
        </Tab>
        <Tab id="clock" label="Clock In / Out" icon={<Clock size={18} />}>
          <ClockLogsTab />
        </Tab>
       <Tab id="cash" label="Cash Removal" icon={<Wallet size={18} />}>
          <CashRemovalTab />
        </Tab>
        <Tab id="safe" label="Safe Room Log" icon={<Shield size={18} />}>
          <SafeRoomTab />
        </Tab>
        <Tab id="soldout" label="Items Sold Out" icon={<PackageX size={18} />}>
          <SoldOutTab />
        </Tab>
        <Tab id="incident" label="Incident Reports" icon={<AlertTriangle size={18} />}>
          <IncidentReportsTab />
        </Tab>
         <Tab id="violations" label="Employee Violations" icon={<Ban size={18} />}>
          <EmployeeViolationsTab />
        </Tab>
        <Tab id="cctv" label="CCTV" icon={<Video size={18} />}>
          <CCTVTab />
        </Tab>
        <Tab id="cctv_logs" label="Battery Logs" icon={<Video size={18} />}>
          <CCTVLogsTab />
        </Tab>
      </Tabs>
    </div>
  );
}
