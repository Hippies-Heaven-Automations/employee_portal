import { useState } from "react";
import { X, Loader2, Send } from "lucide-react";
import { Button } from "../../components/Button";
import { notifyError } from "../../utils/notify";

interface EndOfShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportText: string) => Promise<void>;
}

export default function EndOfShiftReportModal({
  isOpen,
  onClose,
  onSubmit,
}: EndOfShiftReportModalProps) {
  const [reportText, setReportText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      notifyError("Please write your end-of-shift report before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(reportText.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-hemp-sage/50 overflow-hidden animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hemp-sage/40 bg-hemp-mist/40">
          <h2 className="text-lg font-semibold text-hemp-forest">
            End of Shift Report
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-md hover:bg-hemp-mist/80 text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <label className="block text-sm text-gray-600 mb-2">
            Please describe your accomplishments, issues, and plans:
          </label>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Example: Today I handled customers, restocked shelves, cleaned the counter area, and updated inventory..."
            rows={6}
            className="w-full rounded-lg border border-hemp-sage/50 bg-white/60 px-3 py-2 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green resize-none"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-hemp-sage/40 bg-white flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="ghost"
            disabled={submitting}
            className="px-4 py-2 text-gray-700 hover:bg-hemp-mist rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-hemp-green hover:bg-hemp-forest text-white rounded-lg inline-flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
}
