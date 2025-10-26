import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { notifyError } from "../../utils/notify";
import { useMessages } from "../../hooks/useMessages";
import { Loader2, ArrowLeft, Send } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
}

export default function Chat() {
  const { userId: partnerId } = useParams<{ userId: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🌿 Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, []);

  // 🌿 Load partner info
  useEffect(() => {
    const loadPartner = async () => {
      if (!partnerId) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", partnerId)
        .maybeSingle();
      if (error) notifyError(error.message);
      else setPartner(data);
    };
    loadPartner();
  }, [partnerId]);

  // 📨 Hook for messages
  const { messages, loading, fetchMessages, sendMessage, markAsRead } =
    useMessages(currentUserId || "", partnerId || "");

  // 🔄 Fetch messages and mark them as read whenever user opens the chat or messages change
useEffect(() => {
  if (!currentUserId || !partnerId) return;

  const load = async () => {
    await fetchMessages();
    await markAsRead(); // 👈 run after messages are fetched
  };

  load();
}, [currentUserId, partnerId, fetchMessages, markAsRead]);


  // 📜 Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 💬 Handle sending
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    await sendMessage(messageText);
    setMessageText("");
  };

  if (!partnerId || !currentUserId)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading chat...
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Link
            to={
                window.location.pathname.includes("admin-dashboard")
                ? "/admin-dashboard/messaging"
                : "/employee-dashboard/messaging"
            }
            className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
            <ArrowLeft className="w-4 h-4" /> Back
        </Link>

          <h1 className="font-semibold text-gray-800">
            {partner?.full_name || "Loading..."}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-2xl max-w-[70%] shadow ${
                  msg.sender_id === currentUserId
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-line break-words">
                  {msg.message}
                </p>
                <span className="text-[10px] opacity-70 block mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t flex items-center bg-gray-50"
      >
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="ml-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
