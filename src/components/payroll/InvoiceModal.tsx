import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import InvoicePreview from "./InvoicePreview";
import { InvoiceData } from "../../types/payroll";
/**
 * Fullscreen modal: centers A4 and scales to fit (no scrollbars).
 */
export default function InvoiceModal({
  open,
  onClose,
  invoiceData,
}: {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
}) {
  const [vw, setVw] = useState(window.innerWidth);
  const [vh, setVh] = useState(window.innerHeight);

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // A4 @ ~96dpi ≈ 794 x 1123 px. Add margins around.
  const scale = useMemo(() => {
    const a4w = 794, a4h = 1123;
    const pad = 48; // breathing room
    return Math.min((vw - pad) / a4w, (vh - pad) / a4h);
  }, [vw, vh]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <button
        className="absolute top-4 right-4 text-white/90 hover:text-white"
        aria-label="Close"
        onClick={onClose}
      >
        <X size={28} />
      </button>

      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
          className="origin-center"
        >
          {/* This component renders at true A4 mm; scale handles fit */}
          <InvoicePreview invoiceData={invoiceData} />
        </div>
      </div>
    </div>
  );
}
