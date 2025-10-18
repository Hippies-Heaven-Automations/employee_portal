import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Training {
  id: string;
  title: string;
  description: string;
  video_url?: string | null;
}

interface TrackerRecord {
  quiz_score: number | null;
  completed_at: string | null;
}

export default function TrainingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [training, setTraining] = useState<Training | null>(null);
  const [progress, setProgress] = useState<TrackerRecord | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  // Fetch training details and user progress
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        // Fetch training details
        const { data: trainingData, error: trainingErr } = await supabase
          .from("trainings")
          .select("id, title, description, video_url")
          .eq("id", id)
          .single();

        if (trainingErr) throw trainingErr;
        setTraining(trainingData);

        // Fetch progress if user logged in
        if (userId) {
          const { data: progressData, error: trackerErr } = await supabase
            .from("training_tracker")
            .select("quiz_score, completed_at")
            .eq("training_id", id)
            .eq("employee_id", userId)
            .maybeSingle();

          if (trackerErr) throw trackerErr;
          setProgress(progressData);
        }
      } catch (err: any) {
        console.error("Error fetching training:", err);
        setError(err.message || "Failed to load training details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-600">
        Loading training...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        ⚠️ {error}
      </div>
    );

  if (!training)
    return (
      <div className="p-4 text-center text-gray-600">
        Training not found.
      </div>
    );

  const handleTakeQuiz = () => {
    navigate(`/employee-dashboard/training/${training.id}/quiz`);
  };

  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        {training.title}
      </h1>
      <p className="mb-4 text-gray-700">{training.description}</p>

      {training.video_url && (
        <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            className="h-full w-full"
            src={training.video_url}
            title={training.title}
            allowFullScreen
          />
        </div>
      )}

      {progress && progress.completed_at ? (
        <div className="rounded-md bg-green-50 p-4 text-center text-green-700">
          <h2 className="text-lg font-semibold">🎉 Training Completed</h2>
          <p className="mt-1 text-sm">
            Score: <span className="font-bold">{progress.quiz_score ?? 0}%</span>
          </p>
          <p className="text-xs text-gray-600">
            Completed on{" "}
            {new Date(progress.completed_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={handleTakeQuiz}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Take Quiz
          </button>
        </div>
      )}
    </div>
  );
}
