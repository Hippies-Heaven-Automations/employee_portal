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
    if (!activeChatUserId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${activeChatUserId}),and(sender_id.eq.${activeChatUserId},receiver_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true });
    if (error) notifyError(error.message);
    else setMessages(data || []);
    setLoading(false);
  }, [currentUserId, activeChatUserId]);

  // 💬 Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !activeChatUserId) return;
    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: activeChatUserId,
      message: text.trim(),
    });
    if (error) notifyError(error.message);
  }, [currentUserId, activeChatUserId]);

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
    const channel = supabase
      .channel("realtime-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            msg.receiver_id === currentUserId &&
            msg.sender_id === activeChatUserId
          ) {
            // inside open chat
            setMessages((prev) => [...prev, msg]);
            markAsRead(); // auto mark
          } else if (
            msg.receiver_id === currentUserId &&
            msg.sender_id !== activeChatUserId
          ) {
            // outside open chat → toast
            notifySuccess("📨 New message received!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, activeChatUserId, markAsRead]);

  return { messages, loading, fetchMessages, sendMessage, markAsRead };
}
