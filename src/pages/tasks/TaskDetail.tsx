import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  Loader2,
  ChevronLeft,
  CheckCircle,
  Plus,
  MessageSquare,
  Clock,
  User,
  Send,
} from "lucide-react";
import { notifyError, notifySuccess } from "../../utils/notify";

// 🧩 Types
interface Task {
  task_id: string;
  title: string;
  description: string | null;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed" | "On Hold";
  progress: number;
  due_date: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
}

interface Subitem {
  id: string;
  title: string;
  completed: boolean;
  created_at?: string;
}

interface Comment {
  id: string;
  content: string;
  commenter_id: string;
  commenter_name?: string;
  created_at: string;
}

// 🧠 Helper
function showSupabaseError(err: unknown) {
  const msg =
    err && typeof err === "object" && "message" in err
      ? (err as { message: string }).message
      : String(err);
  notifyError(msg);
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [subitems, setSubitems] = useState<Subitem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newSubitem, setNewSubitem] = useState("");
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);

  // 📦 Load main task
  const loadTask = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("task_summary")
        .select("*")
        .eq("task_id", id)
        .single();
      if (error) throw error;
      setTask(data);
    } catch (err) {
      showSupabaseError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 📋 Load subtasks
  const loadSubitems = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("task_subitems")
        .select("*")
        .eq("task_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setSubitems(data || []);
    } catch (err) {
      showSupabaseError(err);
    }
  }, [id]);

  // 💬 Load comments
  const loadComments = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("task_comments")
        .select("id, content, commenter_id, created_at, profiles(full_name)")
        .eq("task_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      type RawComment = {
        id: string;
        content: string;
        commenter_id: string;
        created_at: string;
        profiles?: { full_name?: string };
      };

      setComments(
        (data as RawComment[] | null)?.map((c) => ({
          ...c,
          commenter_name: c.profiles?.full_name || "Unknown",
        })) || []
      );
    } catch (err) {
      showSupabaseError(err);
    }
  }, [id]);

  // 🧩 Load data on mount or ID change
  useEffect(() => {
    if (!id) return;
    loadTask();
    loadSubitems();
    loadComments();
  }, [id, loadTask, loadSubitems, loadComments]);

  // ➕ Add Subtask
  const addSubitem = useCallback(async () => {
    if (!id) return notifyError("Invalid task ID");
    if (!newSubitem.trim()) return notifyError("Subtask title is required");

    try {
      setSaving(true);
      const { error } = await supabase.from("task_subitems").insert([
        {
          task_id: id,
          title: newSubitem,
        },
      ]);
      if (error) throw error;
      setNewSubitem("");
      notifySuccess("Subtask added!");
      await loadSubitems();
      await loadTask();
    } catch (err) {
      showSupabaseError(err);
    } finally {
      setSaving(false);
    }
  }, [id, newSubitem, loadSubitems, loadTask]);

  // ✅ Toggle completion
  const toggleSubitem = useCallback(
    async (item: Subitem) => {
      try {
        const { error } = await supabase
          .from("task_subitems")
          .update({ completed: !item.completed })
          .eq("id", item.id);
        if (error) throw error;
        await loadSubitems();
        await loadTask();
      } catch (err) {
        showSupabaseError(err);
      }
    },
    [loadSubitems, loadTask]
  );

  // 💬 Add comment
  const addComment = useCallback(async () => {
    if (!id) return notifyError("Invalid task ID");
    if (!newComment.trim()) return notifyError("Comment cannot be empty");

    try {
      setSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      const { error } = await supabase.from("task_comments").insert([
        {
          task_id: id,
          content: newComment,
          commenter_id: uid,
        },
      ]);
      if (error) throw error;
      setNewComment("");
      await loadComments();
      notifySuccess("Comment posted!");
    } catch (err) {
      showSupabaseError(err);
    } finally {
      setSaving(false);
    }
  }, [id, newComment, loadComments]);

  // 🧠 UI rendering
  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading task...
      </div>
    );

  if (!task)
    return (
      <div className="text-center mt-12 text-gray-500">
        Task not found or access denied.
      </div>
    );

  return (
    <div className="p-6">
      {/* 🔙 Back */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          to="/admin-dashboard/tasks"
          className="text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Tasks
        </Link>
      </div>

      {/* 🧩 Task Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-semibold text-gray-800">
            {task.title}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              task.status === "Completed"
                ? "bg-green-100 text-green-700"
                : task.status === "In Progress"
                ? "bg-blue-100 text-blue-700"
                : task.status === "Pending"
                ? "bg-gray-100 text-gray-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {task.status}
          </span>
        </div>

        <p className="text-gray-600 mb-3">
          {task.description || "No description provided."}
        </p>

        <p className="text-sm text-gray-500 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />{" "}
          {task.assigned_name || "Unassigned"}
          <Clock className="w-4 h-4 ml-3 text-gray-500" />{" "}
          {task.due_date
            ? new Date(task.due_date).toLocaleDateString()
            : "No due date"}
        </p>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                task.progress >= 100
                  ? "bg-green-600"
                  : task.progress > 0
                  ? "bg-blue-500"
                  : "bg-gray-400"
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{task.progress}%</span>
        </div>
      </div>

      {/* ✅ Subtasks */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" /> Subtasks
        </h2>

        {subitems.length === 0 ? (
          <p className="text-gray-500 text-sm">No subtasks yet.</p>
        ) : (
          <ul className="space-y-2">
            {subitems.map((s) => (
              <li
                key={s.id}
                className={`p-2 rounded-md flex justify-between items-center ${
                  s.completed
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <span>{s.title}</span>
                <button
                  onClick={() => toggleSubitem(s)}
                  className="text-xs px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700"
                >
                  {s.completed ? "Done" : "Mark Done"}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 mt-3">
          <input
            className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-800"
            placeholder="Add subtask..."
            value={newSubitem}
            onChange={(e) => setNewSubitem(e.target.value)}
          />
          <button
            onClick={addSubitem}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 💬 Comments */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-green-600" /> Comments
        </h2>

        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="bg-gray-50 border border-gray-200 p-3 rounded-lg"
              >
                <p className="text-sm text-gray-700">{c.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  — {c.commenter_name} •{" "}
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-800"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            onClick={addComment}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
