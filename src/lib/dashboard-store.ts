import {
  Brand,
  BrandSpace,
  CalendarItem,
  ContentItem,
  DashboardState,
  DocumentItem,
  NoteItem,
  ProjectItem,
  PromptItem,
  SyncConflict,
  SyncEntityName,
  SyncOperation,
  SyncResponse,
  SyncableRecord,
  TaskItem,
} from "@/types";
import { createSeedDashboardState } from "@/data/seed";

export const DASHBOARD_DB_NAME = "kage-dashboard-offline";
export const DASHBOARD_DB_VERSION = 1;
const STATE_STORE = "state";
const QUEUE_STORE = "queue";
const META_STORE = "meta";

const STATE_KEY = "dashboard-state";
const QUEUE_KEY = "sync-queue";
const META_KEY = "sync-meta";
const LOCAL_FALLBACK_PREFIX = "kage-dashboard-fallback";
const SYNC_REQUEST_TIMEOUT_MS = 7000;

function summarizeState(state: DashboardState) {
  return {
    brands: state.brands.length,
    brandSpaces: state.brandSpaces.length,
    documents: state.documents.length,
    tasks: state.tasks.length,
    notes: state.notes.length,
    calendarItems: state.calendarItems.length,
    projects: state.projects.length,
    contentItems: state.contentItems.length,
    promptItems: state.promptItems.length,
  };
}

function ensureDashboardStateShape(state: Partial<DashboardState> | null | undefined): DashboardState {
  return {
    brands: state?.brands ?? [],
    brandSpaces: state?.brandSpaces ?? [],
    documents: state?.documents ?? [],
    tasks: state?.tasks ?? [],
    notes: state?.notes ?? [],
    calendarItems: state?.calendarItems ?? [],
    projects: state?.projects ?? [],
    contentItems: state?.contentItems ?? [],
    promptItems: state?.promptItems ?? [],
  };
}

export type PersistedMeta = {
  deviceId: string;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  lastSyncAttemptAt: string | null;
};

type PersistedRecord<T> = {
  key: string;
  value: T;
};

