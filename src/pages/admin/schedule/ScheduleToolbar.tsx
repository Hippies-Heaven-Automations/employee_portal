import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { Button } from "../../../components/Button";
import { formatDate } from "./scheduleUtils";

interface ScheduleToolbarProps {
  currentWeekStart: Date;
  timezone: "CST" | "PHT";
  onPrev: () => void;
  onNext: () => void;
  onToggleTz: () => void;
}

export default function ScheduleToolbar({
  currentWeekStart,
  timezone,
  onPrev,
  onNext,
  onToggleTz,
}: ScheduleToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
      {/* Week Navigation */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onPrev}
          variant="outline"
          className="rounded-full p-2 border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white"
        >
          <ChevronLeft size={18} />
        </Button>

        <div className="text-center">
          <p className="font-semibold text-hemp-forest">
            Week of {formatDate(currentWeekStart)}
          </p>
          <p className="text-sm text-gray-500">
            {timezone === "CST"
              ? "Central Time (Illinois)"
              : "Philippine Time"}
          </p>
        </div>

        <Button
          onClick={onNext}
          variant="outline"
          className="rounded-full p-2 border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white"
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      {/* Timezone Switcher */}
      <Button
        onClick={onToggleTz}
        variant="outline"
        className="flex items-center gap-2 border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition-all rounded-lg px-5 py-2"
      >
        <Globe size={18} />
        <span>Switch to {timezone === "CST" ? "PHT" : "CST"}</span>
      </Button>
    </div>
  );
}
