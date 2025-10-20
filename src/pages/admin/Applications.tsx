import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { FileText, Eye, Trash2, ClipboardList } from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";

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

    if (error) notifyError(`Error loading applications: ${error.message}`);
    else setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id: string) => {
    confirmAction("Delete this application?", async () => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) notifyError(`Error deleting application: ${error.message}`);
      else {
        notifySuccess("Application deleted successfully.");
        fetchApplications();
      }
    }, "Delete", "bg-red-600 hover:bg-red-700");
  };

  const handleEdit = (app: Application) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedApp) return;
    const newStatus = e.target.value;

    confirmAction("Update application status?", async () => {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", selectedApp.id);

      if (error) notifyError(`Error updating status: ${error.message}`);
      else {
        notifySuccess("Application status updated.");
        setSelectedApp({ ...selectedApp, status: newStatus });
        fetchApplications();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "declined":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* 🌿 Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2 sm:mb-0">
          Job Applications
        </h1>
      </div>

      {/* 🌿 Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">
            No applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Resume</th>
                  <th className="px-4 py-3 text-left">Interview</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition-all"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {a.full_name}
                    </td>
                    <td className="px-4 py-3">{a.email}</td>
                    <td className="px-4 py-3">{a.contact_number}</td>
                    <td className="px-4 py-3">
                      {a.resume_url ? (
                        <a
                          href={a.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-hemp-green hover:underline inline-flex items-center gap-1"
                        >
                          <FileText size={15} /> Resume
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.preferred_interview_date || "N/A"}{" "}
                      {a.preferred_interview_time || ""}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded border text-xs font-semibold capitalize ${getStatusColor(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleEdit(a)}
                        variant="outline"
                        className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                      >
                        <Eye size={15} />
                        <span className="hidden sm:inline">View</span>
                      </Button>

                      <Button
                        onClick={() => handleDelete(a.id)}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌿 Modal */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white border border-hemp-sage rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeInUp">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-hemp-sage/30 border-b border-hemp-sage/50">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-hemp-green" size={22} />
                <h2 className="text-xl font-semibold text-hemp-forest">
                  Application Details
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-hemp-green transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-3 text-gray-700">
              <p><strong className="text-gray-800">Name:</strong> {selectedApp.full_name}</p>
              <p><strong className="text-gray-800">Email:</strong> {selectedApp.email}</p>
              <p><strong className="text-gray-800">Contact:</strong> {selectedApp.contact_number}</p>
              <p><strong className="text-gray-800">Message:</strong> {selectedApp.message || "N/A"}</p>
              <p>
                <strong className="text-gray-800">Resume:</strong>{" "}
                {selectedApp.resume_url ? (
                  <a
                    href={selectedApp.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-hemp-green hover:underline inline-flex items-center gap-1"
                  >
                    <FileText size={15} /> View
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong className="text-gray-800">Preferred Interview:</strong>{" "}
                {selectedApp.preferred_interview_date || "N/A"}{" "}
                {selectedApp.preferred_interview_time || ""}
              </p>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Application Status
                </label>
                <select
                  value={selectedApp.status}
                  onChange={handleStatusChange}
                  className={`w-full border rounded-lg px-4 py-2 capitalize font-medium focus:outline-none focus:ring-2 focus:ring-hemp-green ${getStatusColor(
                    selectedApp.status
                  )}`}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-hemp-sage/40">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg px-6 py-2 transition"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
