import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Loader2,
  Plus,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
} from "lucide-react";
import { notifySuccess, notifyError } from "../../utils/notify";
import { Link } from "react-router-dom";

interface Task {
  task_id: string; // ✅ Fix: use task_id from view
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed" | "On Hold";
  progress: number;
  due_date: string | null;
  created_at: string;
}


interface Employee {
  id: string;
  full_name: string;
  employee_type: string;
}

function showSupabaseError(err: unknown) {
  const msg =
    err && typeof err === "object" && "message" in err
      ? (err as { message: string }).message
      : String(err);
  notifyError(msg);
}

export default function TaskManager() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assigned_to: "",
    due_date: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTasks();
    loadEmployees();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("task_summary")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      showSupabaseError(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployees() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, employee_type")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      showSupabaseError(err);
    }
  }

  async function handleCreateTask() {
    if (!newTask.title.trim()) return notifyError("Title is required");
    try {
      setCreating(true);
      const { error } = await supabase.from("tasks").insert([
        {
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
          assigned_to: newTask.assigned_to || null,
          due_date: newTask.due_date || null,
        },
      ]);
      if (error) throw error;

      notifySuccess("Task created successfully!");
      setNewTask({
        title: "",
        description: "",
        priority: "Medium",
        assigned_to: "",
        due_date: "",
      });
      await loadTasks();
    } catch (err) {
      showSupabaseError(err);
    } finally {
      setCreating(false);
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === "All") return true;
    return t.status === filter;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2 mb-5 text-gray-800">
        <ClipboardList className="w-6 h-6 text-green-600" />
        Task Manager
      </h1>

      {/* ➕ Create New Task */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <h2 className="font-medium mb-4 text-gray-700">Create New Task</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="p-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <select
            className="p-2 rounded border border-gray-300 text-gray-700"
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <select
            className="p-2 rounded border border-gray-300 text-gray-700"
            value={newTask.assigned_to}
            onChange={(e) =>
              setNewTask({ ...newTask, assigned_to: e.target.value })
            }
          >
            <option value="">Assign to...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_type})
              </option>
            ))}
          </select>
          <input
            type="date"
            className="p-2 rounded border border-gray-300 text-gray-700"
            value={newTask.due_date}
            onChange={(e) =>
              setNewTask({ ...newTask, due_date: e.target.value })
            }
          />
          <textarea
            rows={2}
            className="p-2 rounded border border-gray-300 text-gray-700 md:col-span-2"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
        </div>
        <button
          onClick={handleCreateTask}
          disabled={creating}
          className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Create Task
        </button>
      </div>

      {/* 🔍 Filter Buttons */}
      <div className="flex gap-3 mb-5">
        {["All", "Pending", "In Progress", "Completed", "On Hold"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              filter === s
                ? "bg-green-600 text-white border-green-600"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 📋 Task List */}
      {loading ? (
        <div className="flex justify-center items-center py-12 text-gray-500">
          <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">No tasks found.</p>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((t) => (
            <div
                key={t.task_id}
              className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                   <Link
                        to={`/admin-dashboard/tasks/${t.task_id}`}
                        className="text-green-600 hover:underline"
                        >
                        {t.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <User className="inline w-4 h-4 mr-1 text-gray-500" />
                    {t.assigned_name || "Unassigned"}{" "}
                    <Calendar className="inline w-4 h-4 ml-3 mr-1 text-gray-500" />
                    {t.due_date || "No due date"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    t.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : t.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : t.status === "Pending"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {t.status}
                </span>
              </div>

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

              {expanded === t.task_id && (
                <div className="mt-3 text-sm text-gray-600">
                  {t.description || "No description provided."}
                </div>
              )}

              <button
                className="mt-2 text-green-600 flex items-center gap-1 text-sm"
                onClick={() => setExpanded(expanded === t.task_id ? null : t.task_id)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
