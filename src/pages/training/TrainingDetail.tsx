import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { notifyError } from "../../utils/notify";

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
}

interface SupabaseUser {
  id: string;
  email?: string;
}

export default function TrainingDetail() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<(Training & {
    hasActiveQuiz?: boolean;
    alreadyTaken?: boolean;
  }) | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);

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

  // 🌿 Fetch training details
  useEffect(() => {
    if (!id || !currentUser) return;

    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        // 1️⃣ Fetch the training details
        const { data: trainingData, error: trainingError } = await supabase
          .from("trainings")
          .select("*")
          .eq("id", id)
          .single<Training>();

        if (trainingError) throw trainingError;
        if (!trainingData) throw new Error("Training not found.");

        // 2️⃣ Check if there’s an active quiz
        const { data: quizData, error: quizError } = await supabase
          .from("training_quizzes")
          .select("id")
          .eq("training_id", id)
          .eq("is_active", true)
          .maybeSingle();

        if (quizError) throw quizError;

        // 3️⃣ Check if user already completed it
        const { data: trackerData, error: trackerError } = await supabase
          .from("training_tracker")
          .select("id")
          .eq("training_id", id)
          .eq("employee_id", currentUser.id)
          .maybeSingle();

        if (trackerError) throw trackerError;

        // 4️⃣ Save everything
        setTraining({
          ...trainingData,
          hasActiveQuiz: !!quizData,
          alreadyTaken: !!trackerData,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error loading training.";
        setError(message);
        notifyError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

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

      {/* Quiz Access */}
      <div className="mt-8">
        {training.hasActiveQuiz ? (
          training.alreadyTaken ? (
            <p className="text-gray-600 italic">
              ✅ You’ve already completed this quiz.
            </p>
          ) : (
            <Link
              to={`/employee-dashboard/training/${training.id}/quiz`}
              className="inline-block rounded-md bg-hemp-green px-5 py-2 text-white font-medium hover:bg-hemp-forest transition"
            >
              Take Quiz
            </Link>
          )
        ) : (
          <p className="text-gray-500 italic">No active training quiz available.</p>
        )}
      </div>
    </div>
  );
}
