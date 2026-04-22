import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { NoteItem } from "@/types";

const NOTES_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-notes.json");
const NOTES_UPSTASH_KEY = "kage-dashboard:notes";

type PersistedNotesState = {
  notes: NoteItem[];
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function logNotesDebug(message: string, details?: Record<string, unknown>) {
  const payload = details ? ` ${JSON.stringify(details)}` : "";
  console.log(`[notes-api] ${message}${payload}`);
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

function assertHostedNotesAvailable() {
  if (getUpstashConfig()) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error(
      "Hosted note storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.",
    );
  }
}

function sortNotes(notes: NoteItem[]) {
  return [...notes].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}

function ensureNotesStateShape(payload: Partial<PersistedNotesState> | null | undefined): PersistedNotesState {
  return {
    notes: sortNotes(payload?.notes ?? []),
    updatedAt: typeof payload?.updatedAt === "string" && payload.updatedAt.length > 0 ? payload.updatedAt : nowIso(),
  };
}

function markHostedNote(note: NoteItem, syncedAt: string): NoteItem {
  return {
    ...note,
    createdAt: note.createdAt ?? syncedAt,
    updatedAt: syncedAt,
    deletedAt: null,
    lastSyncedAt: syncedAt,
    syncStatus: "synced",
  };
}

async function ensureNotesFile() {
  await mkdir(dirname(NOTES_FILE_PATH), { recursive: true });
}

async function readNotesFromUpstash(): Promise<PersistedNotesState | null> {
  const config = getUpstashConfig();
  if (!config) {
    return null;
  }

  logNotesDebug("storage key used", {
    key: NOTES_UPSTASH_KEY,
    mode: "read",
  });

  const response = await fetch(`${config.url}/get/${encodeURIComponent(NOTES_UPSTASH_KEY)}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Note store read failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: string | null };
  if (!payload.result) {
    return null;
  }

  const parsed = JSON.parse(payload.result) as Partial<PersistedNotesState>;
  return ensureNotesStateShape(parsed);
}

async function writeNotesToUpstash(payload: PersistedNotesState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  logNotesDebug("storage key used", {
    key: NOTES_UPSTASH_KEY,
    mode: "write",
  });

  const response = await fetch(`${config.url}/set/${encodeURIComponent(NOTES_UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Note store write failed with status ${response.status}.`);
  }

  return true;
}

async function readNotesState() {
  assertHostedNotesAvailable();

  const upstashState = await readNotesFromUpstash();
  if (upstashState) {
    return upstashState;
  }

  if (isProductionRuntime()) {
    return ensureNotesStateShape({ notes: [], updatedAt: nowIso() });
  }

  try {
    await ensureNotesFile();
    const raw = await readFile(NOTES_FILE_PATH, "utf8");
    return ensureNotesStateShape(JSON.parse(raw) as Partial<PersistedNotesState>);
  } catch {
    return ensureNotesStateShape({ notes: [], updatedAt: nowIso() });
  }
}

async function writeNotesState(payload: PersistedNotesState) {
  assertHostedNotesAvailable();
  const normalized = ensureNotesStateShape(payload);
  const wroteRemote = await writeNotesToUpstash(normalized).catch(() => false);

  if (wroteRemote) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted note storage write failed.");
  }

  await ensureNotesFile();
  await writeFile(NOTES_FILE_PATH, JSON.stringify(normalized, null, 2), "utf8");
}

export async function listHostedNotes() {
  const state = await readNotesState();
  logNotesDebug("note list returned", {
    key: NOTES_UPSTASH_KEY,
    count: state.notes.length,
    canonicalUpdatedAt: state.updatedAt,
  });

  return {
    notes: state.notes,
    canonicalUpdatedAt: state.updatedAt,
  };
}

export async function upsertHostedNote(note: NoteItem) {
  const current = await readNotesState();
  const syncedAt = nowIso();
  const nextNote = markHostedNote(note, syncedAt);
  const existingIndex = current.notes.findIndex((entry) => entry.id === note.id);
  const nextNotes = [...current.notes];

  if (existingIndex === -1) {
    nextNotes.push(nextNote);
  } else {
    nextNotes[existingIndex] = nextNote;
  }

  const nextState = ensureNotesStateShape({
    notes: nextNotes,
    updatedAt: syncedAt,
  });

  await writeNotesState(nextState);

  return {
    note: nextNote,
    notes: nextState.notes,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}

export async function deleteHostedNote(id: string) {
  const current = await readNotesState();
  const syncedAt = nowIso();

  const nextState = ensureNotesStateShape({
    notes: current.notes.filter((note) => note.id !== id),
    updatedAt: syncedAt,
  });

  await writeNotesState(nextState);

  return {
    notes: nextState.notes,
    canonicalUpdatedAt: nextState.updatedAt,
  };
}
