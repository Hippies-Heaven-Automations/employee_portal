import EmployeeNavbar from "../components/EmployeeNavbar";

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <EmployeeNavbar />
      <main className="p-10 text-center">
        <h1 className="text-3xl font-bold text-blue-800">
          Employee Dashboard
        </h1>
        <p className="mt-4 text-gray-600">
          Welcome, team member 🌿 — check your schedule and log your time here.
        </p>
      </main>
    </div>
  );
}
