import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/Button";

export default function Hiring() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    message: "",
    resume_url: "",
    preferred_interview_date: "",
    preferred_interview_time: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.from("applications").insert([
      {
        full_name: formData.full_name,
        email: formData.email,
        contact_number: formData.contact_number,
        message: formData.message,
        resume_url: formData.resume_url,
        preferred_interview_date: formData.preferred_interview_date,
        preferred_interview_time: formData.preferred_interview_time,
        status: "pending",
      },
    ]);

    if (error) {
      console.error(error);
      setError("Failed to submit your application. Please try again.");
    } else {
      setSuccess(true);
      setFormData({
        full_name: "",
        email: "",
        contact_number: "",
        message: "",
        resume_url: "",
        preferred_interview_date: "",
        preferred_interview_time: "",
      });
      setTimeout(() => setSuccess(false), 5000);
    }

    setSubmitting(false);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-hemp-mist overflow-hidden py-16 px-4">
      {/* 🌿 Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#C8EBC8_0%,transparent_60%),radial-gradient(circle_at_80%_70%,#A7E3A7_0%,transparent_60%)] opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-hemp-cream/80 via-hemp-mist to-hemp-green/10"></div>

      {/* 🪴 Form Container */}
      <div className="relative z-10 w-full max-w-2xl bg-hemp-cream/70 backdrop-blur-md border border-hemp-sage rounded-2xl shadow-card p-8 sm:p-10 animate-fadeInUp">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-hemp-green flex items-center justify-center shadow-md">
              <span className="text-white text-xl">🌿</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-hemp-forest mb-2">
            Join Our Team
          </h1>
          <p className="text-hemp-ink/80">
            Fill out the form below to apply for a position with us.
          </p>
        </div>

        {/* ✅ Success & Error */}
        {success && (
          <div className="bg-hemp-sage/40 border border-hemp-green text-hemp-forest px-4 py-2 rounded-lg mb-4 text-center font-medium">
            ✅ Your application was submitted successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg mb-4 text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* 🧾 Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
              required
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
            placeholder="Resume Link (Google Drive)"
            value={formData.resume_url}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
            required
          />

          {/* 🌿 Interview Date and Time with Labels */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="preferred_interview_date"
                className="block text-hemp-forest font-medium mb-2"
              >
                Pref Interview Date
              </label>
              <input
                type="date"
                name="preferred_interview_date"
                id="preferred_interview_date"
                value={formData.preferred_interview_date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
              />
            </div>
            <div>
              <label
                htmlFor="preferred_interview_time"
                className="block text-hemp-forest font-medium mb-2"
              >
                Time
              </label>
              <input
                type="time"
                name="preferred_interview_time"
                id="preferred_interview_time"
                value={formData.preferred_interview_time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
              />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-card"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
