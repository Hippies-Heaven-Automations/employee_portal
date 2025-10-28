import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, Search, Briefcase, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface JobOpening {
  id: string;
  title: string;
  description: string | null;
  employment_type: "VA" | "Store";
  status: "Open" | "Closed";
  created_at: string;
}

export default function JobList() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [filtered, setFiltered] = useState<JobOpening[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "VA" | "Store">("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("job_openings")
          .select("*")
          .eq("status", "Open")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setJobs(data || []);
        setFiltered(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Handle search/filter
  useEffect(() => {
    let filteredData = [...jobs];

    if (filterType !== "All") {
      filteredData = filteredData.filter((j) => j.employment_type === filterType);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      filteredData = filteredData.filter(
        (j) =>
          j.title.toLowerCase().includes(s) ||
          (j.description?.toLowerCase().includes(s) ?? false)
      );
    }

    setFiltered(filteredData);
  }, [search, filterType, jobs]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading job openings...
      </div>
    );

  const vaJobs = filtered.filter((j) => j.employment_type === "VA");
  const storeJobs = filtered.filter((j) => j.employment_type === "Store");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-hemp-dark">
        Join Our Team 🌿
      </h1>

      {/* Search + Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        <div className="relative w-full sm:w-2/3">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search job title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-md pl-9 pr-3 py-2 focus:ring-2 focus:ring-hemp focus:outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFilterType(e.target.value as "All" | "VA" | "Store")
          }
          className="border rounded-md py-2 px-3 focus:ring-2 focus:ring-hemp focus:outline-none"
        >
          <option value="All">All Positions</option>
          <option value="VA">Virtual Assistant</option>
          <option value="Store">In-Store</option>
        </select>
      </div>

      {/* Store Jobs */}
      {storeJobs.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center mb-3">
            <Building2 className="w-5 h-5 mr-2 text-hemp" />
            <h2 className="text-xl font-semibold text-hemp-dark">In-Store Positions</h2>
          </div>
          <div className="grid gap-4">
            {storeJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 border border-gray-200 rounded-md bg-white hover:shadow transition"
              >
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {job.description || "No description provided."}
                </p>
                <div className="flex justify-end mt-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-hemp font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VA Jobs */}
      {vaJobs.length > 0 && (
        <div>
          <div className="flex items-center mb-3">
            <Briefcase className="w-5 h-5 mr-2 text-hemp" />
            <h2 className="text-xl font-semibold text-hemp-dark">
              Virtual Assistant Positions
            </h2>
          </div>
          <div className="grid gap-4">
            {vaJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 border border-gray-200 rounded-md bg-white hover:shadow transition"
              >
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {job.description || "No description provided."}
                </p>
                <div className="flex justify-end mt-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-hemp font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {filtered.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No job openings found.
        </div>
      )}
    </div>
  );
}
