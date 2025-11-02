import { useMemo } from "react";
import {
  generateTimeSlots,
  convertSlotLabel,
  getTzDiffHours,
  formatDate,
} from "./scheduleUtils";
import { Schedule } from "./types";

interface ScheduleWeekViewProps {
  schedules: Schedule[];
  timezone: "CST" | "PHT";
  currentWeekStart: Date;
  getWeekDays: { date: Date; label: string }[];
}

export default function ScheduleWeekView({
  schedules,
  timezone,
  currentWeekStart,
  getWeekDays,
}: ScheduleWeekViewProps) {
  // Filter schedules for this week only
  const filteredSchedules = useMemo(() => {
    const start = currentWeekStart;
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 7);
    return schedules.filter((s) => {
      const d = new Date(s.date);
      return d >= start && d < end;
    });
  }, [schedules, currentWeekStart]);

  return (
    <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-x-auto mb-8">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Time</th>
            {getWeekDays.map((d) => (
              <th key={d.label} className="px-4 py-3 text-center">
                {d.label}
                <br />
                <span className="text-xs text-gray-500">
                  {formatDate(d.date)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {generateTimeSlots().map((slot) => {
            const slotLabel =
              timezone === "CST"
                ? slot
                : convertSlotLabel(
                    slot,
                    currentWeekStart.toISOString().slice(0, 10),
                    "PHT"
                  );

            return (
              <tr
                key={slot}
                className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition-all"
              >
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {slotLabel}
                </td>

                {getWeekDays.map((d) => {
                  // find schedules that fall within the current slot
                  const cellSchedules = filteredSchedules.filter((s) => {
                    const schedDate = new Date(s.date);

                    // timezone adjust
                    if (timezone === "PHT") {
                      const diff = getTzDiffHours(s.date);
                      schedDate.setHours(schedDate.getHours() + diff);
                    }

                    // detect if schedule crosses midnight
                    const startH = new Date(`1970-01-01T${s.time_in}`).getHours();
                    const endH = new Date(`1970-01-01T${s.time_out}`).getHours();
                    const crossesMidnight = endH <= startH;

                    if (schedDate.toDateString() === d.date.toDateString())
                      return true;

                    if (crossesMidnight) {
                      const nextDay = new Date(schedDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      if (nextDay.toDateString() === d.date.toDateString())
                        return true;
                    }

                    return false;
                  });

                  const match = cellSchedules.find((s) => {
                    const baseStartH = new Date(`1970-01-01T${s.time_in}`).getHours();
                    const baseEndH = new Date(`1970-01-01T${s.time_out}`).getHours();
                    const diff = timezone === "PHT" ? getTzDiffHours(s.date) : 0;
                    const startH = (baseStartH + diff + 24) % 24;
                    const endH = (baseEndH + diff + 24) % 24;

                    const [a, b] = slot.split(" - ");
                    const to24 = (label: string) => {
                      const [num, mer] = label.split(" ");
                      let h = parseInt(num, 10);
                      if (mer === "PM" && h < 12) h += 12;
                      if (mer === "AM" && h === 12) h = 0;
                      return h;
                    };

                    const slotStartH = to24(a);
                    const slotEndH = to24(b);

                    // overlap detection
                    const overlaps =
                      (startH < slotEndH && endH > slotStartH) ||
                      (endH < startH &&
                        (slotStartH < endH || slotEndH > startH));

                    return overlaps;
                  });

                  return (
                    <td
                      key={d.label + slot}
                      className="px-4 py-3 text-center text-gray-700"
                    >
                      {match ? (
                        <span className="font-medium text-hemp-forest">
                          {match.profiles?.full_name}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
