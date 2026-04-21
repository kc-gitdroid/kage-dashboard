import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { createSeedDashboardState } from "@/data/seed";
import {
  DashboardState,
  SyncConflict,
  SyncEntityName,
  SyncOperation,
  SyncResponse,
  SyncableRecord,
} from "@/types";

const SYNC_FILE_PATH = join(process.cwd(), ".sync", "kage-dashboard-sync.json");
const UPSTASH_KEY = "kage-dashboard:sync-state";

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

type PersistedCanonicalState = {
  state: DashboardState;
  conflictLog: SyncConflict[];
  updatedAt: string;
};

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

function nowIso() {
  return new Date().toISOString();
}

function getRecordTimestamp(record?: SyncableRecord | null) {
  return new Date(record?.deletedAt ?? record?.updatedAt ?? record?.createdAt ?? 0).getTime();
}

function markCanonicalRecord<T extends SyncableRecord>(record: T, syncedAt: string): T {
  return {
    ...record,
    lastSyncedAt: syncedAt,
    syncStatus: "synced",
  };
}

function sortState(state: DashboardState): DashboardState {
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

async function ensureSyncFile() {
  await mkdir(dirname(SYNC_FILE_PATH), { recursive: true });
}

function createInitialCanonicalState(): PersistedCanonicalState {
  const seededAt = nowIso();
  return {
    state: sortState(createSeedDashboardState("server-seed")),
    conflictLog: [],
    updatedAt: seededAt,
  };
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

function assertHostedSyncAvailable() {
  if (getUpstashConfig()) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error(
      "Hosted sync is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.",
    );
  }
}

async function readFromUpstash(): Promise<PersistedCanonicalState | null> {
  const config = getUpstashConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/get/${encodeURIComponent(UPSTASH_KEY)}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash read failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: string | null };
  if (!payload.result) {
    return null;
  }

  return JSON.parse(payload.result) as PersistedCanonicalState;
}

async function writeToUpstash(payload: PersistedCanonicalState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  const response = await fetch(`${config.url}/set/${encodeURIComponent(UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(JSON.stringify(payload)),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash write failed with status ${response.status}.`);
  }

  return true;
}

export async function readCanonicalState(): Promise<PersistedCanonicalState> {
  assertHostedSyncAvailable();

  const upstashState = await readFromUpstash();
  if (upstashState) {
    return {
      ...upstashState,
      state: sortState(ensureDashboardStateShape(upstashState.state)),
    };
  }

  if (isProductionRuntime()) {
    const initial = createInitialCanonicalState();
    await writeCanonicalState(initial);
    return initial;
  }

  try {
    await ensureSyncFile();
    const raw = await readFile(SYNC_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as PersistedCanonicalState;
    return {
      ...parsed,
      state: sortState(ensureDashboardStateShape(parsed.state)),
    };
  } catch {
    const initial = createInitialCanonicalState();
    await writeCanonicalState(initial);
    return initial;
  }
}

export async function writeCanonicalState(payload: PersistedCanonicalState) {
  assertHostedSyncAvailable();

  const wroteRemote = await writeToUpstash(payload).catch(() => false);
  if (wroteRemote) {
    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted sync write failed. Check Upstash credentials and runtime environment variables.");
  }

  await ensureSyncFile();
  await writeFile(SYNC_FILE_PATH, JSON.stringify(payload, null, 2), "utf8");
}

function applyOperation(
  state: DashboardState,
  entity: SyncEntityName,
  record: SyncableRecord,
  syncedAt: string,
) {
  const collection = [...(((ensureDashboardStateShape(state))[entity]) as SyncableRecord[])];
  const index = collection.findIndex((item) => item.id === record.id);
  const nextRecord = markCanonicalRecord(record, syncedAt);

  if (index === -1) {
    collection.push(nextRecord);
  } else {
    collection[index] = nextRecord;
  }

  return {
    ...state,
    [entity]: collection,
  } as DashboardState;
}

export async function processSyncRequest(input: {
  deviceId: string;
  operations: SyncOperation[];
}): Promise<SyncResponse> {
  const canonical = await readCanonicalState();
  let nextState = ensureDashboardStateShape(canonical.state);
  const conflicts: SyncConflict[] = [];
  const acknowledgedOperationIds: string[] = [];
  const syncedAt = nowIso();

  const orderedOperations = [...input.operations].sort(
    (a, b) => new Date(a.enqueuedAt).getTime() - new Date(b.enqueuedAt).getTime(),
  );

  for (const operation of orderedOperations) {
    const incoming = operation.payload as SyncableRecord;
    const currentCollection = ensureDashboardStateShape(nextState)[operation.entity] as SyncableRecord[];
    const existing = currentCollection.find((item) => item.id === incoming.id);
    const incomingTime = getRecordTimestamp(incoming);
    const existingTime = getRecordTimestamp(existing);

    if (!existing || incomingTime >= existingTime) {
      nextState = applyOperation(nextState, operation.entity, incoming, syncedAt);

      if (existing && existing.deviceUpdatedAt && incoming.deviceUpdatedAt && existing.deviceUpdatedAt !== incoming.deviceUpdatedAt) {
        conflicts.push({
          entity: operation.entity,
          recordId: incoming.id,
          incomingUpdatedAt: incoming.updatedAt ?? incoming.deletedAt ?? syncedAt,
          canonicalUpdatedAt: existing.updatedAt ?? existing.deletedAt ?? syncedAt,
          resolution: "incoming-won",
          detectedAt: syncedAt,
        });
      }
    } else {
      conflicts.push({
        entity: operation.entity,
        recordId: incoming.id,
        incomingUpdatedAt: incoming.updatedAt ?? incoming.deletedAt ?? syncedAt,
        canonicalUpdatedAt: existing?.updatedAt ?? existing?.deletedAt ?? syncedAt,
        resolution: "canonical-kept",
        detectedAt: syncedAt,
      });
    }

    acknowledgedOperationIds.push(operation.id);
  }

  const persisted: PersistedCanonicalState = {
    state: sortState(nextState),
    conflictLog: [...canonical.conflictLog, ...conflicts].slice(-100),
    updatedAt: syncedAt,
  };

  await writeCanonicalState(persisted);

  return {
    state: persisted.state,
    acknowledgedOperationIds,
    conflicts,
    syncedAt,
  };
}
