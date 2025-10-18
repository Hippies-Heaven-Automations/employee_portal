import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import SignatureCanvas from "react-signature-canvas";

interface MediaItem {
  type: "video" | "doc";
  title: string;
  url: string;
}

export default function TrainingDetail() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<any>(null);
  const [tracker, setTracker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ackLoading, setAckLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ✅ Helper to fix YouTube embed links
  const getEmbedUrl = (url: string) => {
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
  const sigCanvas = useRef<SignatureCanvas>(null);

  
  // ✅ Load current user once
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setCurrentUser(data.user);
      else {
        const session = (await supabase.auth.getSession()).data.session;
        if (session?.user) setCurrentUser(session.user);
      }
    };
    loadUser();
  }, []);

  // ✅ Fetch training + tracker only after user is known
  useEffect(() => {
    if (!id || !currentUser) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: t, error: tErr } = await supabase
          .from("trainings")
          .select("*")
          .eq("id", id)
          .single();
        if (tErr) throw tErr;

        const { data: track } = await supabase
          .from("training_tracker")
          .select("*")
          .eq("employee_id", currentUser.id)
          .eq("training_id", id)
          .single();

        setTraining(t);
        setTracker(track);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  const handleAcknowledge = async () => {
    if (!currentUser) return;
    if (!sigCanvas.current) return;

   if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
  alert("Please sign before submitting!");
  return;
}

const signatureData = sigCanvas.current
  .getCanvas() // ✅ use raw canvas instead of getTrimmedCanvas()
  .toDataURL("image/png");


    try {
      setAckLoading(true);
      const { error } = await supabase.from("training_tracker").upsert(
        {
          employee_id: currentUser.id,
          training_id: id,
          docu_signed_at: new Date().toISOString(),
          signature_data: signatureData, // ⬅️ store base64 signature
        },
        { onConflict: "employee_id,training_id" }
      );
      if (error) throw error;

      setTracker((prev: any) => ({
        ...prev,
        docu_signed_at: new Date().toISOString(),
        signature_data: signatureData,
      }));

      sigCanvas.current.clear();
      alert("✅ Signature saved successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAckLoading(false);
    }
  };

  // ✅ Render
  if (loading)
    return <div className="flex h-64 items-center justify-center">Loading...</div>;

  if (error)
    return <div className="p-4 text-center text-red-600">⚠️ {error}</div>;

  if (!training) return <p>Training not found.</p>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold mb-3">{training.title}</h1>
      <p className="mb-6 text-gray-700">{training.description}</p>

      <div className="space-y-6">
        {training.media?.map((m: MediaItem, i: number) => (
          <div key={i} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">{m.title}</h2>
            {m.type === "video" ? (
              <div className="aspect-video w-full overflow-hidden rounded-md">
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
                className="text-blue-600 hover:underline"
              >
                📄 Open Document
              </a>
            )}
          </div>
        ))}
      </div>

      {training.requires_signature && !tracker?.docu_signed_at && (
  <div className="mt-8 border-t pt-4">
    <p className="text-gray-700 mb-2">
      Please review the training documents and sign below to acknowledge.
    </p>

    <div className="border rounded-md bg-gray-50 p-3">
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 150,
          className: "border border-gray-300 rounded-md bg-white",
        }}
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => sigCanvas.current?.clear()}
          className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
        >
          Clear
        </button>
        <button
          onClick={handleAcknowledge}
          disabled={ackLoading}
          className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
        >
          {ackLoading ? "Saving..." : "Sign & Continue"}
        </button>
      </div>
    </div>
  </div>
)}


      {(!training.requires_signature || tracker?.docu_signed_at) && (
        <div className="mt-6">
          <Link
            to={`/employee-dashboard/training/${training.id}/quiz`}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Take Quiz
          </Link>
        </div>
      )}
    </div>
  );
}
