import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { ProjectItem } from "@/types";

const PROJECTS_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-projects.json");
const PROJECTS_UPSTASH_KEY = "kage-dashboard:projects";

type PersistedProjectsState = {
  projects: ProjectItem[];
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
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

function assertHostedProjectsAvailable() {
  if (getUpstashConfig()) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error(
      "Hosted project storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.",
    );
  }
}

function sortProjects(items: ProjectItem[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.dueDate ?? a.startDate).getTime();
    const bTime = new Date(b.dueDate ?? b.startDate).getTime();
    return aTime - bTime;
  });
}

function ensureProjectsStateShape(payload: Partial<PersistedProjectsState> | null | undefined): PersistedProjectsState {
  return {
    projects: sortProjects(payload?.projects ?? []),
    updatedAt: typeof payload?.updatedAt === "string" && payload.updatedAt.length > 0 ? payload.updatedAt : nowIso(),
  };
}

function markHostedProject(project: ProjectItem, syncedAt: string): ProjectItem {
  return {
    ...project,
    createdAt: project.createdAt ?? syncedAt,
    updatedAt: syncedAt,
    deletedAt: null,
    lastSyncedAt: syncedAt,
    syncStatus: "synced",
  };
}

async function ensureProjectsFile() {
  await mkdir(dirname(PROJECTS_FILE_PATH), { recursive: true });
}

async function readProjectsFromUpstash(): Promise<PersistedProjectsState | null> {
  const config = getUpstashConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/get/${encodeURIComponent(PROJECTS_UPSTASH_KEY)}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Project store read failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: string | null };
  if (!payload.result) {
    return null;
  }

  const parsed = JSON.parse(payload.result) as Partial<PersistedProjectsState>;
  return ensureProjectsStateShape(parsed);
}

async function writeProjectsToUpstash(payload: PersistedProjectsState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  const response = await fetch(`${config.url}/set/${encodeURIComponent(PROJECTS_UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Project store write failed with status ${response.status}.`);
  }

  return true;
}

async function readProjectsState() {
  assertHostedProjectsAvailable();

  const upstashState = await readProjectsFromUpstash();
  if (upstashState) {
    return upstashState;
  }

  if (isProductionRuntime()) {
    return ensureProjectsStateShape({ projects: [], updatedAt: nowIso() });
  }

  try {
    await ensureProjectsFile();
    const raw = await readFile(PROJECTS_FILE_PATH, "utf8");
    return ensureProjectsStateShape(JSON.parse(raw) as Partial<PersistedProjectsState>);
  } catch {
    return ensureProjectsStateShape({ projects: [], updatedAt: nowIso() });
  }
}

async function writeProjectsState(payload: PersistedProjectsState) {
  assertHostedProjectsAvailable();
  const normalized = ensureProjectsStateShape(payload);
  const wroteRemote = await writeProjectsToUpstash(normalized).catch(() => false);

  if (wroteRemote) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted project storage write failed.");
  }

  await ensureProjectsFile();
  await writeFile(PROJECTS_FILE_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

export async function listHostedProjects() {
  const state = await readProjectsState();
  return {
    projects: state.projects,
    canonicalUpdatedAt: state.updatedAt,
  };
}

export async function upsertHostedProject(project: ProjectItem) {
  const current = await readProjectsState();
  const syncedAt = nowIso();
  const nextProject = markHostedProject(project, syncedAt);
  const existingIndex = current.projects.findIndex((entry) => entry.id === project.id);
  const nextProjects = [...current.projects];

  if (existingIndex === -1) {
    nextProjects.push(nextProject);
  } else {
    nextProjects[existingIndex] = nextProject;
  }

  const nextState = ensureProjectsStateShape({
    projects: nextProjects,
    updatedAt: syncedAt,
  });

  await writeProjectsState(nextState);

  return {
    project: nextProject,
    projects: nextState.projects,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}

export async function deleteHostedProject(id: string) {
  const current = await readProjectsState();
  const syncedAt = nowIso();

  const nextState = ensureProjectsStateShape({
    projects: current.projects.filter((project) => project.id !== id),
    updatedAt: syncedAt,
  });

  await writeProjectsState(nextState);

  return {
    projects: nextState.projects,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}
