import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import SignatureCanvas from "react-signature-canvas";
import {
  Loader2,
  FileText,
  Link as LinkIcon,
  PenTool,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";

interface Agreement {
  id: string;
  title: string;
  description: string | null;
  doc_links: string[];
  allowed_types: string[];
}

export default function AgreementDetail() {
  const { id } = useParams<{ id: string }>();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  // 🌿 Fetch agreement and signature status
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("agreements")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setAgreement(data as Agreement);

        // 🌿 Check if current employee already signed
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No active user session.");

        const { data: tracker } = await supabase
          .from("agreement_tracker")
          .select("id, signature_base64, signed_at, status")
          .eq("employee_id", user.id)
          .eq("agreement_id", id)
          .maybeSingle();

        if (tracker) {
          setHasSigned(tracker.status === "signed");
          setSignatureData(tracker.signature_base64);
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load agreement details.";
        notifyError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchAgreement();
  }, [id]);

  // 🌿 Handle signature submit
  const handleSign = async () => {
    try {
      if (!sigCanvas.current) return;
      const sig = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      if (sigCanvas.current.isEmpty()) {
        notifyError("Please provide your signature before submitting.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User session expired.");

      setSigning(true);

      const base64Data = sig.replace(/^data:image\/png;base64,/, "");

      const payload = {
        employee_id: user.id,
        agreement_id: id,
        signature_base64: base64Data,
        signed_at: new Date().toISOString(),
        status: "signed",
      };

      const { error } = await supabase.from("agreement_tracker").upsert(payload, {
        onConflict: "employee_id,agreement_id",
      });

      if (error) throw error;

      setHasSigned(true);
      setSignatureData(base64Data);
      notifySuccess("✅ Agreement signed successfully!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to sign agreement.";
      notifyError(msg);
    } finally {
      setSigning(false);
    }
  };

  // 🌿 Clear signature pad
  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  // 🧠 Helper: render PDF preview
  const renderPDFViewer = (url: string) => {
    const match = url.match(/\/d\/([^/]+)/); // Detect Drive file ID
    const fileId = match ? match[1] : null;
    const previewUrl = fileId
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : url;

    return (
      <iframe
        src={previewUrl}
        className="w-full h-[600px] rounded-lg border border-hemp-sage/50 mt-3"
        allow="autoplay"
        title="PDF Preview"
      ></iframe>
    );
  };

  // 🌿 UI Rendering
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        <Loader2 className="animate-spin mr-2" /> Loading agreement details...
      </div>
    );

  if (!agreement)
    return (
      <div className="p-6 text-center text-gray-600">
        Agreement not found or failed to load.
      </div>
    );

  return (
    <section className="animate-fadeInUp mx-auto max-w-5xl p-6 text-gray-700">
      {/* 🌿 Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-hemp-forest">
          {agreement.title}
        </h1>
        <Link
          to="/employee-dashboard/agreements"
          className="text-sm text-hemp-green hover:text-hemp-forest font-medium transition"
        >
          ← Back to Agreements
        </Link>
      </div>

      {agreement.description && (
        <p className="mb-5 text-hemp-ink/80 leading-relaxed">
          {agreement.description}
        </p>
      )}

      {/* 🌿 Documents */}
      <div className="space-y-6 mb-10">
        {agreement.doc_links?.length > 0 ? (
          agreement.doc_links.map((url, i) => (
            <div
              key={i}
              className="bg-white border border-hemp-sage rounded-lg shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText size={20} className="text-hemp-green" />
                <h2 className="text-lg font-semibold text-hemp-forest">
                  Document {i + 1}
                </h2>
              </div>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-hemp-green hover:text-hemp-forest font-medium"
              >
                <LinkIcon size={14} className="mr-1" /> Open in new tab
              </a>

              {/* 👇 Inline PDF Preview */}
              {renderPDFViewer(url)}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No documents attached.</p>
        )}
      </div>

      {/* 🌿 Signature Section */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <PenTool className="text-hemp-green" size={20} />
          <h2 className="text-xl font-semibold text-hemp-forest">Signature</h2>
        </div>

        {hasSigned ? (
          <div className="flex flex-col items-center text-center">
            <img
              src={`data:image/png;base64,${signatureData}`}
              alt="Your Signature"
              className="border border-hemp-sage/50 rounded-md max-h-48 mb-4"
            />
            <p className="text-green-700 font-medium flex items-center gap-1">
              <CheckCircle size={16} /> You have signed this agreement.
            </p>
          </div>
        ) : (
          <div>
            <div className="border border-hemp-sage/50 rounded-lg bg-hemp-mist/10 overflow-hidden mb-3">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="#006644"
                backgroundColor="#ffffff"
                canvasProps={{
                  width: 600,
                  height: 200,
                  className: "mx-auto block",
                }}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={clearSignature}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200 transition"
              >
                <Trash2 size={14} /> Clear
              </button>

              <button
                onClick={handleSign}
                disabled={signing}
                className={`inline-flex items-center gap-1.5 rounded-md bg-hemp-green px-4 py-1.5 text-xs font-semibold text-white hover:bg-hemp-forest transition ${
                  signing ? "opacity-70 cursor-wait" : ""
                }`}
              >
                {signing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Signing...
                  </>
                ) : (
                  <>
                    <PenTool size={14} /> Sign Agreement
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
