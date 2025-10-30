import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Chat from "./Chat";

export default function ChatRoute() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  if (!userId) return null;

  return (
    <div className="flex flex-col h-full">
      {/* 🧭 Optional back button */}
      <div className="flex items-center gap-2 p-3 bg-green-600 text-white">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded hover:bg-green-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm">Back to Inbox</span>
      </div>

      <Chat
        partnerId={userId}
        index={0}
        onClose={() => navigate(-1)}
        inboxOpen={false}
      />
    </div>
  );
}
