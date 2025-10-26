import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { notifySuccess, notifyError } from "../../utils/notify";
import { Loader2, MessageSquare, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function Inbox() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🌿 Load all available users
  useEffect(() => {
    const loadUsers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .neq("id", user.id);

      if (error) notifyError(error.message);
      else setUsers(data || []);
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  // 🧠 Load current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  // 📨 Fetch all threads
  const fetchThreads = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_message_threads", {
        current_user_id: userId,
      });
      if (error) throw error;
      setThreads(data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load messages";
      notifyError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 🔄 Realtime updates
  useEffect(() => {
    if (!userId) return;
    fetchThreads();

    const channel = supabase
      .channel("inbox-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as {
            sender_id: string;
            receiver_id: string;
          };

          // Update if the current user is involved
          if (msg.sender_id === userId || msg.receiver_id === userId) {
            fetchThreads();

            // 🔔 Notify if new message received (not sent)
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
  }, [userId, fetchThreads]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading messages...
      </div>
    );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Messages
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-md transition"
        >
          + New Chat
        </button>
      </div>

      {threads.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <div
              key={t.partner_id}
              onClick={() => {
                const base = window.location.pathname.includes("admin-dashboard")
                  ? "/admin-dashboard/messaging/chat"
                  : "/employee-dashboard/messaging/chat";
                navigate(`${base}/${t.partner_id}`);
              }}
              className="flex items-center justify-between border p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition"
            >
              <div>
                <p className="font-semibold">{t.partner_name}</p>
                <p className="text-sm text-gray-600 truncate max-w-[240px]">
                  {t.last_message || "No messages yet"}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-xs text-gray-400">
                  {t.last_message_time
                    ? new Date(t.last_message_time).toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </p>
                {t.unread_count > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <Circle className="w-2 h-2 fill-red-500" />
                    {t.unread_count}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✉️ New Chat Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg text-green-700">
                Start a New Chat
              </h2>
              <button
                onClick={() => setShowModal(false)}
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
                      const base = window.location.pathname.includes(
                        "admin-dashboard"
                      )
                        ? "/admin-dashboard/messaging/chat"
                        : "/employee-dashboard/messaging/chat";
                      navigate(`${base}/${u.id}`);
                      setShowModal(false);
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
    </div>
  );
}
