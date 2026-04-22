import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { CalendarItem } from "@/types";

const CALENDAR_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-calendar-items.json");
const CALENDAR_UPSTASH_KEY = "kage-dashboard:calendar-items";

type PersistedCalendarState = {
  calendarItems: CalendarItem[];
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

function assertHostedCalendarAvailable() {
  if (getUpstashConfig()) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error(
      "Hosted calendar storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.",
    );
  }
}

function sortCalendarItems(items: CalendarItem[]) {
  return [...items].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

function ensureCalendarStateShape(payload: Partial<PersistedCalendarState> | null | undefined): PersistedCalendarState {
  return {
    calendarItems: sortCalendarItems(payload?.calendarItems ?? []),
    updatedAt: typeof payload?.updatedAt === "string" && payload.updatedAt.length > 0 ? payload.updatedAt : nowIso(),
  };
}

function markHostedCalendarItem(item: CalendarItem, syncedAt: string): CalendarItem {
  return {
    ...item,
    createdAt: item.createdAt ?? syncedAt,
    updatedAt: syncedAt,
    deletedAt: null,
    lastSyncedAt: syncedAt,
    syncStatus: "synced",
  };
}

async function ensureCalendarFile() {
  await mkdir(dirname(CALENDAR_FILE_PATH), { recursive: true });
}

async function readCalendarFromUpstash(): Promise<PersistedCalendarState | null> {
  const config = getUpstashConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/get/${encodeURIComponent(CALENDAR_UPSTASH_KEY)}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Calendar store read failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: string | null };
  if (!payload.result) {
    return null;
  }

  const parsed = JSON.parse(payload.result) as Partial<PersistedCalendarState>;
  return ensureCalendarStateShape(parsed);
}

async function writeCalendarToUpstash(payload: PersistedCalendarState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  const response = await fetch(`${config.url}/set/${encodeURIComponent(CALENDAR_UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Calendar store write failed with status ${response.status}.`);
  }

  return true;
}

async function readCalendarState() {
  assertHostedCalendarAvailable();

  const upstashState = await readCalendarFromUpstash();
  if (upstashState) {
    return upstashState;
  }

  if (isProductionRuntime()) {
    return ensureCalendarStateShape({ calendarItems: [], updatedAt: nowIso() });
  }

  try {
    await ensureCalendarFile();
    const raw = await readFile(CALENDAR_FILE_PATH, "utf8");
    return ensureCalendarStateShape(JSON.parse(raw) as Partial<PersistedCalendarState>);
  } catch {
    return ensureCalendarStateShape({ calendarItems: [], updatedAt: nowIso() });
  }
}

async function writeCalendarState(payload: PersistedCalendarState) {
  assertHostedCalendarAvailable();
  const normalized = ensureCalendarStateShape(payload);
  const wroteRemote = await writeCalendarToUpstash(normalized).catch(() => false);

  if (wroteRemote) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted calendar storage write failed.");
  }

  await ensureCalendarFile();
  await writeFile(CALENDAR_FILE_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

export async function listHostedCalendarItems() {
  const state = await readCalendarState();
  return {
    calendarItems: state.calendarItems,
    canonicalUpdatedAt: state.updatedAt,
  };
}

export async function upsertHostedCalendarItem(item: CalendarItem) {
  const current = await readCalendarState();
  const syncedAt = nowIso();
  const nextItem = markHostedCalendarItem(item, syncedAt);
  const existingIndex = current.calendarItems.findIndex((entry) => entry.id === item.id);
  const nextItems = [...current.calendarItems];

  if (existingIndex === -1) {
    nextItems.push(nextItem);
  } else {
    nextItems[existingIndex] = nextItem;
  }

  const nextState = ensureCalendarStateShape({
    calendarItems: nextItems,
    updatedAt: syncedAt,
  });

  await writeCalendarState(nextState);

  return {
    calendarItem: nextItem,
    calendarItems: nextState.calendarItems,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}

export async function deleteHostedCalendarItem(id: string) {
  const current = await readCalendarState();
  const syncedAt = nowIso();

  const nextState = ensureCalendarStateShape({
    calendarItems: current.calendarItems.filter((item) => item.id !== id),
    updatedAt: syncedAt,
  });

  await writeCalendarState(nextState);

  return {
    calendarItems: nextState.calendarItems,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}
