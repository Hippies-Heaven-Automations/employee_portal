import React, { useEffect, useMemo } from "react";
import { Button } from "../../components/Button";
import type { AvailabilityData } from "./JobApplicationWizard";

export default function StepAvailability({
  value,
  onChange,
  onPrev,
  onNext,
}: {
  value: AvailabilityData;
  onChange: (next: AvailabilityData) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  // 🧠 Compute tomorrow’s date and current time
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const minDate = tomorrow.toISOString().split("T")[0];
  const minTime = now.toTimeString().slice(0, 5); // HH:MM

  // Memoize slots to avoid re-renders
  const slots = useMemo(
    () => (value.slots.length === 3 ? value.slots : ["", "", ""]),
    [value.slots]
  );

  const updateSlot = (idx: number, date: string, time: string) => {
    const next = [...slots];
    next[idx] = date && time ? `${date}T${time}:00` : date ? date : time ? time : "";
    onChange({ slots: next });
  };

  const getDate = (slot: string) => (slot.includes("T") ? slot.split("T")[0] : slot);
  const getTime = (slot: string) =>
    slot.includes("T") ? slot.split("T")[1].slice(0, 5) : "";

  const allFilled = slots.every((s) => s);

  return (
    <div className="space-y-6">
      <h2 className="text-hemp-forest font-semibold text-xl">
        Preferred Interview Schedule
      </h2>
      <p className="text-sm text-gray-600 italic">
        All interview times are in Central Time (CT – Illinois).
      </p>

      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="grid sm:grid-cols-2 gap-4 border border-hemp-sage rounded-lg p-3 bg-white/60"
        >
          <div>
            <label className="block text-hemp-forest font-medium mb-1">
              Date #{i + 1}
            </label>
            <input
              type="date"
              min={minDate}
              value={getDate(slots[i])}
              onChange={(e) => updateSlot(i, e.target.value, getTime(slots[i]))}
              className="w-full px-3 py-2 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
            />
          </div>
          <div>
            <label className="block text-hemp-forest font-medium mb-1">
              Time #{i + 1}
            </label>
            <input
              type="time"
              min={minTime}
              value={getTime(slots[i])}
              onChange={(e) => updateSlot(i, getDate(slots[i]), e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-hemp-sage focus:ring-2 focus:ring-hemp-green bg-white/80 text-hemp-ink"
            />
          </div>
        </div>
      ))}

      {!allFilled && (
        <p className="text-sm text-red-600">
          Please provide three possible interview windows.
        </p>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={onPrev}
          className="bg-gray-200 text-hemp-ink font-semibold px-6 py-3 rounded-lg shadow-card hover:bg-gray-300"
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={!allFilled}
          onClick={onNext}
          className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold px-8 py-3 rounded-lg shadow-card transition-all duration-300 disabled:opacity-60"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
