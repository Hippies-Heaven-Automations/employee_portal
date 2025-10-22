import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FileDown, Image as ImageIcon } from "lucide-react";
import hhLogo from "../../assets/hh-logo.png";
import { InvoiceData } from "../../types/payroll";

export default function InvoicePreview({ invoiceData }: { invoiceData: InvoiceData }) {
  const ref = useRef<HTMLDivElement>(null);
  const dateStart = invoiceData.date_started ? new Date(invoiceData.date_started) : null;
  const dateEnd = invoiceData.date_ended ? new Date(invoiceData.date_ended) : null;

  const dateRange =
    dateStart && dateEnd
      ? `${dateStart.toLocaleDateString(undefined, { month: "long", day: "numeric" })} - ${dateEnd.toLocaleDateString(undefined, { day: "numeric" })}`
      : "—";

  const exportPDF = async () => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#ffffff" });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const w = 210;
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save(`${invoiceData.invoice_no || "Invoice"}.pdf`);
  };

  const exportPNG = async () => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#ffffff" });
    const img = canvas.toDataURL("image/png", 0.85);
    const a = document.createElement("a");
    a.href = img;
    a.download = `${invoiceData.invoice_no || "Invoice"}.png`;
    a.click();
  };

  const fmt = (n?: number) =>
    (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-3 font-sans">
      {/* === Export Buttons === */}
      <div className="flex justify-end gap-2">
        <button
          onClick={exportPDF}
          className="inline-flex items-center gap-2 bg-hemp-green text-white px-3 py-1.5 rounded-md hover:bg-hemp-forest text-sm"
        >
          <FileDown size={16} /> PDF
        </button>
        <button
          onClick={exportPNG}
          className="inline-flex items-center gap-2 bg-hemp-brown text-white px-3 py-1.5 rounded-md hover:bg-hemp-forest text-sm"
        >
          <ImageIcon size={16} /> PNG
        </button>
      </div>

      {/* === Invoice Canvas === */}
      <div
        ref={ref}
        className="relative mx-auto bg-white text-hemp-ink shadow-sm border border-gray-200 overflow-hidden"
        style={{ width: "210mm", height: "297mm", padding: "18mm 18mm 20mm 18mm" }}
      >
        {/* === Header === */}
        <div className="flex justify-between items-center pb-3 border-b-4 border-hemp-green relative">
          <div className="flex items-center gap-3">
            <img
              src={hhLogo}
              alt="Hippies Heaven Logo"
              className="h-14 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-hemp-forest tracking-wide">
                Hippies Heaven Gift Shop LLC
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[40px] font-extrabold tracking-[6px] leading-none text-hemp-ink">
              INVOICE
            </div>
            <div className="mt-2 italic text-[16px] font-medium opacity-80 text-hemp-forest">
              {invoiceData.full_name || "Employee Name"}
            </div>
          </div>
        </div>

        {/* thin hemp accent line below */}
        <div className="h-[3px] w-full bg-hemp-sage mb-8" />

        {/* === Info Blocks === */}
        <div className="grid grid-cols-2 gap-8 text-[13px] leading-[1.45]">
          <div className="space-y-3">
            <div>
              <div className="font-semibold tracking-wide text-hemp-forest">Date Issued:</div>
              <div className="mt-0.5 text-hemp-ink">
                {invoiceData.date_issued ||
                  new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>
            </div>
            <div>
              <div className="font-semibold tracking-wide text-hemp-forest">Invoice No:</div>
              <div className="mt-0.5 text-hemp-ink">{invoiceData.invoice_no || "—"}</div>
            </div>
          </div>

          <div className="space-y-3 text-right">
            <div className="font-semibold tracking-wide text-hemp-forest">Issued to:</div>
            <div className="mt-0.5">
              Shawn Downing – Hippies Heaven LLC
              <br />
              433 South Locust, Centralia
              <br />
              Illinois 62801, USA
            </div>
          </div>
        </div>

        {/* === Table === */}
        <div className="mt-10 border border-gray-300">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="text-hemp-ink bg-gray-100 font-semibold">
                <th className="w-[70px] px-3 py-3 border-r border-gray-300 text-left">NO.</th>
                <th className="px-3 py-3 border-r border-gray-300 text-left">DESCRIPTION</th>
                <th className="w-[120px] px-3 py-3 border-r border-gray-300 text-center">
                  HRS WORKED
                </th>
                <th className="w-[120px] px-3 py-3 border-r border-gray-300 text-center">RATE</th>
                <th className="w-[140px] px-3 py-3 text-right">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                <td className="px-3 py-24 border-t border-gray-300 border-r text-left">1</td>
                <td className="px-3 py-24 border-t border-gray-300 border-r text-left">
                 {invoiceData.description || dateRange}
                </td>
                <td className="px-3 py-24 border-t border-gray-300 border-r text-center">
                  {invoiceData.hrs_worked ?? "—"}
                </td>
                <td className="px-3 py-24 border-t border-gray-300 border-r text-center">
                  ${fmt(invoiceData.rate)}
                </td>
                <td className="px-3 py-24 border-t border-gray-300 text-right">
                  ${fmt(invoiceData.total ?? invoiceData.subtotal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* === Grand Total === */}
          <div className="flex justify-between items-center">
            <div className="text-[12px] tracking-[2px] font-semibold text-hemp-forest ml-auto mr-[140px] mt-4">
              GRAND TOTAL
            </div>
            <div className="text-[16px] font-extrabold mt-3 mr-3 text-hemp-green">
              ${fmt(invoiceData.total ?? invoiceData.subtotal)}
            </div>
          </div>
        </div>

        {/* === Payment Details === */}
        <div className="mt-10">
          <div className="font-extrabold tracking-wide text-[16px] text-hemp-forest">
            Payment Details:
          </div>
          <div className="mt-2 text-[13px] leading-6">
            Wise tag/email: {invoiceData.wise_tag || "—"} / {invoiceData.wise_email || "—"}
            <br />
            Bank Name: {invoiceData.bank_name || "—"}
            <br />
            Account Number: {invoiceData.account_number || "—"}
          </div>
        </div>

        {/* === Signature === */}
        <div className="absolute right-[18mm] bottom-[24mm] text-right">
          <div className="inline-block min-w-[220px] pt-2 text-[13px] font-medium text-hemp-ink">
            {invoiceData.full_name || "Employee Name"}
          </div>
          <div className="border-t border-gray-400 text-[12px] text-hemp-forest mt-1">
            {invoiceData.position || ""}
          </div>
        </div>
      </div>
    </div>
  );
}
