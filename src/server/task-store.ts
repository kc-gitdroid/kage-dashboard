import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { TaskItem } from "@/types";

const TASKS_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-tasks.json");
const TASKS_UPSTASH_KEY = "kage-dashboard:tasks";

type PersistedTasksState = {
  tasks: TaskItem[];
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function logTasksDebug(message: string, details?: Record<string, unknown>) {
  const payload = details ? ` ${JSON.stringify(details)}` : "";
  console.log(`[tasks-api] ${message}${payload}`);
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

function assertHostedTasksAvailable() {
  if (getUpstashConfig()) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error(
      "Hosted task storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.",
    );
  }
}

function sortTasks(tasks: TaskItem[]) {
  return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

function ensureTasksStateShape(payload: Partial<PersistedTasksState> | null | undefined): PersistedTasksState {
  return {
    tasks: sortTasks(payload?.tasks ?? []),
    updatedAt: typeof payload?.updatedAt === "string" && payload.updatedAt.length > 0 ? payload.updatedAt : nowIso(),
  };
}

function markHostedTask(task: TaskItem, syncedAt: string): TaskItem {
  return {
    ...task,
    createdAt: task.createdAt ?? syncedAt,
    updatedAt: syncedAt,
    deletedAt: null,
    lastSyncedAt: syncedAt,
    syncStatus: "synced",
  };
}

async function ensureTasksFile() {
  await mkdir(dirname(TASKS_FILE_PATH), { recursive: true });
}

async function readTasksFromUpstash(): Promise<PersistedTasksState | null> {
  const config = getUpstashConfig();
  if (!config) {
    return null;
  }

  logTasksDebug("storage key used", {
    key: TASKS_UPSTASH_KEY,
    mode: "read",
  });

  const response = await fetch(`${config.url}/get/${encodeURIComponent(TASKS_UPSTASH_KEY)}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Task store read failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: string | null };
  if (!payload.result) {
    return null;
  }

  return ensureTasksStateShape(JSON.parse(payload.result) as Partial<PersistedTasksState>);
}

async function writeTasksToUpstash(payload: PersistedTasksState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  logTasksDebug("storage key used", {
    key: TASKS_UPSTASH_KEY,
    mode: "write",
  });

  const response = await fetch(`${config.url}/set/${encodeURIComponent(TASKS_UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(JSON.stringify(payload)),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Task store write failed with status ${response.status}.`);
  }

  return true;
}

async function readTasksState() {
  assertHostedTasksAvailable();

  const upstashState = await readTasksFromUpstash();
  if (upstashState) {
    return upstashState;
  }

  if (isProductionRuntime()) {
    return ensureTasksStateShape({ tasks: [], updatedAt: nowIso() });
  }

  try {
    await ensureTasksFile();
    const raw = await readFile(TASKS_FILE_PATH, "utf8");
    return ensureTasksStateShape(JSON.parse(raw) as Partial<PersistedTasksState>);
  } catch {
    return ensureTasksStateShape({ tasks: [], updatedAt: nowIso() });
  }
}

async function writeTasksState(payload: PersistedTasksState) {
  assertHostedTasksAvailable();
  const normalized = ensureTasksStateShape(payload);
  const wroteRemote = await writeTasksToUpstash(normalized).catch(() => false);

  if (wroteRemote) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted task storage write failed.");
  }

  await ensureTasksFile();
  await writeFile(TASKS_FILE_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

export async function listHostedTasks() {
  const state = await readTasksState();
  logTasksDebug("task list returned", {
    key: TASKS_UPSTASH_KEY,
    count: state.tasks.length,
    canonicalUpdatedAt: state.updatedAt,
  });

  return {
    tasks: state.tasks,
    canonicalUpdatedAt: state.updatedAt,
  };
}

export async function upsertHostedTask(task: TaskItem) {
  const current = await readTasksState();
  const syncedAt = nowIso();
  const nextTask = markHostedTask(task, syncedAt);
  const existingIndex = current.tasks.findIndex((entry) => entry.id === task.id);
  const nextTasks = [...current.tasks];

  logTasksDebug("count before write", {
    key: TASKS_UPSTASH_KEY,
    count: current.tasks.length,
    taskId: task.id,
  });

  if (existingIndex === -1) {
    nextTasks.push(nextTask);
  } else {
    nextTasks[existingIndex] = nextTask;
  }

  const nextState = ensureTasksStateShape({
    tasks: nextTasks,
    updatedAt: syncedAt,
  });

  await writeTasksState(nextState);

  logTasksDebug("count after write", {
    key: TASKS_UPSTASH_KEY,
    count: nextState.tasks.length,
    taskId: task.id,
  });

  const readback = await readTasksState();
  logTasksDebug("count on readback verification", {
    key: TASKS_UPSTASH_KEY,
    count: readback.tasks.length,
    taskId: task.id,
  });

  return {
    task: nextTask,
    tasks: readback.tasks,
    canonicalUpdatedAt: readback.updatedAt,
  };
}

export async function deleteHostedTask(id: string) {
  const current = await readTasksState();
  const syncedAt = nowIso();

  logTasksDebug("count before write", {
    key: TASKS_UPSTASH_KEY,
    count: current.tasks.length,
    taskId: id,
  });

  const nextState = ensureTasksStateShape({
    tasks: current.tasks.filter((task) => task.id !== id),
    updatedAt: syncedAt,
  });

  await writeTasksState(nextState);

  logTasksDebug("count after write", {
    key: TASKS_UPSTASH_KEY,
    count: nextState.tasks.length,
    taskId: id,
  });

  const readback = await readTasksState();
  logTasksDebug("count on readback verification", {
    key: TASKS_UPSTASH_KEY,
    count: readback.tasks.length,
    taskId: id,
  });

  return {
    tasks: readback.tasks,
    canonicalUpdatedAt: readback.updatedAt,
  };
}
