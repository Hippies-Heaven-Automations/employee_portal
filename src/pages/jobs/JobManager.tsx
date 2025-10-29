import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, Plus, X } from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";

interface JobOpening {
  id: string;
  title: string;
  description: string | null;
  employment_type: "VA" | "Store";
  status: "Open" | "Closed";
  created_at: string;
}

interface Application {
  id: string;
  full_name: string;
  email: string;
  job_id: string;
  job_title: string;
  interview_schedules: string[];
  selected_schedule: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export default function JobManager() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobs, setShowJobs] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    employment_type: "VA",
  });

  // =========================
  // Fetch Job Openings + Applications
  // =========================
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch jobs
      const { data: jobData, error: jobError } = await supabase
        .from("job_openings")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobError) throw jobError;
      setJobs(jobData || []);

      // Fetch applications
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select(`
          id,
          job_id,
          full_name,
          email,
          interview_schedules,
          selected_schedule,
          status,
          admin_notes,
          created_at,
          job_openings(title)
        `)
        .order("created_at", { ascending: false });

      if (appError) throw appError;

      const mapped = (appData || []).map(
        (a: {
          id: string;
          job_id: string;
          full_name: string;
          email: string;
          interview_schedules: string[];
          selected_schedule: string | null;
          status: string;
          admin_notes: string | null;
          created_at: string;
          job_openings?: { title?: string }[] | null;
        }) => ({
          ...a,
          job_title: a.job_openings?.[0]?.title || "(Deleted Job)",
        })
      );

      setApplications(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // Add Job via Modal
  // =========================
  const handleSaveJob = async () => {
    if (!newJob.title || !newJob.employment_type) {
      notifyError("Please fill all required fields.");
      return;
    }

    try {
      const { error } = await supabase.from("job_openings").insert([
        {
          title: newJob.title.trim(),
          description: newJob.description.trim(),
          employment_type:
            newJob.employment_type === "VA" ? "VA" : "Store",
        },
      ]);
      if (error) throw error;

      notifySuccess("Job opening added!");
      setShowModal(false);
      setNewJob({ title: "", description: "", employment_type: "VA" });

      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notifyError(message);
    }
  };

  // =========================
  // Toggle Job Status
  // =========================
  const toggleStatus = async (job: JobOpening) => {
    const newStatus = job.status === "Open" ? "Closed" : "Open";
    try {
      const { error } = await supabase
        .from("job_openings")
        .update({ status: newStatus })
        .eq("id", job.id);
      if (error) throw error;

      notifySuccess(`Job ${newStatus.toLowerCase()}!`);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notifyError(message);
    }
  };

  // =========================
  // UI
  // =========================
  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading job data...
      </div>
    );

  return (
    <div className="p-4 space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-hemp-dark">
          {showJobs ? "Job Openings" : "Applications"}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowJobs(!showJobs)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md"
          >
            {showJobs ? "View Applications" : "View Openings"}
          </button>
          {showJobs && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Job
            </button>
          )}
        </div>
      </div>

      {/* Job Openings View */}
      {showJobs && (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 bg-white shadow rounded-md border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg">{job.title}</h2>
                  <p className="text-sm text-gray-500">{job.employment_type}</p>
                  <p className="text-gray-600 mt-1">{job.description}</p>
                </div>
                <button
                  onClick={() => toggleStatus(job)}
                  className={`px-3 py-1 rounded-md text-white ${
                    job.status === "Open"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {job.status}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applications View */}
      {!showJobs && (
        <div className="space-y-2">
          {applications.map((a) => (
            <div
              key={a.id}
              className="p-4 bg-white shadow rounded-md border border-gray-100"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{a.full_name}</p>
                  <p className="text-sm text-gray-500">{a.email}</p>
                  <p className="text-sm mt-1">
                    Position: <strong>{a.job_title}</strong>
                  </p>
                  <p className="text-sm mt-1">
                    Status:{" "}
                    <span
                      className={`${
                        a.status === "Cancelled"
                          ? "text-red-600"
                          : a.status === "interview_set"
                          ? "text-green-600"
                          : "text-gray-600"
                      } font-medium`}
                    >
                      {a.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          🌿 Add Job Modal
      ========================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-hemp-dark mb-4">
              Add New Job Opening
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Job Title"
                value={newJob.title}
                onChange={(e) =>
                  setNewJob({ ...newJob, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-hemp"
              />
              <textarea
                placeholder="Job Description"
                value={newJob.description}
                onChange={(e) =>
                  setNewJob({ ...newJob, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:ring-2 focus:ring-hemp"
              />
              <select
                value={newJob.employment_type}
                onChange={(e) =>
                  setNewJob({
                    ...newJob,
                    employment_type:
                      e.target.value === "Store" ? "Store" : "VA",
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-hemp"
              >
                <option value="VA">Virtual Assistant (VA)</option>
                <option value="Store">In-Store</option>
              </select>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJob}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Save Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
