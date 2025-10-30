import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { notifyError } from "../../utils/notify";
import { useMessages } from "../../hooks/useMessages";
import { Loader2, Send, Minus, X, ChevronUp } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
}

interface ChatProps {
  partnerId: string;
  index: number; // for horizontal offset when multiple are open
  onClose: (partnerId: string) => void;
  inboxOpen?: boolean;
}

export default function Chat({
  partnerId,
  index,
  onClose,
  inboxOpen = false,
}: ChatProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 📱 watch screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // 🔄 Fetch + mark read
  useEffect(() => {
    if (!currentUserId || !partnerId) return;
    const load = async () => {
      await fetchMessages();
      await markAsRead();
    };
    load();
  }, [currentUserId, partnerId, fetchMessages, markAsRead]);

  // 📜 Auto-scroll
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  // 💬 Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    await sendMessage(messageText);
    setMessageText("");
  };
  // 💬 Positioning logic (dynamic + animated + stack compression)
  const inboxWidth = 360; // Inbox width
  const gapBetween = 12; // space between chats
  const chatWidth = 380; // chat panel width
  const minimizedWidth = 200; // minimized chat bubble width

  // 📦 Compress minimized chats slightly if many are open
  const compression = Math.max(0, index - 2) * 10; // overlap effect after 3rd chat

  // 👈 shift chat stack left when inbox is open
  const inboxShift = inboxOpen ? inboxWidth + gapBetween : 0;

  // ✅ adaptive width depending on minimized state
  const effectiveWidth = isMinimized
    ? minimizedWidth - compression
    : chatWidth + gapBetween;

  // 🎯 calculate position with smooth transition
  const rightOffsetPx = 20 + inboxShift + index * effectiveWidth;


  if (!currentUserId) return null;

  return (
    <>
      {/* 💬 Desktop floating bubble */}
      {!isMobile && !isMinimized ? (
        <div
          className="fixed bottom-0 bg-white shadow-xl border rounded-t-xl flex flex-col h-[480px] w-[350px] sm:w-[380px]
           transition-all duration-300 ease-in-out transform translate-y-0 opacity-100"
          style={{
            right: `${rightOffsetPx}px`,
            zIndex: 400,
          }}
        >

          {/* Header */}
          <div className="flex items-center justify-between p-2 bg-green-600 text-white rounded-t-xl">
            <div className="font-semibold text-sm ml-2 truncate max-w-[220px]">
              {partner?.full_name || "Chat"}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="hover:bg-green-700 p-1 rounded"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onClose(partnerId)}
                className="hover:bg-green-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end bg-white">
            {loading ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <p className="text-gray-400 text-center mb-4">
                No messages yet. Start the conversation!
              </p>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    } mb-2`}
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
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
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
      ) : !isMobile && (
        // 🟢 Minimized pill (desktop only)
        <button
          className="fixed bg-green-600 text-white rounded-t-lg px-3 py-2 cursor-pointer flex items-center justify-between shadow-lg hover:bg-green-700 transition-all duration-300 ease-in-out text-left w-[200px]"
          style={{
            right: `${rightOffsetPx}px`,
            bottom: 0,
            zIndex: 400,
            transform: "translateY(0)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          onClick={() => setIsMinimized(false)}
        >

          <div className="text-sm font-medium truncate max-w-[140px]">
            {partner?.full_name || "Chat"}
          </div>
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* 📱 Mobile: render inside parent container (takes full height) */}
      {/* 📱 Mobile Chat Layout (scrollable and keyboard-safe) */}
      {isMobile && (
        <div
          className="flex flex-col h-screen w-full bg-white"
          style={{
            position: "relative",
            overflow: "hidden",
            WebkitOverflowScrolling: "touch", // ✅ smooth scrolling on iOS
          }}
        >
          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto p-4 bg-white"
            style={{
              paddingBottom: "6rem", // ✅ ensures input isn’t overlapped by keyboard
            }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <p className="text-gray-400 text-center mb-4">
                No messages yet. Start the conversation!
              </p>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    } mb-2`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[75%] shadow ${
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
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input bar (fixed at bottom, visible above keyboard) */}
          <form
            onSubmit={handleSend}
            className="fixed bottom-0 left-0 right-0 p-3 border-t bg-gray-50 flex items-center"
            style={{
              zIndex: 50,
              paddingBottom: "env(safe-area-inset-bottom)", // ✅ iPhone notch safe zone
            }}
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
      )}

    </>
  );
}
