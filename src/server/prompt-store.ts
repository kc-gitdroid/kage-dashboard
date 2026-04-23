import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { PromptItem } from "@/types";

const PROMPTS_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-prompts.json");
const PROMPTS_UPSTASH_KEY = "kage-dashboard:prompts";

type PersistedPromptsState = {
  promptItems: PromptItem[];
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

function assertHostedPromptsAvailable() {
  if (getUpstashConfig()) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error(
      "Hosted prompt storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.",
    );
  }
}

function sortPrompts(items: PromptItem[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function ensurePromptsStateShape(payload: Partial<PersistedPromptsState> | null | undefined): PersistedPromptsState {
  return {
    promptItems: sortPrompts(payload?.promptItems ?? []),
    updatedAt: typeof payload?.updatedAt === "string" && payload.updatedAt.length > 0 ? payload.updatedAt : nowIso(),
  };
}

function markHostedPrompt(promptItem: PromptItem, syncedAt: string): PromptItem {
  return {
    ...promptItem,
    createdAt: promptItem.createdAt ?? syncedAt,
    updatedAt: syncedAt,
    deletedAt: null,
    lastSyncedAt: syncedAt,
    syncStatus: "synced",
  };
}

async function ensurePromptsFile() {
  await mkdir(dirname(PROMPTS_FILE_PATH), { recursive: true });
}

async function readPromptsFromUpstash(): Promise<PersistedPromptsState | null> {
  const config = getUpstashConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/get/${encodeURIComponent(PROMPTS_UPSTASH_KEY)}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Prompt store read failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: string | null };
  if (!payload.result) {
    return null;
  }

  const parsed = JSON.parse(payload.result) as Partial<PersistedPromptsState>;
  return ensurePromptsStateShape(parsed);
}

async function writePromptsToUpstash(payload: PersistedPromptsState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  const response = await fetch(`${config.url}/set/${encodeURIComponent(PROMPTS_UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Prompt store write failed with status ${response.status}.`);
  }

  return true;
}

async function readPromptsState() {
  assertHostedPromptsAvailable();

  const upstashState = await readPromptsFromUpstash();
  if (upstashState) {
    return upstashState;
  }

  if (isProductionRuntime()) {
    return ensurePromptsStateShape({ promptItems: [], updatedAt: nowIso() });
  }

  try {
    await ensurePromptsFile();
    const raw = await readFile(PROMPTS_FILE_PATH, "utf8");
    return ensurePromptsStateShape(JSON.parse(raw) as Partial<PersistedPromptsState>);
  } catch {
    return ensurePromptsStateShape({ promptItems: [], updatedAt: nowIso() });
  }
}

async function writePromptsState(payload: PersistedPromptsState) {
  assertHostedPromptsAvailable();
  const normalized = ensurePromptsStateShape(payload);
  const wroteRemote = await writePromptsToUpstash(normalized).catch(() => false);

  if (wroteRemote) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted prompt storage write failed.");
  }

  await ensurePromptsFile();
  await writeFile(PROMPTS_FILE_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

export async function listHostedPrompts() {
  const state = await readPromptsState();
  return {
    promptItems: state.promptItems,
    canonicalUpdatedAt: state.updatedAt,
  };
}

export async function upsertHostedPrompt(promptItem: PromptItem) {
  const current = await readPromptsState();
  const syncedAt = nowIso();
  const nextPrompt = markHostedPrompt(promptItem, syncedAt);
  const existingIndex = current.promptItems.findIndex((entry) => entry.id === promptItem.id);
  const nextPromptItems = [...current.promptItems];

  if (existingIndex === -1) {
    nextPromptItems.push(nextPrompt);
  } else {
    nextPromptItems[existingIndex] = nextPrompt;
  }

  const nextState = ensurePromptsStateShape({
    promptItems: nextPromptItems,
    updatedAt: syncedAt,
  });

  await writePromptsState(nextState);

  return {
    promptItem: nextPrompt,
    promptItems: nextState.promptItems,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}

export async function deleteHostedPrompt(id: string) {
  const current = await readPromptsState();
  const syncedAt = nowIso();

  const nextState = ensurePromptsStateShape({
    promptItems: current.promptItems.filter((promptItem) => promptItem.id !== id),
    updatedAt: syncedAt,
  });

  await writePromptsState(nextState);

  return {
    promptItems: nextState.promptItems,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}
