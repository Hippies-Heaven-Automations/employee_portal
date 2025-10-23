import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, FileText, Link as LinkIcon, Signature } from "lucide-react";
import { notifyError } from "../../utils/notify";

interface Agreement {
  id: string;
  title: string;
  description: string | null;
  doc_links: string[];
  allowed_types: string[];
  created_at: string;
}

interface SignatureLog {
  id: string;
  employee_name: string;
  employee_type: string;
  signed_at: string;
  status: string;
}

interface TrackerRow {
  id: string;
  signed_at: string | null;
  status: string;
  employees?: {
    full_name?: string;
    employee_type?: string;
  } | null;
}
export default function AgreementPreview() {
  const { id } = useParams<{ id: string }>();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [signatures, setSignatures] = useState<SignatureLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌿 Fetch agreement and tracker logs
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

        // Fetch signed employees
        const { data: logs, error: logErr } = await supabase
          .from("agreement_tracker")
          .select(
            `
            id,
            signed_at,
            status,
            employee_id,
            employees:employee_id (
              full_name,
              employee_type
            )
          `
          )
          .eq("agreement_id", id)
          .order("signed_at", { ascending: false });

        if (logErr) throw logErr;
        
        const mapped: SignatureLog[] =
        (logs as TrackerRow[]).map((l) => ({
            id: l.id,
            employee_name: l.employees?.full_name ?? "—",
            employee_type: l.employees?.employee_type ?? "—",
            signed_at: l.signed_at ?? "",
            status: l.status ?? "pending",
        })) ?? [];

        setSignatures(mapped);
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

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        <Loader2 className="mr-2 animate-spin" /> Loading agreement details...
      </div>
    );

  if (!agreement)
    return (
      <p className="text-center text-gray-600">
        Agreement not found or failed to load.
      </p>
    );

  return (
    <section className="animate-fadeInUp mx-auto max-w-5xl p-6 text-gray-700">
      {/* 🌿 Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2">
          {agreement.title}
        </h1>
        {agreement.description && (
          <p className="text-hemp-ink/80 leading-relaxed">
            {agreement.description}
          </p>
        )}
      </div>

      {/* 🌿 Documents */}
      <div className="space-y-6">
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
                className="inline-flex items-center text-hemp-green hover:text-hemp-forest font-medium mt-1"
              >
                <LinkIcon size={14} className="mr-1" />
                Open Document
              </a>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">
            No documents attached to this agreement.
          </p>
        )}
      </div>

      {/* 🌿 Signature Logs */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-3">
          <Signature className="text-hemp-green" size={20} />
          <h2 className="text-xl font-semibold text-hemp-forest">
            Signature Records
          </h2>
        </div>

        {signatures.length === 0 ? (
          <p className="text-gray-500 italic">No signatures yet.</p>
        ) : (
          <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Signed At</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {signatures.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-hemp-sage/30 hover:bg-hemp-mist/40 transition"
                  >
                    <td className="p-3 font-medium text-hemp-forest">
                      {s.employee_name}
                    </td>
                    <td className="p-3">{s.employee_type}</td>
                    <td className="p-3">
                      {s.signed_at
                        ? new Date(s.signed_at).toLocaleString()
                        : "—"}
                    </td>
                    <td
                      className={`p-3 font-medium ${
                        s.status === "signed"
                          ? "text-green-600"
                          : s.status === "revoked"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {s.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌿 Info Footer */}
      <div className="mt-10 border-t border-hemp-sage/50 pt-5 text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-semibold text-hemp-forest">
            Allowed Employee Types:
          </span>{" "}
          {agreement.allowed_types?.join(", ") || "—"}
        </p>
      </div>
    </section>
  );
}
