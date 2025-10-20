import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import SignatureCanvas from "react-signature-canvas";

interface MediaItem {
  type: "video" | "doc";
  title: string;
  url: string;
}

interface Training {
  id: string;
  title: string;
  description: string;
  media?: MediaItem[];
  requires_signature?: boolean;
}

interface TrainingTracker {
  employee_id: string;
  training_id: string;
  docu_signed_at?: string | null;
  signature_data?: string | null;
}

interface SupabaseUser {
  id: string;
  email?: string;
}

export default function TrainingDetail() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<Training | null>(null);
  const [tracker, setTracker] = useState<TrainingTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [ackLoading, setAckLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  // 🌿 Fix YouTube embedding
  const getEmbedUrl = (url: string): string => {
    try {
      if (url.includes("watch?v=")) {
        const videoId = new URL(url).searchParams.get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  // 🌿 Load user
  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email ?? undefined });
      }
    };
    loadUser();
  }, []);

  // 🌿 Fetch training + tracker
  useEffect(() => {
    if (!id || !currentUser) return;

    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        const { data: trainingData, error: trainingError } = await supabase
          .from("trainings")
          .select("*")
          .eq("id", id)
          .single<Training>();

        if (trainingError) throw new Error(trainingError.message);

        const { data: trackerData, error: trackerError } = await supabase
          .from("training_tracker")
          .select("*")
          .eq("employee_id", currentUser.id)
          .eq("training_id", id)
          .maybeSingle<TrainingTracker>();

        if (trackerError) throw new Error(trackerError.message);

        setTraining(trainingData);
        setTracker(trackerData);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error loading training.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

  // 🌿 Handle signature submission
  const handleAcknowledge = async (): Promise<void> => {
    if (!currentUser || !sigCanvas.current) return;

    if (sigCanvas.current.isEmpty()) {
      alert("Please sign before submitting!");
      return;
    }

    const signatureData = sigCanvas.current
      .getCanvas()
      .toDataURL("image/png");

    try {
      setAckLoading(true);

      const { error } = await supabase.from("training_tracker").upsert(
        {
          employee_id: currentUser.id,
          training_id: id,
          docu_signed_at: new Date().toISOString(),
          signature_data: signatureData,
        },
        { onConflict: "employee_id,training_id" }
      );

      if (error) throw new Error(error.message);

      setTracker((prev) => ({
        ...(prev ?? {}),
        docu_signed_at: new Date().toISOString(),
        signature_data: signatureData,
        employee_id: currentUser.id,
        training_id: id ?? "",
      }));

      sigCanvas.current.clear();
      alert("✅ Signature saved successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error saving signature.";
      setError(message);
    } finally {
      setAckLoading(false);
    }
  };

  // 🌿 Render states
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        Loading training...
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-600">⚠️ {error}</div>;

  if (!training)
    return <p className="text-center text-gray-600">Training not found.</p>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Title & Description */}
      <h1 className="text-3xl font-bold text-hemp-forest mb-2">
        {training.title}
      </h1>
      <p className="mb-6 text-gray-700">{training.description}</p>

      {/* Media Section */}
      <div className="space-y-6">
        {training.media?.length ? (
          training.media.map((m, i) => (
            <div
              key={i}
              className="rounded-xl border border-hemp-sage/40 bg-white p-4 shadow-sm"
            >
              <h2 className="mb-2 text-lg font-semibold text-hemp-forest">
                {m.title}
              </h2>
              {m.type === "video" ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <iframe
                    src={getEmbedUrl(m.url)}
                    className="h-full w-full border-0"
                    allowFullScreen
                    title={m.title}
                  />
                </div>
              ) : (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-hemp-green hover:underline"
                >
                  📄 Open Document
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">No media available for this training.</p>
        )}
      </div>

      {/* Signature Section */}
      {training.requires_signature && !tracker?.docu_signed_at && (
        <div className="mt-10 border-t border-hemp-sage/40 pt-6">
          <p className="text-hemp-forest mb-3 font-medium">
            Please review the above materials and sign below to acknowledge
            completion before proceeding to the quiz.
          </p>

          <div className="rounded-xl border border-hemp-sage/40 bg-hemp-mist/20 p-4">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 160,
                className:
                  "border border-hemp-sage/50 rounded-md bg-white w-full",
              }}
            />
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => sigCanvas.current?.clear()}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200 transition"
              >
                Clear
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={ackLoading}
                className="rounded-md bg-hemp-green px-4 py-2 text-sm font-medium text-white hover:bg-hemp-forest disabled:opacity-50 transition"
              >
                {ackLoading ? "Saving..." : "Sign & Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledged State */}
      {training.requires_signature && tracker?.docu_signed_at && (
        <div className="mt-6 text-hemp-green text-sm italic">
          ✅ Signed on{" "}
          {new Date(tracker.docu_signed_at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      )}

      {/* Quiz Access */}
      {(!training.requires_signature || tracker?.docu_signed_at) && (
        <div className="mt-8">
          <Link
            to={`/employee-dashboard/training/${training.id}/quiz`}
            className="inline-block rounded-md bg-hemp-green px-5 py-2 text-white font-medium hover:bg-hemp-forest transition"
          >
            Take Quiz
          </Link>
        </div>
      )}
    </div>
  );
}