function readLocalFallback<T>(key: string): T | null {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${LOCAL_FALLBACK_PREFIX}.${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocalFallback<T>(key: string, value: T) {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return;
  }

  try {
    window.localStorage.setItem(`${LOCAL_FALLBACK_PREFIX}.${key}`, JSON.stringify(value));
  } catch {
    // Keep app usable even if local fallback storage fails.
  }
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export function createDeviceId() {
  return createId("device");
}

export function isRecordDeleted(record?: SyncableRecord | null) {
  return Boolean(record?.deletedAt);
}

export function visibleRecords<T extends SyncableRecord>(items: T[]) {
  return items.filter((item) => !item.deletedAt);
}

export function sortDashboardState(state: DashboardState): DashboardState {
  const safeState = ensureDashboardStateShape(state);
  return {
    brands: [...safeState.brands],
    brandSpaces: [...safeState.brandSpaces],
    documents: [...safeState.documents].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()),
    tasks: [...safeState.tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    notes: [...safeState.notes].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
    calendarItems: [...safeState.calendarItems].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    projects: [...safeState.projects].sort((a, b) => new Date(a.dueDate ?? a.startDate).getTime() - new Date(b.dueDate ?? b.startDate).getTime()),
    contentItems: [...safeState.contentItems].sort((a, b) => {
      const aTime = a.scheduleDate ? new Date(a.scheduleDate).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.scheduleDate ? new Date(b.scheduleDate).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    }),
    promptItems: [...safeState.promptItems].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  };
}

export function normalizeRecord<T extends SyncableRecord>(record: T, deviceId: string, existing?: T): T {
  const createdAt = existing?.createdAt ?? record.createdAt ?? nowIso();
  const updatedAt = existing
    ? nowIso()
    : record.updatedAt ?? record.createdAt ?? nowIso();
  return {
    ...existing,
    ...record,
    createdAt,
    updatedAt,
    deletedAt: record.deletedAt ?? existing?.deletedAt ?? null,
    lastSyncedAt: existing?.lastSyncedAt ?? record.lastSyncedAt ?? null,
    syncStatus: "pending",
    deviceUpdatedAt: deviceId,
  };
}

export function tombstoneRecord<T extends SyncableRecord>(record: T, deviceId: string): T {
  const deletedAt = nowIso();
  return {
    ...record,
    updatedAt: deletedAt,
    deletedAt,
    syncStatus: "pending",
    deviceUpdatedAt: deviceId,
  };
}

function getRecordTimestamp(record?: SyncableRecord | null) {
  return new Date(record?.deletedAt ?? record?.updatedAt ?? record?.createdAt ?? 0).getTime();
}

export function mergeRecord<T extends SyncableRecord>(current: T | undefined, incoming: T): { record: T; conflict?: SyncConflict } {
  if (!current) {
    return { record: incoming };
  }

  const currentTime = getRecordTimestamp(current);
  const incomingTime = getRecordTimestamp(incoming);

  if (incomingTime >= currentTime) {
    const conflict =
      current.deviceUpdatedAt &&
      incoming.deviceUpdatedAt &&
      current.deviceUpdatedAt !== incoming.deviceUpdatedAt &&
      currentTime !== 0 &&
      incomingTime !== 0
        ? {
            entity: "tasks" as SyncEntityName,
            recordId: incoming.id,
            incomingUpdatedAt: incoming.updatedAt ?? incoming.deletedAt ?? nowIso(),
            canonicalUpdatedAt: current.updatedAt ?? current.deletedAt ?? nowIso(),
            resolution: "incoming-won" as const,
            detectedAt: nowIso(),
          }
        : undefined;

    return { record: incoming, conflict };
  }

  return {
    record: current,
    conflict:
      current.deviceUpdatedAt &&
      incoming.deviceUpdatedAt &&
      current.deviceUpdatedAt !== incoming.deviceUpdatedAt
        ? {
            entity: "tasks" as SyncEntityName,
            recordId: incoming.id,
            incomingUpdatedAt: incoming.updatedAt ?? incoming.deletedAt ?? nowIso(),
            canonicalUpdatedAt: current.updatedAt ?? current.deletedAt ?? nowIso(),
            resolution: "canonical-kept" as const,
            detectedAt: nowIso(),
          }
        : undefined,
  };
}

function upsertById<T extends SyncableRecord>(items: T[], record: T) {
  const index = items.findIndex((item) => item.id === record.id);
  if (index === -1) {
    return [record, ...items];
  }
  return items.map((item) => (item.id === record.id ? record : item));
}

export function updateCollection<T extends SyncableRecord>(
  items: T[],
  record: T,
) {
  return upsertById(items, record);
}

export function createOperation(entity: SyncEntityName, action: "upsert" | "delete", record: SyncableRecord, deviceId: string): SyncOperation {
  return {
    id: createId("op"),
    entity,
    action,
    recordId: record.id,
    payload: record as unknown as Record<string, unknown>,
    enqueuedAt: nowIso(),
    deviceId,
    attemptCount: 0,
  };
}

export function applyOperationToState(state: DashboardState, operation: SyncOperation) {
  const record = operation.payload as SyncableRecord;

  switch (operation.entity) {
    case "brands":
      return sortDashboardState({ ...state, brands: updateCollection(state.brands, record as Brand) });
    case "brandSpaces":
      return sortDashboardState({ ...state, brandSpaces: updateCollection(state.brandSpaces, record as BrandSpace) });
    case "documents":
      return sortDashboardState({ ...state, documents: updateCollection(state.documents, record as DocumentItem) });
    case "tasks":
      return sortDashboardState({ ...state, tasks: updateCollection(state.tasks, record as TaskItem) });
    case "notes":
      return sortDashboardState({ ...state, notes: updateCollection(state.notes, record as NoteItem) });
    case "calendarItems":
      return sortDashboardState({ ...state, calendarItems: updateCollection(state.calendarItems, record as CalendarItem) });
    case "projects":
      return sortDashboardState({ ...state, projects: updateCollection(state.projects, record as ProjectItem) });
    case "contentItems":
      return sortDashboardState({ ...state, contentItems: updateCollection(state.contentItems, record as ContentItem) });
    case "promptItems":
      return sortDashboardState({ ...state, promptItems: updateCollection(state.promptItems, record as PromptItem) });
    default:
      return state;
  }
}

export function mergeDashboardStates(localState: DashboardState, remoteState: DashboardState): DashboardState {
  const safeLocalState = ensureDashboardStateShape(localState);
  const safeRemoteState = ensureDashboardStateShape(remoteState);
  const merged: DashboardState = ensureDashboardStateShape(safeRemoteState);

  (Object.keys(merged) as SyncEntityName[]).forEach((entity) => {
    const localItems = safeLocalState[entity] as SyncableRecord[];
    const remoteItems = safeRemoteState[entity] as SyncableRecord[];
    const next = [...remoteItems];

    localItems.forEach((localRecord) => {
      const remoteIndex = next.findIndex((item) => item.id === localRecord.id);

      if (remoteIndex === -1) {
        if (localRecord.syncStatus === "pending" || !localRecord.lastSyncedAt) {
          next.push(localRecord);
        }
        return;
      }

      const remoteRecord = next[remoteIndex];
      if (localRecord.syncStatus === "pending") {
        const { record } = mergeRecord(remoteRecord, localRecord);
        next[remoteIndex] = record;
      }
    });

    (merged[entity] as SyncableRecord[]) = next;
  });

  return sortDashboardState(merged);
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DASHBOARD_DB_NAME, DASHBOARD_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STATE_STORE)) {
        database.createObjectStore(STATE_STORE, { keyPath: "key" });
      }
      if (!database.objectStoreNames.contains(QUEUE_STORE)) {
        database.createObjectStore(QUEUE_STORE, { keyPath: "key" });
      }
      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readFromStore<T>(database: IDBDatabase, storeName: string, key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve((request.result as PersistedRecord<T> | undefined)?.value ?? null);
    request.onerror = () => reject(request.error);
  });
}

