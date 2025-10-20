import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Loader2, FileText, PlayCircle } from "lucide-react";
import { notifyError } from "../../utils/notify";

interface MediaItem {
  type: "video" | "doc";
  title: string;
  url: string;
}

interface Training {
  id: string;
  title: string;
  description: string | null;
  media: MediaItem[];
  allowed_types: string[];
  requires_signature: boolean;
  created_at: string;
}

export default function TrainingPreview() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);

  // 🌿 Helper for YouTube embeds
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

  // 🌿 Fetch training details
  useEffect(() => {
    const fetchTraining = async () => {
      try {
        const { data, error } = await supabase
          .from("trainings")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setTraining(data as Training);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load training details.";
        notifyError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchTraining();
  }, [id]);

  // 🌿 Loading state
  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        <Loader2 className="mr-2 animate-spin" /> Loading training preview...
      </div>
    );

  if (!training)
    return (
      <p className="text-center text-gray-600">
        Training not found or failed to load.
      </p>
    );

  // 🌿 Render
  return (
    <section className="animate-fadeInUp mx-auto max-w-5xl p-6 text-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-hemp-forest mb-2">
          {training.title}
        </h1>
        {training.description && (
          <p className="text-hemp-ink/80 leading-relaxed">
            {training.description}
          </p>
        )}
      </div>

      {/* Media Section */}
      <div className="space-y-6">
        {training.media?.length > 0 ? (
          training.media.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-hemp-sage rounded-lg shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                {item.type === "video" ? (
                  <PlayCircle size={22} className="text-hemp-green" />
                ) : (
                  <FileText size={20} className="text-hemp-green" />
                )}
                <h2 className="text-lg font-semibold text-hemp-forest">
                  {item.title || (item.type === "video" ? "Video" : "Document")}
                </h2>
              </div>

              {item.type === "video" ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-hemp-sage/40">
                  <iframe
                    src={getEmbedUrl(item.url)}
                    className="h-full w-full border-0"
                    allowFullScreen
                    title={item.title}
                  ></iframe>
                </div>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-hemp-green hover:text-hemp-forest font-medium mt-2"
                >
                  📄 Open Document
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">
            No media available for this training.
          </p>
        )}
      </div>

      {/* Training Info Footer */}
      <div className="mt-10 border-t border-hemp-sage/50 pt-5 text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-semibold text-hemp-forest">
            Allowed Employee Types:
          </span>{" "}
          {training.allowed_types?.join(", ") || "—"}
        </p>
        <p>
          <span className="font-semibold text-hemp-forest">
            Requires Signature:
          </span>{" "}
          {training.requires_signature ? (
            <span className="text-green-600 font-medium">Yes</span>
          ) : (
            "No"
          )}
        </p>
      </div>
    </section>
  );
}
