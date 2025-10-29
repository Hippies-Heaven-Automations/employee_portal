// src/pages/jobs/StepConfirm.tsx
import React from "react";
import { Button } from "../../components/Button";
import type {
  ApplicantFormData,
  AvailabilityData,
} from "./JobApplicationWizard";
import { Loader2 } from "lucide-react";

function prettySlot(slot: string) {
  if (!slot) return "";
  // slot looks like "YYYY-MM-DDTHH:MM:00"
  const [d, t] = slot.split("T");
  return `${d} at ${t?.slice(0,5)} CT`;
}

export default function StepConfirm({
  applicant,
  availability,
  submitting,
  onPrev,
  onSubmit,
}: {
  applicant: ApplicantFormData;
  availability: AvailabilityData;
  submitting: boolean;
  onPrev: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-hemp-forest font-semibold text-xl">
        Review & Submit
      </h2>

      <p className="text-sm text-hemp-ink/80">
        Please confirm your details. After you submit, we’ll send a
        confirmation email. Thank you for applying to Hippies Heaven
        Gift Shop.
      </p>

      <div className="bg-white/70 border border-hemp-sage rounded-lg p-4 space-y-3 text-sm text-hemp-ink">
        <div>
          <div className="font-semibold text-hemp-forest">
            Applicant Info
          </div>
          <div>Name: {applicant.full_name || "—"}</div>
          <div>Email: {applicant.email || "—"}</div>
          <div>Contact: {applicant.contact_number || "—"}</div>
          <div>Resume: {applicant.resume_url || "—"}</div>
          {applicant.message && (
            <div className="text-hemp-ink/80 mt-2">
              Message: {applicant.message}
            </div>
          )}
        </div>

        <div>
          <div className="font-semibold text-hemp-forest">
            Interview Availability (CT – Illinois)
          </div>
          <ul className="list-disc list-inside">
            {availability.slots.map((s, i) => (
              <li key={i}>{prettySlot(s) || "—"}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-semibold text-hemp-forest">
            Questionnaire
          </div>
          <div className="text-hemp-ink/80">
            Your answers were recorded and will be reviewed internally.
            Your score will not be shown here.
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          className="bg-gray-200 text-hemp-ink font-semibold px-6 py-3 rounded-lg shadow-card hover:bg-gray-300 disabled:opacity-60"
          disabled={submitting}
          onClick={onPrev}
        >
          Back
        </Button>

        <Button
          type="button"
          disabled={submitting}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold px-8 py-3 rounded-lg shadow-card transition-all duration-300 disabled:opacity-60 flex items-center gap-2"
          onClick={onSubmit}
        >
          {submitting && <Loader2 className="animate-spin w-4 h-4" />}
          {submitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
