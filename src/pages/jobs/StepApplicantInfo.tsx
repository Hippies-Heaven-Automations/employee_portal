// src/pages/jobs/StepApplicantInfo.tsx
import React, { useState } from "react";
import { Button } from "../../components/Button";

import type { ApplicantFormData } from "./JobApplicationWizard";

export default function StepApplicantInfo({
  value,
  onChange,
  onNext,
}: {
  value: ApplicantFormData;
  onChange: (next: ApplicantFormData) => void;
  onNext: () => void;
}) {
  const [touched, setTouched] = useState(false);

  const bannedPatterns = [
    "test@",
    "example@",
    "mailinator",
    "tempmail",
    "yopmail",
    "guerrillamail",
  ];
  const invalidEmail =
    !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.email || "") ||
    bannedPatterns.some((p) =>
      value.email.toLowerCase().includes(p)
    );

  const requiredMissing =
    !value.full_name ||
    !value.email ||
    !value.resume_url;

  const canContinue = !invalidEmail && !requiredMissing;

  function handleField(
    field: keyof ApplicantFormData,
    val: string
  ) {
    onChange({
      ...value,
      [field]: val,
    });
  }

  function handleNext() {
    setTouched(true);
    if (canContinue) {
      onNext();
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-hemp-forest font-semibold text-xl">
        Applicant Information
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Full Name *"
          className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
          value={value.full_name}
          onChange={(e) => handleField("full_name", e.target.value)}
        />

        <input
          type="email"
          placeholder="Email *"
          className={`w-full px-4 py-3 rounded-lg border ${
            touched && invalidEmail
              ? "border-red-500 focus:ring-red-500"
              : "border-hemp-sage focus:ring-hemp-green"
          } focus:ring-2 bg-white/80 text-hemp-ink`}
          value={value.email}
          onChange={(e) => handleField("email", e.target.value)}
        />
      </div>

      <input
        type="text"
        placeholder="Contact Number"
        className="w-full px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
        value={value.contact_number}
        onChange={(e) =>
          handleField("contact_number", e.target.value)
        }
      />

      <textarea
        placeholder="Message or Cover Letter"
        className="w-full h-28 px-4 py-3 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink resize-none"
        value={value.message}
        onChange={(e) => handleField("message", e.target.value)}
      />

      <input
        type="url"
        placeholder="Resume Link (Google Drive, Dropbox, etc.) *"
        className={`w-full px-4 py-3 rounded-lg border ${
          touched && !value.resume_url
            ? "border-red-500 focus:ring-red-500"
            : "border-hemp-sage focus:ring-hemp-green"
        } focus:ring-2 bg-white/80 text-hemp-ink`}
        value={value.resume_url}
        onChange={(e) => handleField("resume_url", e.target.value)}
      />

      {touched && !canContinue && (
        <p className="text-sm text-red-600">
          Please fill required fields and use a valid email.
        </p>
      )}

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold px-8 py-3 rounded-lg shadow-card transition-all duration-300 disabled:opacity-60"
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
