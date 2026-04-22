import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { ContentItem } from "@/types";

const CONTENT_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-content-items.json");
const CONTENT_UPSTASH_KEY = "kage-dashboard:content-items";

type PersistedContentState = {
  contentItems: ContentItem[];
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

function assertHostedContentAvailable() {
  if (getUpstashConfig()) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error(
      "Hosted content storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.",
    );
  }
}

function sortContentItems(items: ContentItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.scheduleDate ? new Date(a.scheduleDate).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.scheduleDate ? new Date(b.scheduleDate).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
}

function ensureContentStateShape(payload: Partial<PersistedContentState> | null | undefined): PersistedContentState {
  return {
    contentItems: sortContentItems(payload?.contentItems ?? []),
    updatedAt: typeof payload?.updatedAt === "string" && payload.updatedAt.length > 0 ? payload.updatedAt : nowIso(),
  };
}

function markHostedContentItem(item: ContentItem, syncedAt: string): ContentItem {
  return {
    ...item,
    createdAt: item.createdAt ?? syncedAt,
    updatedAt: syncedAt,
    deletedAt: null,
    lastSyncedAt: syncedAt,
    syncStatus: "synced",
  };
}

async function ensureContentFile() {
  await mkdir(dirname(CONTENT_FILE_PATH), { recursive: true });
}

async function readContentFromUpstash(): Promise<PersistedContentState | null> {
  const config = getUpstashConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/get/${encodeURIComponent(CONTENT_UPSTASH_KEY)}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Content store read failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: string | null };
  if (!payload.result) {
    return null;
  }

  const parsed = JSON.parse(payload.result) as Partial<PersistedContentState>;
  return ensureContentStateShape(parsed);
}

async function writeContentToUpstash(payload: PersistedContentState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  const response = await fetch(`${config.url}/set/${encodeURIComponent(CONTENT_UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Content store write failed with status ${response.status}.`);
  }

  return true;
}

async function readContentState() {
  assertHostedContentAvailable();

  const upstashState = await readContentFromUpstash();
  if (upstashState) {
    return upstashState;
  }

  if (isProductionRuntime()) {
    return ensureContentStateShape({ contentItems: [], updatedAt: nowIso() });
  }

  try {
    await ensureContentFile();
    const raw = await readFile(CONTENT_FILE_PATH, "utf8");
    return ensureContentStateShape(JSON.parse(raw) as Partial<PersistedContentState>);
  } catch {
    return ensureContentStateShape({ contentItems: [], updatedAt: nowIso() });
  }
}

async function writeContentState(payload: PersistedContentState) {
  assertHostedContentAvailable();
  const normalized = ensureContentStateShape(payload);
  const wroteRemote = await writeContentToUpstash(normalized).catch(() => false);

  if (wroteRemote) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted content storage write failed.");
  }

  await ensureContentFile();
  await writeFile(CONTENT_FILE_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

export async function listHostedContentItems() {
  const state = await readContentState();
  return {
    contentItems: state.contentItems,
    canonicalUpdatedAt: state.updatedAt,
  };
}

export async function upsertHostedContentItem(item: ContentItem) {
  const current = await readContentState();
  const syncedAt = nowIso();
  const nextItem = markHostedContentItem(item, syncedAt);
  const existingIndex = current.contentItems.findIndex((entry) => entry.id === item.id);
  const nextItems = [...current.contentItems];

  if (existingIndex === -1) {
    nextItems.push(nextItem);
  } else {
    nextItems[existingIndex] = nextItem;
  }

  const nextState = ensureContentStateShape({
    contentItems: nextItems,
    updatedAt: syncedAt,
  });

  await writeContentState(nextState);

  return {
    contentItem: nextItem,
    contentItems: nextState.contentItems,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}

export async function deleteHostedContentItem(id: string) {
  const current = await readContentState();
  const syncedAt = nowIso();

  const nextState = ensureContentStateShape({
    contentItems: current.contentItems.filter((item) => item.id !== id),
    updatedAt: syncedAt,
  });

  await writeContentState(nextState);

  return {
    contentItems: nextState.contentItems,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}
