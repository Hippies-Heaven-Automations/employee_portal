import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";

interface Application {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
  message: string;
  resume_url: string;
  preferred_interview_date: string | null;
  preferred_interview_time: string | null;
  status: string;
  created_at: string;
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchApplications();
  };

  const handleEdit = (app: Application) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedApp) return;
    const newStatus = e.target.value;
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", selectedApp.id);

    if (error) alert(error.message);
    else {
      setSelectedApp({ ...selectedApp, status: newStatus });
      fetchApplications();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Job Applications</h1>
      </div>

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Contact</th>
                <th className="p-2 text-left">Resume</th>
                <th className="p-2 text-left">Interview</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.full_name}</td>
                  <td className="p-2">{a.email}</td>
                  <td className="p-2">{a.contact_number}</td>
                  <td className="p-2">
                    {a.resume_url ? (
                      <a
                        href={a.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Resume
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="p-2">
                    {a.preferred_interview_date || "N/A"} {a.preferred_interview_time || ""}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        a.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : a.status === "declined"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-2 space-x-2">
                    <Button onClick={() => handleEdit(a)} variant="outline">View</Button>
                    <Button onClick={() => handleDelete(a.id)} variant="ghost">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Application Details</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedApp.full_name}</p>
              <p><strong>Email:</strong> {selectedApp.email}</p>
              <p><strong>Contact:</strong> {selectedApp.contact_number}</p>
              <p><strong>Message:</strong> {selectedApp.message || "N/A"}</p>
              <p>
                <strong>Resume:</strong>{" "}
                <a
                  href={selectedApp.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Resume
                </a>
              </p>
              <p>
                <strong>Preferred Interview:</strong>{" "}
                {selectedApp.preferred_interview_date || "N/A"} {selectedApp.preferred_interview_time || ""}
              </p>

              <label className="block">
                <span className="text-sm font-medium">Status</span>
                <select
                  value={selectedApp.status}
                  onChange={handleStatusChange}
                  className={`w-full border rounded p-2 capitalize ${
                    selectedApp.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : selectedApp.status === "declined"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}