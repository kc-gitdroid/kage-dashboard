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

function logSyncDebug(message: string, details?: Record<string, unknown>) {
  const payload = details ? ` ${JSON.stringify(details)}` : "";
  console.log(`[sync] ${message}${payload}`);
}

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

function summarizeOperations(operations: SyncOperation[]) {
  return {
    count: operations.length,
    byEntity: operations.reduce<Record<string, number>>((acc, operation) => {
      acc[operation.entity] = (acc[operation.entity] ?? 0) + 1;
      return acc;
    }, {}),
    recordIds: operations.map((operation) => `${operation.entity}:${operation.recordId}`).slice(0, 25),
  };
}

type PersistedCanonicalState = {
  state: DashboardState;
  conflictLog: SyncConflict[];
  updatedAt: string;
};

function ensureConflictLogShape(conflictLog: unknown): SyncConflict[] {
  return Array.isArray(conflictLog) ? (conflictLog as SyncConflict[]) : [];
}

function ensureCanonicalStateShape(
  payload: Partial<PersistedCanonicalState> | null | undefined,
): PersistedCanonicalState {
  const normalizedUpdatedAt =
    typeof payload?.updatedAt === "string" && payload.updatedAt.length > 0 ? payload.updatedAt : nowIso();

  return {
    state: sortState(ensureDashboardStateShape(payload?.state)),
    conflictLog: ensureConflictLogShape(payload?.conflictLog),
    updatedAt: normalizedUpdatedAt,
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

function mergeSnapshotState(
  canonicalState: DashboardState,
  incomingState: Partial<DashboardState> | null | undefined,
  syncedAt: string,
): DashboardState {
  const nextState = ensureDashboardStateShape(canonicalState);
  const safeIncomingState = ensureDashboardStateShape(incomingState);

  (Object.keys(nextState) as SyncEntityName[]).forEach((entity) => {
    const incomingCollection = safeIncomingState[entity] as SyncableRecord[];
    const canonicalCollection = [...(nextState[entity] as SyncableRecord[])];

    incomingCollection.forEach((incomingRecord) => {
      const existingIndex = canonicalCollection.findIndex((item) => item.id === incomingRecord.id);

      if (existingIndex === -1) {
        canonicalCollection.push(markCanonicalRecord(incomingRecord, syncedAt));
        return;
      }

      const existingRecord = canonicalCollection[existingIndex];
      if (getRecordTimestamp(incomingRecord) >= getRecordTimestamp(existingRecord)) {
        canonicalCollection[existingIndex] = markCanonicalRecord(incomingRecord, syncedAt);
      }
    });

    (nextState[entity] as SyncableRecord[]) = canonicalCollection;
  });

  return sortState(nextState);
}

async function ensureSyncFile() {
  await mkdir(dirname(SYNC_FILE_PATH), { recursive: true });
}

function createInitialCanonicalState(): PersistedCanonicalState {
  const seededAt = nowIso();
  return ensureCanonicalStateShape({
    state: sortState(createSeedDashboardState("server-seed")),
    conflictLog: [],
    updatedAt: seededAt,
  });
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  logSyncDebug("Upstash env presence", {
    hasUpstashUrl: Boolean(url),
    hasUpstashToken: Boolean(token),
    nodeEnv: process.env.NODE_ENV ?? "unknown",
  });

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

  logSyncDebug("Starting Upstash read", {
    operation: "read",
    key: UPSTASH_KEY,
  });

  const response = await fetch(`${config.url}/get/${encodeURIComponent(UPSTASH_KEY)}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  logSyncDebug("Upstash read response", {
    operation: "read",
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    throw new Error(`Upstash read failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: string | null };
  if (!payload.result) {
    return null;
  }

  return ensureCanonicalStateShape(JSON.parse(payload.result) as Partial<PersistedCanonicalState>);
}

async function writeToUpstash(payload: PersistedCanonicalState) {
  const config = getUpstashConfig();
  if (!config) {
    return false;
  }

  logSyncDebug("Starting Upstash write", {
    operation: "write",
    key: UPSTASH_KEY,
  });

  const response = await fetch(`${config.url}/set/${encodeURIComponent(UPSTASH_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(JSON.stringify(payload)),
    cache: "no-store",
  });

  logSyncDebug("Upstash write response", {
    operation: "write",
    status: response.status,
    ok: response.ok,
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
    const normalized = ensureCanonicalStateShape(upstashState);
    logSyncDebug("Fetched canonical state from hosted store", {
      canonicalRevision: normalized.updatedAt,
      stateSummary: summarizeState(normalized.state),
    });
    return normalized;
  }

  if (isProductionRuntime()) {
    const initial = createInitialCanonicalState();
    await writeCanonicalState(initial);
    return initial;
  }

  try {
    await ensureSyncFile();
    const raw = await readFile(SYNC_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistedCanonicalState>;
    const normalized = ensureCanonicalStateShape(parsed);
    logSyncDebug("Fetched canonical state from local fallback", {
      canonicalRevision: normalized.updatedAt,
      stateSummary: summarizeState(normalized.state),
    });
    return normalized;
  } catch {
    const initial = createInitialCanonicalState();
    await writeCanonicalState(initial);
    return initial;
  }
}

export async function writeCanonicalState(payload: PersistedCanonicalState) {
  assertHostedSyncAvailable();

  const normalizedPayload = ensureCanonicalStateShape(payload);
  logSyncDebug("Writing canonical state", {
    canonicalRevision: normalizedPayload.updatedAt,
    stateSummary: summarizeState(normalizedPayload.state),
  });

  const wroteRemote = await writeToUpstash(normalizedPayload).catch(() => false);
  if (wroteRemote) {
    logSyncDebug("Canonical state write completed", {
      canonicalRevision: normalizedPayload.updatedAt,
    });
    return;
  }

  if (isProductionRuntime()) {
    throw new Error("Hosted sync write failed. Check Upstash credentials and runtime environment variables.");
  }

  await ensureSyncFile();
  await writeFile(SYNC_FILE_PATH, JSON.stringify(normalizedPayload, null, 2), "utf8");
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
  syncMode?: "pull" | "push" | "bootstrap";
  bootstrapAllowed?: boolean;
  operations: SyncOperation[];
  state?: DashboardState;
}): Promise<SyncResponse> {
  const canonical = await readCanonicalState();
  const syncedAt = nowIso();
  const hasOperations = input.operations.length > 0;
  const bootstrapAllowed = input.bootstrapAllowed === true;
  const syncMode = input.syncMode ?? (hasOperations ? "push" : "pull");
  const snapshotMergeAttempted = Boolean(input.state);
  const snapshotMergeApplied = bootstrapAllowed && Boolean(input.state);
  const snapshotMergeSkipReason = snapshotMergeApplied
    ? null
    : !snapshotMergeAttempted
      ? "no-state-payload"
      : !bootstrapAllowed
        ? "bootstrap-not-allowed"
        : "snapshot-not-applied";
  let nextState = snapshotMergeApplied ? mergeSnapshotState(canonical.state, input.state, syncedAt) : canonical.state;
  const conflicts: SyncConflict[] = [];
  const acknowledgedOperationIds: string[] = [];

  logSyncDebug("Processing sync request", {
    deviceId: input.deviceId,
    syncMode,
    bootstrapAllowed,
    operationCount: input.operations.length,
    canonicalRevisionBeforeWrite: canonical.updatedAt,
    canonicalStateSummaryBeforeWrite: summarizeState(canonical.state),
    snapshotMergeAttempted,
    snapshotMergeApplied,
    snapshotMergeSkipReason,
    incomingOperationSummary: summarizeOperations(input.operations),
    incomingStateSummary: summarizeState(ensureDashboardStateShape(input.state)),
  });

  if (!hasOperations && !snapshotMergeApplied) {
    logSyncDebug("Read-only sync request completed", {
      deviceId: input.deviceId,
      syncMode,
      bootstrapAllowed,
      canonicalRevisionReturned: canonical.updatedAt,
      stateSummary: summarizeState(canonical.state),
    });

    return {
      state: canonical.state,
      acknowledgedOperationIds: [],
      conflicts: [],
      syncedAt,
      canonicalUpdatedAt: canonical.updatedAt,
    };
  }

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

  logSyncDebug("Canonical state prepared before write", {
    deviceId: input.deviceId,
    syncMode,
    bootstrapAllowed,
    canonicalRevisionBeforeWrite: canonical.updatedAt,
    canonicalStateSummaryBeforeWrite: summarizeState(canonical.state),
    mergedStateSummaryBeforeWrite: summarizeState(sortState(nextState)),
    acknowledgedOperationCount: acknowledgedOperationIds.length,
    conflictCount: conflicts.length,
  });

  const persisted: PersistedCanonicalState = {
    state: sortState(nextState),
    conflictLog: [...ensureConflictLogShape(canonical.conflictLog), ...conflicts].slice(-100),
    updatedAt: syncedAt,
  };

  await writeCanonicalState(persisted);

  logSyncDebug("Sync request completed", {
    deviceId: input.deviceId,
    canonicalRevisionAfterWrite: persisted.updatedAt,
    acknowledgedOperationCount: acknowledgedOperationIds.length,
    stateSummary: summarizeState(persisted.state),
  });

  return {
    state: persisted.state,
    acknowledgedOperationIds,
    conflicts,
    syncedAt,
    canonicalUpdatedAt: persisted.updatedAt,
  };
}
