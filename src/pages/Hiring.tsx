import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/Button";
import { notifySuccess, notifyError } from "../utils/notify";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
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
        bannedPatterns.some((p) => formData.email.toLowerCase().includes(p))
      ) {
        notifyError("Please enter a valid personal or business email address.");
        setSubmitting(false);
        return;
      }

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

      if (error) throw error;

      notifySuccess("✅ Your application was submitted successfully!");
      setFormData({
        full_name: "",
        email: "",
        contact_number: "",
        message: "",
        resume_url: "",
        preferred_interview_date: "",
        preferred_interview_time: "",
      });
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

  return (
    <section className="min-h-[90vh] flex items-center justify-center bg-gray-50 py-16 px-4">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-md p-8 sm:p-10 animate-fadeInUp">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
              <span className="text-xl">💼</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Join Our Team
          </h1>
          <p className="text-gray-600">
            Fill out the form below to apply for a position with us.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              required
            />
          </div>

          <input
            type="text"
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          />

          <textarea
            name="message"
            placeholder="Message or Cover Letter"
            value={formData.message}
            onChange={handleChange}
            className="w-full h-28 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 resize-none"
          />

          <input
            type="url"
            name="resume_url"
            placeholder="Resume Link (Google Drive, Dropbox, etc.)"
            value={formData.resume_url}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            required
          />

          {/* Interview Date and Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="preferred_interview_date"
                className="block text-gray-700 font-medium mb-2"
              >
                Preferred Interview Date
              </label>
              <input
                type="date"
                name="preferred_interview_date"
                id="preferred_interview_date"
                value={formData.preferred_interview_date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
            </div>
            <div>
              <label
                htmlFor="preferred_interview_time"
                className="block text-gray-700 font-medium mb-2"
              >
                Preferred Time
              </label>
              <input
                type="time"
                name="preferred_interview_time"
                id="preferred_interview_time"
                value={formData.preferred_interview_time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
            </div>
          </div>

         {/* ✅ Submit Button */}
          <div className="flex justify-center pt-3">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="px-8 py-3 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
