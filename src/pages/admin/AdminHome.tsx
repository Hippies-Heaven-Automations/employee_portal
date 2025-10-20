import { Megaphone, Users, Calendar, FileText, Clock } from "lucide-react";
import { notifySuccess } from "../../utils/notify"; // ✅ no changes to notify.ts

export default function AdminHome() {
  const handleClick = (action: string) => {
    notifySuccess(`${action} feature coming soon!`);
  };

  return (
    <section className="animate-fadeInUp">
      {/* 🌿 Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2">
          Welcome, Admin 🌿
        </h1>
        <p className="text-hemp-ink/70">
          Manage your team, schedules, and operations — all in one place.
        </p>
      </div>

      {/* 🌈 Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { icon: Users, label: "Employees", text: "View & manage staff records" },
          { icon: Megaphone, label: "Announcements", text: "Post updates for all users" },
          { icon: Calendar, label: "Schedules", text: "Plan and adjust shifts easily" },
          { icon: FileText, label: "Applications", text: "Review job applications" },
        ].map(({ icon: Icon, label, text }, i) => (
          <div
            key={i}
            className="bg-hemp-cream/80 border border-hemp-sage rounded-xl shadow-card p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleClick(label)}
          >
            <div className="w-12 h-12 rounded-full bg-hemp-green flex items-center justify-center text-white">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-hemp-forest font-semibold text-lg">{label}</h3>
              <p className="text-hemp-ink/70 text-sm">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🕒 Recent Activity or Quick Access */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Recent Activity */}
        <div className="bg-hemp-cream/70 border border-hemp-sage rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-hemp-green" size={22} />
            <h2 className="text-xl font-semibold text-hemp-forest">
              Recent Activity
            </h2>
          </div>
          <ul className="space-y-3 text-hemp-ink/80 text-sm">
            <li>🌱 New employee “Jane Doe” added to system.</li>
            <li>📢 Announcement “Team Meeting - Monday” posted.</li>
            <li>🕒 Schedule updated for November 20.</li>
            <li>📋 2 new job applications received today.</li>
          </ul>
        </div>

        {/* Right: Quick Actions */}
        <div className="bg-hemp-cream/70 border border-hemp-sage rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-hemp-green" size={22} />
            <h2 className="text-xl font-semibold text-hemp-forest">
              Quick Actions
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleClick("Add Employee")}
              className="w-full bg-hemp-green hover:bg-hemp-forest text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-card"
            >
              Add Employee
            </button>
            <button
              onClick={() => handleClick("Post Announcement")}
              className="w-full bg-white border border-hemp-green hover:bg-hemp-green hover:text-white text-hemp-green font-semibold py-3 rounded-lg transition-all duration-300 shadow-card"
            >
              Post Announcement
            </button>
            <button
              onClick={() => handleClick("Review Applications")}
              className="w-full bg-white border border-hemp-green hover:bg-hemp-green hover:text-white text-hemp-green font-semibold py-3 rounded-lg transition-all duration-300 shadow-card"
            >
              Review Applications
            </button>
            <button
              onClick={() => handleClick("Manage Schedule")}
              className="w-full bg-hemp-green hover:bg-hemp-forest text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-card"
            >
              Manage Schedule
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
