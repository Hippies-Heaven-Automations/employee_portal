import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { notifySuccess } from "../utils/notify";

export function useUnreadMessages() {
  const [count, setCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);

  // 🌿 Get current user once
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  // 📦 Fetch unread count
  const fetchUnread = useCallback(async () => {
    if (!userId) return;
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("is_read", false);

    if (!error && typeof count === "number") {
      setCount(count);
    }
  }, [userId]);

  // 🔔 Real-time listener (insert + update)
  useEffect(() => {
    if (!userId) return;

    // Fetch initial count once
    fetchUnread();

   const channel = supabase
  .channel(`unread-tracker-${userId}`, {
    config: {
      broadcast: { self: true },     // 👈 allows this client to receive its own updates
      presence: { key: userId }      // optional, helps Supabase keep session unique
    }
  })
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    (payload) => {
      const msg = payload.new;
      if (msg.receiver_id === userId && msg.is_read === false) {
        setCount((c) => c + 1);
        notifySuccess("📨 New message received!");
      }
    }
  )
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "messages" },
    (payload) => {
      const oldMsg = payload.old;
      const newMsg = payload.new;

      if (newMsg.receiver_id === userId) {
        if (oldMsg.is_read === false && newMsg.is_read === true) {
          setCount((c) => Math.max(c - 1, 0));
        } else if (oldMsg.is_read === true && newMsg.is_read === false) {
          setCount((c) => c + 1);
        }
      }
    }
  )
  .subscribe((status) => {
    if (status === "SUBSCRIBED") console.log("🔗 realtime unread tracker active");
  });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchUnread]);

  return { count, refresh: fetchUnread };
}
