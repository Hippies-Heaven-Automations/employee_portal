import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  Calendar,
} from "lucide-react";
import { notifyError, notifySuccess } from "../../utils/notify";

interface Task {
  task_id: string;
  title: string;
  description: string | null;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed" | "On Hold";
  progress: number;
  due_date: string | null;
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
  created_at: string;
}

function showSupabaseError(err: unknown) {
  const msg =
    err && typeof err === "object" && "message" in err
      ? (err as { message: string }).message
      : String(err);
  notifyError(msg);
}

export default function EmpTasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subitems, setSubitems] = useState<Record<string, Subitem[]>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [saving, setSaving] = useState(false);

  // 🧩 Load tasks for current employee
  useEffect(() => {
    loadMyTasks();
  }, []);

  async function loadMyTasks() {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return;

      const { data, error } = await supabase
        .from("task_summary")
        .select("*")
        .eq("assigned_to", uid)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      showSupabaseError(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSubitems(taskId: string) {
    try {
      const { data, error } = await supabase
        .from("task_subitems")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setSubitems((prev) => ({ ...prev, [taskId]: data || [] }));
    } catch (err) {
      showSupabaseError(err);
    }
  }

  async function loadComments(taskId: string) {
    try {
      const { data, error } = await supabase
        .from("task_comments")
        .select("id, content, commenter_id, created_at")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setComments((prev) => ({ ...prev, [taskId]: data || [] }));
    } catch (err) {
      showSupabaseError(err);
    }
  }

  async function toggleSubitem(taskId: string, item: Subitem) {
    try {
      const { error } = await supabase
        .from("task_subitems")
        .update({ completed: !item.completed })
        .eq("id", item.id);
      if (error) throw error;
      await loadSubitems(taskId);
      await loadMyTasks();
    } catch (err) {
      showSupabaseError(err);
    }
  }

  async function updateStatus(taskId: string | undefined, status: Task["status"]) {
    if (!taskId) return notifyError("Invalid task ID");
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId);
      if (error) throw error;
      notifySuccess(`Status updated to ${status}`);
      await loadMyTasks();
    } catch (err) {
      showSupabaseError(err);
    }
  }

  async function addComment(taskId: string, content: string) {
    if (!content.trim()) return notifyError("Comment cannot be empty");
    try {
      setSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      const { error } = await supabase.from("task_comments").insert([
        {
          task_id: taskId,
          content,
          commenter_id: uid,
        },
      ]);
      if (error) throw error;
      notifySuccess("Comment posted!");
      await loadComments(taskId);
    } catch (err) {
      showSupabaseError(err);
    } finally {
      setSaving(false);
    }
  }

  async function toggleExpand(taskId: string) {
    if (expanded === taskId) {
      setExpanded(null);
    } else {
      setExpanded(taskId);
      await loadSubitems(taskId);
      await loadComments(taskId);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading tasks...
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2 mb-5 text-gray-800">
        <CheckCircle className="w-6 h-6 text-green-600" /> My Tasks
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center">No assigned tasks.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((t) => (
            <div
              key={t.task_id}
              className="border border-gray-200 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t.title}
                  </h3>
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {t.due_date
                      ? new Date(t.due_date).toLocaleDateString()
                      : "No due date"}
                    <Clock className="w-4 h-4 ml-3 text-gray-500" />
                    {t.status}
                  </p>
                </div>
                <select
                  className="bg-white border border-gray-300 text-gray-700 rounded p-1 text-sm"
                  value={t.status}
                  onChange={(e) =>
                    updateStatus(t.task_id, e.target.value as Task["status"])
                  }
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                </select>
              </div>

              {/* Progress */}
              <div className="mt-3 flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      t.progress >= 100
                        ? "bg-green-600"
                        : t.progress > 0
                        ? "bg-blue-500"
                        : "bg-gray-400"
                    }`}
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{t.progress}%</span>
              </div>

              {/* Expand */}
              <button
                className="mt-2 text-green-600 flex items-center gap-1 text-sm"
                onClick={() => toggleExpand(t.task_id)}
              >
                {expanded === t.task_id ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> View details
                  </>
                )}
              </button>

              {expanded === t.task_id && (
                <div className="mt-4 space-y-5">
                  {/* Subtasks */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Subtasks
                    </h4>
                    {subitems[t.task_id]?.length ? (
                      <ul className="space-y-1">
                        {subitems[t.task_id].map((s) => (
                          <li
                            key={s.id}
                            className={`p-2 rounded flex justify-between ${
                              s.completed
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            <span>{s.title}</span>
                            <button
                              onClick={() => toggleSubitem(t.task_id, s)}
                              className="text-xs px-2 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700"
                            >
                              {s.completed ? "Undo" : "Done"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No subtasks yet.</p>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-600" /> Comments
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {comments[t.task_id]?.length ? (
                        comments[t.task_id].map((c) => (
                          <div
                            key={c.id}
                            className="bg-gray-50 border border-gray-200 p-2 rounded text-sm text-gray-700"
                          >
                            {c.content}
                            <div className="text-xs text-gray-500">
                              {new Date(c.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No comments yet.</p>
                      )}
                    </div>
                    <form
                      className="flex gap-2 mt-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem(
                          "comment"
                        ) as HTMLInputElement;
                        addComment(t.task_id, input.value);
                        input.value = "";
                      }}
                    >
                      <input
                        name="comment"
                        className="flex-1 border border-gray-300 rounded p-2 text-gray-800 text-sm"
                        placeholder="Write a comment..."
                      />
                      <button
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 rounded text-sm"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Send"
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
