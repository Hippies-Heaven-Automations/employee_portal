import AdminNavbar from "../components/AdminNavbar";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AdminNavbar />
      <main className="p-10 text-center">
        <h1 className="text-3xl font-bold text-purple-800">Admin Dashboard</h1>
        <p className="mt-4 text-gray-600">
          Welcome, Admin 👑 — manage your team and schedules here.
        </p>
      </main>
    </div>
  );
}
