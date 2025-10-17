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

      // Hide banner after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    }

    setSubmitting(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-xl p-8">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Join Our Team 🌿
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Fill out the form below to apply for a position with us.
        </p>

        {success && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-center font-medium">
            ✅ Your application was submitted successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4 text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="text"
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <textarea
            name="message"
            placeholder="Message or Cover Letter"
            value={formData.message}
            onChange={handleChange}
            className="w-full border rounded p-2 h-24"
          />
          <input
            type="url"
            name="resume_url"
            placeholder="Resume Link (Google Drive)"
            value={formData.resume_url}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <div className="flex gap-2">
            <input
              type="date"
              name="preferred_interview_date"
              value={formData.preferred_interview_date}
              onChange={handleChange}
              className="w-1/2 border rounded p-2"
            />
            <input
              type="time"
              name="preferred_interview_time"
              value={formData.preferred_interview_time}
              onChange={handleChange}
              className="w-1/2 border rounded p-2"
            />
          </div>

          <div className="flex justify-center mt-6">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
