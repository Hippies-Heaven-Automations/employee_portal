import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, ArrowLeft, Briefcase, Building2, Calendar } from "lucide-react";
import { Button } from "../../components/Button";

interface JobOpening {
  id: string;
  title: string;
  description: string | null;
  employment_type: "VA" | "Store";
  status: "Open" | "Closed";
  created_at: string;
  updated_at: string;
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobOpening | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("job_openings")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading job details...
      </div>
    );

  if (!job)
    return (
      <div className="text-center mt-20 text-gray-600">
        Job not found or has been removed.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-hemp hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Job Openings
        </button>
      </div>

      {/* Job Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-hemp-dark">{job.title}</h1>
          <span
            className={`text-sm font-medium px-2 py-1 rounded-md ${
              job.status === "Open"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {job.status}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-gray-500 text-sm">
          {job.employment_type === "Store" ? (
            <>
              <Building2 className="w-4 h-4 text-hemp" />
              <span>In-Store Position</span>
            </>
          ) : (
            <>
              <Briefcase className="w-4 h-4 text-hemp" />
              <span>Virtual Assistant Position</span>
            </>
          )}
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              Posted on {new Date(job.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <hr className="my-4" />

        {/* Description */}
        <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
          {job.description || "No description provided for this position."}
        </div>
      </div>

      {/* Apply Now */}
      {job.status === "Open" ? (
        <div className="text-center">
          <Link to={`/jobs/apply/${job.id}`}>
            <Button
              variant="primary"
              className="px-8 py-2 rounded-md shadow-md hover:shadow-lg font-medium text-base transition-all"
            >
              Apply Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="text-center text-gray-500 italic">
          This job is no longer accepting applications.
        </div>
      )}

    </div>
  );
}
