import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

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
  const [error, setError] = useState<string | null>(null);

  // ✅ Moved here so it’s always in scope
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTraining();
  }, [id]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-600">
        Loading training preview...
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-600">⚠️ {error}</div>;

  if (!training) {
    return <p className="text-center text-gray-600">Training not found.</p>;
  }

  // ✅ Properly scoped return begins here
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        {training.title}
      </h1>
      <p className="mb-4 text-gray-700">{training.description}</p>

      <div className="space-y-6">
        {training.media?.length > 0 ? (
          training.media.map((item, i) => (
            <div
              key={i}
              className="rounded-md border border-gray-200 bg-white p-4 shadow-sm"
            >
              <h2 className="mb-2 text-lg font-semibold text-gray-800">
                {item.title || (item.type === "video" ? "Video" : "Document")}
              </h2>

              {item.type === "video" ? (
                <div className="aspect-video w-full overflow-hidden rounded-md">
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
                  className="text-blue-600 hover:underline"
                >
                  📄 Open Document
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No media available for this training.</p>
        )}
      </div>

      <div className="mt-8 border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-600">
          Allowed Employee Types:{" "}
          <span className="font-medium">
            {training.allowed_types?.join(", ") || "—"}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          Requires Signature:{" "}
          {training.requires_signature ? (
            <span className="text-green-600 font-medium">Yes</span>
          ) : (
            "No"
          )}
        </p>
      </div>
    </div>
  );
}
