import { TaskItem } from "@/types";
import { readCanonicalState, writeCanonicalState } from "@/server/dashboard-sync-store";

function nowIso() {
  return new Date().toISOString();
}

function sortTasks(tasks: TaskItem[]) {
  return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

function markHostedTask(task: TaskItem, syncedAt: string): TaskItem {
  return {
    ...task,
    createdAt: task.createdAt ?? syncedAt,
    updatedAt: task.updatedAt ?? syncedAt,
    deletedAt: null,
    lastSyncedAt: syncedAt,
    syncStatus: "synced",
  };
}

export async function listHostedTasks() {
  const canonical = await readCanonicalState();
  return {
    tasks: sortTasks(canonical.state.tasks.filter((task) => !task.deletedAt)),
    canonicalUpdatedAt: canonical.updatedAt,
  };
}

export async function upsertHostedTask(task: TaskItem) {
  const canonical = await readCanonicalState();
  const syncedAt = nowIso();
  const nextTask = markHostedTask(
    {
      ...task,
      updatedAt: syncedAt,
      createdAt: task.createdAt ?? syncedAt,
      deviceUpdatedAt: task.deviceUpdatedAt,
    },
    syncedAt,
  );

  const existingIndex = canonical.state.tasks.findIndex((entry) => entry.id === task.id);
  const nextTasks = [...canonical.state.tasks];

  if (existingIndex === -1) {
    nextTasks.push(nextTask);
  } else {
    nextTasks[existingIndex] = nextTask;
  }

  const nextCanonical = {
    ...canonical,
    state: {
      ...canonical.state,
      tasks: sortTasks(nextTasks.filter((entry) => !entry.deletedAt)),
    },
    updatedAt: syncedAt,
  };

  await writeCanonicalState(nextCanonical);

  return {
    task: nextTask,
    tasks: nextCanonical.state.tasks,
    canonicalUpdatedAt: nextCanonical.updatedAt,
  };
}

export async function deleteHostedTask(id: string) {
  const canonical = await readCanonicalState();
  const syncedAt = nowIso();
  const nextCanonical = {
    ...canonical,
    state: {
      ...canonical.state,
      tasks: sortTasks(canonical.state.tasks.filter((task) => task.id !== id)),
    },
    updatedAt: syncedAt,
  };

  await writeCanonicalState(nextCanonical);

  return {
    tasks: nextCanonical.state.tasks,
    canonicalUpdatedAt: nextCanonical.updatedAt,
  };
}