function writeToStore<T>(database: IDBDatabase, storeName: string, key: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.put({ key, value });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function loadPersistedStore() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!("indexedDB" in window)) {
    return {
      state: readLocalFallback<DashboardState>(STATE_KEY),
      queue: readLocalFallback<SyncOperation[]>(QUEUE_KEY) ?? [],
      meta: readLocalFallback<PersistedMeta>(META_KEY),
    };
  }

  try {
    const database = await openDatabase();
    const [state, queue, meta] = await Promise.all([
      readFromStore<DashboardState>(database, STATE_STORE, STATE_KEY),
      readFromStore<SyncOperation[]>(database, QUEUE_STORE, QUEUE_KEY),
      readFromStore<PersistedMeta>(database, META_STORE, META_KEY),
    ]);

    return {
      state,
      queue: queue ?? [],
      meta,
    };
  } catch {
    return {
      state: readLocalFallback<DashboardState>(STATE_KEY),
      queue: readLocalFallback<SyncOperation[]>(QUEUE_KEY) ?? [],
      meta: readLocalFallback<PersistedMeta>(META_KEY),
    };
  };
}

export async function persistStore(state: DashboardState, queue: SyncOperation[], meta: PersistedMeta) {
  if (typeof window === "undefined") {
    return;
  }

  const sortedState = sortDashboardState(state);

  writeLocalFallback(STATE_KEY, sortedState);
  writeLocalFallback(QUEUE_KEY, queue);
  writeLocalFallback(META_KEY, meta);

  if (!("indexedDB" in window)) {
    return;
  }

  try {
    const database = await openDatabase();
    await Promise.all([
      writeToStore(database, STATE_STORE, STATE_KEY, sortedState),
      writeToStore(database, QUEUE_STORE, QUEUE_KEY, queue),
      writeToStore(database, META_STORE, META_KEY, meta),
    ]);
  } catch {
    // Local fallback already has the latest state.
  }
}

export async function syncWithServer(
  state: DashboardState,
  queue: SyncOperation[],
  meta: PersistedMeta,
): Promise<SyncResponse> {
  console.log("[sync-client] outgoing sync request", {
    outgoingMutationCount: queue.length,
    lastSyncedAt: meta.lastSyncedAt,
    stateSummary: summarizeState(state),
  });

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SYNC_REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch("/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId: meta.deviceId,
        operations: queue,
        state,
        lastSyncedAt: meta.lastSyncedAt,
        stateVersionHint: state.tasks.length + state.notes.length + state.calendarItems.length + state.contentItems.length,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Sync timed out. Local changes are safe and will retry.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Sync request failed.");
  }

  return (await response.json()) as SyncResponse;
}

export function createInitialMeta(deviceId: string): PersistedMeta {
  return {
    deviceId,
    lastSyncedAt: null,
    lastSyncError: null,
    lastSyncAttemptAt: null,
  };
}

export function createInitialState(deviceId: string) {
  return sortDashboardState(createSeedDashboardState(deviceId));
}
