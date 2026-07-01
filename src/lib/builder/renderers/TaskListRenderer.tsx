/**
 * TaskListRenderer
 *
 * Extracted from appRenderer.tsx for file-size compliance (<800 lines).
 * Renders an interactive task list with toggle and delete actions.
 */

import { useState } from "react";
import { Check, Trash2, CheckCircle2 } from "lucide-react";

interface Task {
  id: number;
  text: string;
  done: boolean;
  priority: string;
}

interface TaskListRendererProps {
  emptyState?: string;
}

export function TaskListRenderer({ emptyState }: TaskListRendererProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Review design mockups", done: false, priority: "high" },
    { id: 2, text: "Update API documentation", done: true, priority: "medium" },
    { id: 3, text: "Fix navigation bug", done: false, priority: "high" },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-400">{emptyState || "No tasks yet"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            task.done ? "bg-gray-50 border-gray-100" : "bg-white border-gray-200"
          }`}
        >
          <button
            onClick={() => toggleTask(task.id)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              task.done
                ? "bg-primary border-primary"
                : "border-gray-300 hover:border-primary"
            }`}
          >
            {task.done && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
          <span
            className={`flex-1 text-sm ${
              task.done ? "text-gray-400 line-through" : "text-gray-700"
            }`}
          >
            {task.text}
          </span>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
