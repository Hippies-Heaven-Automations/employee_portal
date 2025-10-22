import React from "react";
import { cn } from "../../utils"; // ✅ if you already have your cn() helper (tailwind-merge)
import { motion } from "framer-motion";

interface TabsProps {
  activeTab: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}

interface TabProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 🌿 Tabs Container
 * Handles tab headers and renders only the active tab’s content.
 */
export function Tabs({ activeTab, onChange, children }: TabsProps) {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];

  return (
    <div className="w-full">
      {/* === Tab Header Row === */}
      <div className="flex flex-wrap gap-2 border-b border-green-200 mb-4">
        {tabs.map((tab) => {
          const isActive = tab.props.id === activeTab;
          return (
            <button
              key={tab.props.id}
              onClick={() => onChange(tab.props.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-t-md text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-green-700 text-white shadow-sm"
                  : "text-green-800 hover:bg-green-50 hover:text-green-700"
              )}
            >
              {tab.props.icon && (
                <span className="flex items-center justify-center">{tab.props.icon}</span>
              )}
              <span>{tab.props.label}</span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* === Active Tab Content === */}
      <div className="bg-white rounded-md shadow-sm border border-green-100 p-4">
        {tabs.find((t) => t.props.id === activeTab)?.props.children}
      </div>
    </div>
  );
}

/**
 * 🌿 Single Tab Wrapper (for readability)
 * Usage: <Tab id="periods" label="Payroll Periods">...</Tab>
 */
export function Tab({ children }: TabProps) {
  return <>{children}</>;
}
