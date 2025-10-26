import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { notifySuccess, notifyError } from "../utils/notify";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useMessages(currentUserId: string, activeChatUserId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

 // 📨 Fetch conversation
    const fetchMessages = useCallback(async () => {
    if (!activeChatUserId || !currentUserId) return; // ✅ both required

    setLoading(true);
    const query = `
        and(sender_id.eq.${currentUserId},receiver_id.eq.${activeChatUserId}),
        and(sender_id.eq.${activeChatUserId},receiver_id.eq.${currentUserId})
    `.replace(/\s+/g, ""); // removes newlines/spaces for Supabase parser

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(query)
        .order("created_at", { ascending: true });

    if (error) notifyError(error.message);
    else setMessages(data || []);
    setLoading(false);
    }, [currentUserId, activeChatUserId]);

    // ⏳ Run once both IDs exist
    useEffect(() => {
    if (currentUserId && activeChatUserId) {
        fetchMessages();
    }
    }, [currentUserId, activeChatUserId, fetchMessages]);



  // 💬 Send message
  const sendMessage = useCallback(
  async (text: string) => {
    if (!text.trim() || !activeChatUserId) return;

    const messageObj = {
      sender_id: currentUserId,
      receiver_id: activeChatUserId,
      message: text.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
      id: crypto.randomUUID(), // temporary local id
    };

    // 👇 Add immediately for instant UI feedback
    setMessages((prev) => [...prev, messageObj]);

    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: activeChatUserId,
      message: text.trim(),
    });

    if (error) notifyError(error.message);
  },
  [currentUserId, activeChatUserId]
);


  // ✅ Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!activeChatUserId) return;
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("receiver_id", currentUserId)
      .eq("sender_id", activeChatUserId)
      .eq("is_read", false);
  }, [currentUserId, activeChatUserId]);

  // 🔔 Realtime subscription
  useEffect(() => {
    if (!currentUserId || !activeChatUserId) return;

    const channel = supabase
  .channel(`chat-${currentUserId}-${activeChatUserId}`, {
    config: {
      broadcast: { self: true },  // 👈 ensures you receive your own updates
      presence: { key: currentUserId } // optional but good for uniqueness
    }
  })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as Message;

          // Current chat: append directly
          if (
            (msg.sender_id === currentUserId && msg.receiver_id === activeChatUserId) ||
            (msg.sender_id === activeChatUserId && msg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, msg]);
            // Auto mark read if received message
            if (msg.receiver_id === currentUserId) markAsRead();
          } else if (msg.receiver_id === currentUserId) {
            // Not in this chat → show toast
            notifySuccess("📨 New message received!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, activeChatUserId, markAsRead]);

  // ⏳ Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, fetchMessages, sendMessage, markAsRead };
}
