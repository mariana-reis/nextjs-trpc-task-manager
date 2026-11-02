import { randomUUID } from "node:crypto";
import type { Task, TaskFields } from "@/types/task";

export type ListTasksParams = { limit: number; cursor?: number | null };

export function createTaskStore(initialTasks: Task[] = []) {
  const tasks = [...initialTasks];
  let lastTimestamp = Math.max(0, ...tasks.map((task) => task.createdAt));

  // Because the pagination cursor relies on createdAt, we ensure timestamps are strictly
  // monotonic even if multiple tasks are created in the exact same millisecond.
  function nextTimestamp() {
    lastTimestamp = Math.max(Date.now(), lastTimestamp + 1);
    return lastTimestamp;
  }

  return {
    list({ limit, cursor }: ListTasksParams) {
      // Always sort newest first for consistent chronological display
      const newestFirst = [...tasks].reverse();
      const remaining =
        cursor == null
          ? newestFirst
          : newestFirst.filter((task) => task.createdAt < cursor);
      const items = remaining.slice(0, limit);
      const nextCursor =
        remaining.length > limit
          ? items[items.length - 1]?.createdAt
          : undefined;
      return { items, nextCursor };
    },

    get(id: string): Task | undefined {
      return tasks.find((task) => task.id === id);
    },

    create(fields: TaskFields): Task {
      const task: Task = {
        id: randomUUID(),
        createdAt: nextTimestamp(),
        ...fields,
      };
      tasks.push(task);
      return task;
    },

    update(id: string, fields: TaskFields): Task | undefined {
      const index = tasks.findIndex((task) => task.id === id);
      const current = tasks[index];
      if (!current) return undefined;
      const updated: Task = {
        id: current.id,
        createdAt: current.createdAt,
        ...fields,
      };
      tasks[index] = updated;
      return updated;
    },

    remove(id: string): boolean {
      const index = tasks.findIndex((task) => task.id === id);
      if (index === -1) return false;
      tasks.splice(index, 1);
      return true;
    },
  };
}

export type TaskStore = ReturnType<typeof createTaskStore>;
