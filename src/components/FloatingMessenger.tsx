import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Loader2,
  MessageCircle,
  X,
  Plus,
  Circle,
  ArrowLeft,
} from "lucide-react";
import { notifyError, notifySuccess } from "../utils/notify";
import Chat from "../pages/messaging/Chat";

interface Thread {
  partner_id: string;
  partner_name: string;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
}

interface Profile {
  id: string;
  full_name: string;
}

export default function FloatingMessenger() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [openChats, setOpenChats] = useState<
    { partner_id: string; partner_name: string }[]
  >([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [mobileChat, setMobileChat] = useState<{ id: string; name: string } | null>(
    null
  );

  // 🌿 Detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔢 unread total
  const unreadTotal = useMemo(
    () => threads.reduce((sum, t) => sum + (t.unread_count || 0), 0),
    [threads]
  );

  // 🌿 load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  // 📥 load threads (wrapped in useCallback to prevent ESLint warning)
  const fetchThreads = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingThreads(true);
      const { data, error } = await supabase.rpc("get_message_threads", {
        current_user_id: userId,
      });
      if (error) throw error;
      setThreads(data || []);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load messages";
      notifyError(msg);
    } finally {
      setLoadingThreads(false);
    }
  }, [userId]);

  // 👥 load all users for new chat
  const fetchAllUsers = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .neq("id", userId);
    if (error) notifyError(error.message);
    else setAllUsers(data || []);
  };

  // 🔄 realtime refresh
  useEffect(() => {
    if (!userId) return;
    fetchThreads();
    const channel = supabase
      .channel("floating-messenger-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as { sender_id: string; receiver_id: string };
          if (msg.sender_id === userId || msg.receiver_id === userId) {
            fetchThreads();
            if (msg.receiver_id === userId) {
              notifySuccess("📨 New message received!");
            }
          }
        }
      )
      .subscribe();
    return () => {
        supabase.removeChannel(channel);
    };
  }, [userId, fetchThreads]); // ✅ ESLint now satisfied

  // 💬 open chat
  const openChatForPartner = (partner_id: string, partner_name: string) => {
    if (isMobile) {
      setMobileChat({ id: partner_id, name: partner_name });
      return;
    }
    setOpenChats((prev) => {
      const exists = prev.find((c) => c.partner_id === partner_id);
      if (exists) return prev;
      return [...prev, { partner_id, partner_name }];
    });
  };

  const closeChat = (partner_id: string) =>
    setOpenChats((prev) => prev.filter((c) => c.partner_id !== partner_id));

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return allUsers.filter((u) => u.full_name.toLowerCase().includes(q));
  }, [allUsers, search]);

  // 🟢 --- UI ---
  return (
    <>
      {/* 💬 Floating Chat Bubbles (Desktop Only) */}
      {!isMobile &&
        openChats.map((chat, i) => (
          <Chat
            key={chat.partner_id}
            partnerId={chat.partner_id}
            index={i}
            onClose={closeChat}
            inboxOpen={isInboxOpen}
          />
        ))}

        {/* 📬 Inbox (always top, fixed to viewport) */}
        <div
        className={`fixed transition-all duration-300 ease-in-out ${
            isInboxOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full opacity-0 pointer-events-none"
        } ${
            isMobile
            ? "inset-0 w-full h-full bg-white"
            : "bottom-6 right-6 w-[320px] sm:w-[360px] h-[420px] bg-white rounded-t-xl"
        } shadow-2xl border flex flex-col`}
        style={{
            position: "fixed",
            zIndex: 300, // ✅ higher than sidebar, modals, and any layout container
        }}
        >

        {/* Header */}
        <div
          className={`flex items-center justify-between p-3 ${
            isMobile ? "bg-green-600 text-white" : "bg-green-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => setIsInboxOpen(false)}
                className="p-1 rounded hover:bg-green-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Inbox</span>
              {unreadTotal > 0 && (
                <span className="text-[10px] text-white/80">
                  {unreadTotal} unread
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchAllUsers();
                setShowNewChat(true);
              }}
              className="hover:bg-green-700 p-1 rounded"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>

            {!isMobile && (
              <button
                onClick={() => setIsInboxOpen(false)}
                className="hover:bg-green-700 p-1 rounded"
                title="Close inbox"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Inbox Body */}
        <div className="flex-1 overflow-y-auto p-2">
          {loadingThreads ? (
            <div className="flex justify-center items-center h-full text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading...
            </div>
          ) : threads.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-10">
              No conversations yet.
            </p>
          ) : (
            threads.map((t) => (
              <button
                key={t.partner_id}
                onClick={() => openChatForPartner(t.partner_id, t.partner_name)}
                className="w-full text-left p-2 rounded-lg mb-1 cursor-pointer hover:bg-green-50 border border-transparent hover:border-green-200"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm truncate">
                    {t.partner_name}
                  </span>
                  {t.unread_count > 0 && (
                    <span className="text-[10px] text-white bg-red-500 rounded-full px-1.5 py-0.5 flex items-center gap-1 font-medium">
                      <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                      {t.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-xs text-gray-600 truncate max-w-[180px]">
                    {t.last_message || "No messages yet"}
                  </p>
                  <p className="text-[10px] text-gray-400 text-right flex-shrink-0 ml-2">
                    {t.last_message_time
                      ? new Date(t.last_message_time).toLocaleString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 📱 Mobile full-screen chat view (slide-in animation) */}
      <div
        className={`fixed inset-0 bg-white z-[400] flex flex-col transition-transform duration-300 ease-in-out ${
          mobileChat ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        {mobileChat && (
          <>
            <div className="flex items-center justify-between p-3 bg-green-600 text-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileChat(null)}
                  className="p-1 rounded hover:bg-green-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-sm">
                  {mobileChat.name}
                </span>
              </div>
            </div>

            <Chat
              partnerId={mobileChat.id}
              index={0}
              onClose={() => setMobileChat(null)}
              inboxOpen={false}
            />
          </>
        )}
      </div>

        {/* 🔔 Floating button (always visible bottom-right of screen) */}
        {!isInboxOpen && !mobileChat && (
        <button
            onClick={() => setIsInboxOpen(true)}
            className="!fixed !bottom-6 !right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out z-[9999]"
            style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 300,
            }}
        >
            <MessageCircle className="w-6 h-6" />
            {unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                {unreadTotal > 9 ? "9+" : unreadTotal}
            </span>
            )}
        </button>
        )}



      {/* ➕ New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[600]">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg text-green-700">
                Start a New Chat
              </h2>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:ring-1 focus:ring-green-500"
            />

            <div className="max-h-60 overflow-y-auto divide-y">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-3 text-sm">
                  No users found.
                </p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      openChatForPartner(u.id, u.full_name);
                      setShowNewChat(false);
                      setIsInboxOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm text-gray-800"
                  >
                    {u.full_name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
