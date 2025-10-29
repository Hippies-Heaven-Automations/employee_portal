import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/Button";
import { notifySuccess, notifyError } from "../../utils/notify";
import { Loader2, ArrowLeft } from "lucide-react";

// 👇 ADD THIS IMPORT
import { sendConfirmationEmail } from "../../api/sendConfirmation";

interface JobOpening {
  id: string;
  title: string;
  description: string | null;
  employment_type: "VA" | "Store";
  status: "Open" | "Closed";
}

interface JobApplicationForm {
  full_name: string;
  email: string;
  contact_number: string;
  message: string;
  resume_url: string;
  slot1_date: string;
  slot1_time: string;
  slot2_date: string;
  slot2_time: string;
  slot3_date: string;
  slot3_time: string;
}

export default function JobApplication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobOpening | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<JobApplicationForm>({
    full_name: "",
    email: "",
    contact_number: "",
    message: "",
    resume_url: "",
    slot1_date: "",
    slot1_time: "",
    slot2_date: "",
    slot2_time: "",
    slot3_date: "",
    slot3_time: "",
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoadingJob(true);
        const { data, error } = await supabase
          .from("job_openings")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (err) {
        console.error(err);
        notifyError("Job not found or no longer open.");
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!job) {
        notifyError("No job selected.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      const bannedPatterns = [
        "test@",
        "example@",
        "mailinator",
        "tempmail",
        "yopmail",
        "guerrillamail",
      ];

      if (
        !emailRegex.test(formData.email) ||
        bannedPatterns.some((p) =>
          formData.email.toLowerCase().includes(p)
        )
      ) {
        notifyError(
          "Please enter a valid personal or business email address."
        );
        setSubmitting(false);
        return;
      }

      const interviewSlots = [
        formData.slot1_date && formData.slot1_time
          ? `${formData.slot1_date}T${formData.slot1_time}:00`
          : null,
        formData.slot2_date && formData.slot2_time
          ? `${formData.slot2_date}T${formData.slot2_time}:00`
          : null,
        formData.slot3_date && formData.slot3_time
          ? `${formData.slot3_date}T${formData.slot3_time}:00`
          : null,
      ].filter(Boolean);

      // ✅ Step 1: Save application to Supabase
      const { error } = await supabase.from("applications").insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          contact_number: formData.contact_number,
          message: formData.message,
          resume_url: formData.resume_url,
          job_id: job.id,
          interview_schedules: interviewSlots,
          status: "pending",
        },
      ]);

      if (error) throw error;

      // ✅ Step 2: Send confirmation email
      try {
        const data = await sendConfirmationEmail({
          name: formData.full_name,
          email: formData.email,
          jobTitle: job.title,
        });

        console.log("📩 Email Function Response:", data);
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        notifyError(
          "Application saved, but email confirmation failed to send."
        );
      }

      // ✅ Step 3: Clear form + success UI
      notifySuccess("✅ Application submitted successfully!");
      setFormData({
        full_name: "",
        email: "",
        contact_number: "",
        message: "",
        resume_url: "",
        slot1_date: "",
        slot1_time: "",
        slot2_date: "",
        slot2_time: "",
        slot3_date: "",
        slot3_time: "",
      });

      setTimeout(() => navigate("/jobs"), 3000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit your application. Please try again.";
      notifyError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading job info...
      </div>
    );

  if (!job)
    return (
      <div className="text-center mt-20 text-gray-600">
        Job not found or unavailable.
      </div>
    );

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-hemp-mist overflow-hidden py-16 px-4">
      {/* 🌿 Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#C8EBC8_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#A7E3A7_0%,transparent_60%)] opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-hemp-cream/80 via-hemp-mist to-hemp-green/10"></div>

      {/* 🪴 Form Container */}
      <div className="relative z-10 w-full max-w-2xl bg-hemp-cream/70 backdrop-blur-md border border-hemp-sage rounded-2xl shadow-card p-8 sm:p-10 animate-fadeInUp">
        <div className="mb-6">
          <Link
            to="/jobs"
            className="text-hemp hover:underline flex items-center mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Openings
          </Link>
          <h1 className="text-3xl font-bold text-hemp-forest mb-1">
            Apply for {job.title}
          </h1>
          <p className="text-hemp-ink/80 mb-2">
            Position Type:{" "}
            <strong>
              {job.employment_type === "VA"
                ? "Virtual Assistant"
                : "In-Store"}
            </strong>
          </p>
          <p className="text-sm text-gray-500 italic">
            All interview times are in Central Time (CT – Illinois)
          </p>
        </div>

        {/* 🧾 Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
            />
          </div>

          <input
            type="text"
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
          />

          <textarea
            name="message"
            placeholder="Message or Cover Letter"
            value={formData.message}
            onChange={handleChange}
            className="w-full h-28 px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink resize-none"
          />

          <input
            type="url"
            name="resume_url"
            placeholder="Resume Link (Google Drive, Dropbox, etc.)"
            value={formData.resume_url}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
          />

          {/* 🌿 3 Preferred Interview Slots */}
          <div className="space-y-4 mt-6">
            <h2 className="text-hemp-forest font-semibold mb-2">
              Preferred Interview Schedule (CT – Illinois)
            </h2>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid sm:grid-cols-2 gap-4 border border-hemp-sage rounded-lg p-3 bg-white/60"
              >
                <div>
                  <label
                    htmlFor={`slot${i}_date`}
                    className="block text-hemp-forest font-medium mb-1"
                  >
                    Date #{i}
                  </label>
                  <input
                    type="date"
                    id={`slot${i}_date`}
                    name={`slot${i}_date`}
                    value={
                      formData[`slot${i}_date` as keyof JobApplicationForm]
                    }
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`slot${i}_time`}
                    className="block text-hemp-forest font-medium mb-1"
                  >
                    Time #{i}
                  </label>
                  <input
                    type="time"
                    id={`slot${i}_time`}
                    name={`slot${i}_time`}
                    value={
                      formData[`slot${i}_time` as keyof JobApplicationForm]
                    }
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Submit */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-card disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
