import { useState } from "react";
import { Tabs, Tab } from "../../components/payroll/PayrollTabs";
import PayrollPeriodsTab from "../../components/payroll/PayrollPeriodsTab";
import PayrollItemsTab from "../../components/payroll/PayrollItemsTab";
import PayrollInvoicesTab from "../../components/payroll/PayrollInvoicesTab";
import { ClipboardList, Users, FileCheck } from "lucide-react";

export default function PayrollManager() {
  const [activeTab, setActiveTab] = useState("periods");

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Payroll Manager</h1>
          <p className="text-sm text-green-700/70">
            Manage payroll periods, employee items, and invoice releases.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab id="periods" label="Payroll Periods" icon={<ClipboardList size={18} />}>
          <PayrollPeriodsTab />
        </Tab>
        <Tab id="items" label="Employee Items" icon={<Users size={18} />}>
          <PayrollItemsTab />
        </Tab>
        <Tab id="invoices" label="Invoices" icon={<FileCheck size={18} />}>
          <PayrollInvoicesTab />
        </Tab>
      </Tabs>
    </div>
  );
}
