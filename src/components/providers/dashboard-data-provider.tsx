"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
  applyOperationToState,
  createDeviceId,
  createInitialMeta,
  createInitialState,
  createOperation,
  createId,
  loadPersistedStore,
  mergeDashboardStates,
  nowIso,
  normalizeRecord,
  persistStore,
  sortDashboardState,
  syncWithServer,
  tombstoneRecord,
  updateCollection,
  visibleRecords,
} from "@/lib/dashboard-store";
import {
  Brand,
  BrandSpace,
  CalendarItem,
  ContentItem,
  DashboardState,
  DocumentItem,
  NoteItem,
  PersistedSyncMeta,
  ProjectItem,
  PromptItem,
  SyncEntityName,
  SyncIndicatorState,
  SyncOperation,
  SyncableRecord,
  TaskItem,
} from "@/types";

type DashboardDataContextValue = {
  brands: Brand[];
  brandSpaces: BrandSpace[];
  documents: DocumentItem[];
  tasks: TaskItem[];
  notes: NoteItem[];
  calendarItems: CalendarItem[];
  projects: ProjectItem[];
  contentItems: ContentItem[];
  promptItems: PromptItem[];
  syncIndicator: SyncIndicatorState;
  hydrated: boolean;
  syncNow: () => Promise<void>;
  saveTask: (item: TaskItem) => void;
  saveNote: (item: NoteItem) => void;
  saveCalendarItem: (item: CalendarItem) => void;
  saveContentItem: (item: ContentItem) => void;
  saveProject: (item: ProjectItem) => void;
  savePromptItem: (item: PromptItem) => void;
  saveDocument: (item: DocumentItem) => void;
  saveBrand: (item: Brand) => void;
  saveBrandSpace: (item: BrandSpace) => void;
  deleteTask: (id: string) => void;
  deleteNote: (id: string) => void;
  deleteCalendarItem: (id: string) => void;
  deleteContentItem: (id: string) => void;
  deleteProject: (id: string) => void;
  deletePromptItem: (id: string) => void;
  getBrandSpaceById: (id: string) => BrandSpace | undefined;
  getProjectById: (id: string) => ProjectItem | undefined;
};

type StoreSnapshot = {
  state: DashboardState;
  queue: SyncOperation[];
  meta: PersistedSyncMeta;
  hydrated: boolean;
  syncIndicator: SyncIndicatorState;
};

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

function createTasklessState(state: DashboardState): DashboardState {
  return {
    ...state,
    tasks: [],
  };
}

function createBootstrapStore(): StoreSnapshot {
  const deviceId = createDeviceId();
  const meta = createInitialMeta(deviceId);
  return {
    state: createTasklessState(createInitialState(deviceId)),
    queue: [],
    meta,
    hydrated: false,
    syncIndicator: {
      syncState: "idle",
      pendingCount: 0,
      lastSyncedAt: null,
      lastSyncError: null,
      deviceId,
    },
  };
}

function withIndicator(snapshot: StoreSnapshot, patch?: Partial<SyncIndicatorState>): StoreSnapshot {
  return {
    ...snapshot,
    syncIndicator: {
      ...snapshot.syncIndicator,
      pendingCount: snapshot.queue.length,
      lastSyncedAt: snapshot.meta.lastSyncedAt,
      lastSyncError: snapshot.meta.lastSyncError,
      deviceId: snapshot.meta.deviceId,
      ...patch,
    },
  };
}

function updateEntityState<T extends SyncableRecord>(
  snapshot: StoreSnapshot,
  entity: SyncEntityName,
  item: T,
) {
  const pendingBefore = snapshot.queue.length;
  const normalized = normalizeRecord(
    item,
    snapshot.meta.deviceId,
    ((snapshot.state[entity] as unknown as T[]).find((entry) => entry.id === item.id)),
  );
  const operation = createOperation(entity, "upsert", normalized, snapshot.meta.deviceId);
  const state = applyOperationToState(snapshot.state, operation);
  const nextQueue = [...snapshot.queue, operation];

  if (entity === "tasks") {
    console.log("[sync-client] task created locally", {
      taskId: normalized.id,
      deviceId: snapshot.meta.deviceId,
      pendingOperationCountBeforeEnqueue: pendingBefore,
      pendingOperationCountAfterEnqueue: nextQueue.length,
    });
  }

  console.log("[sync-client] operation enqueued", {
    operationId: operation.id,
    entity,
    recordId: normalized.id,
    pendingOperationCountBeforeEnqueue: pendingBefore,
    pendingOperationCountAfterEnqueue: nextQueue.length,
  });

  return withIndicator({
    ...snapshot,
    state,
    queue: nextQueue,
  });
}

function deleteEntityState(snapshot: StoreSnapshot, entity: SyncEntityName, id: string) {
  const current = (snapshot.state[entity] as SyncableRecord[]).find((entry) => entry.id === id);
  if (!current) {
    return snapshot;
  }

  const record = tombstoneRecord(current, snapshot.meta.deviceId);
  const operation = createOperation(entity, "delete", record, snapshot.meta.deviceId);
  const state = applyOperationToState(snapshot.state, operation);
  return withIndicator({
    ...snapshot,
    state,
    queue: [...snapshot.queue, operation],
  });
}

function markStateSynced(state: DashboardState, syncedAt: string, remainingQueue: SyncOperation[]) {
  const pendingKeys = new Set(remainingQueue.map((operation) => `${operation.entity}:${operation.recordId}`));
  const mark = <T extends SyncableRecord>(entity: SyncEntityName, items: T[]) =>
    items.map((item) => ({
      ...(pendingKeys.has(`${entity}:${item.id}`)
        ? {
            ...item,
            syncStatus: "pending" as const,
          }
        : {
            ...item,
            lastSyncedAt: item.deletedAt ? item.lastSyncedAt ?? syncedAt : syncedAt,
            syncStatus: item.deletedAt ? item.syncStatus ?? "synced" : "synced",
          }),
    }));

  const marked = sortDashboardState({
    brands: mark("brands", state.brands),
    brandSpaces: mark("brandSpaces", state.brandSpaces),
    documents: mark("documents", state.documents),
    tasks: mark("tasks", state.tasks),
    notes: mark("notes", state.notes),
    calendarItems: mark("calendarItems", state.calendarItems),
    projects: mark("projects", state.projects),
    contentItems: mark("contentItems", state.contentItems),
    promptItems: mark("promptItems", state.promptItems),
  });

  return {
    ...marked,
    tasks: state.tasks,
  };
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

function compareIsoTimestamps(a: string | null | undefined, b: string | null | undefined) {
  const aTime = a ? new Date(a).getTime() : 0;
  const bTime = b ? new Date(b).getTime() : 0;
  return aTime - bTime;
}

function summarizePendingQueue(queue: SyncOperation[]) {
  return {
    count: queue.length,
    byEntity: queue.reduce<Record<string, number>>((acc, operation) => {
      acc[operation.entity] = (acc[operation.entity] ?? 0) + 1;
      return acc;
    }, {}),
    recordIds: queue.map((operation) => `${operation.entity}:${operation.recordId}`).slice(0, 25),
  };
}

type HostedTaskResponse = {
  task?: TaskItem;
  tasks: TaskItem[];
  canonicalUpdatedAt: string;
};

function withoutTaskOperations(queue: SyncOperation[]) {
  return queue.filter((operation) => operation.entity !== "tasks");
}

function mergeHostedTasksWithPending(localTasks: TaskItem[], hostedTasks: TaskItem[], pendingMutations: Map<string, "upsert" | "delete">) {
  let nextTasks = [...hostedTasks];

  localTasks.forEach((task) => {
    const pendingMutation = pendingMutations.get(task.id);

    if (pendingMutation === "upsert") {
      nextTasks = updateCollection(nextTasks, task);
    }

    if (pendingMutation === "delete") {
      nextTasks = nextTasks.filter((entry) => entry.id !== task.id);
    }
  });

  return sortDashboardState({
    ...createInitialState("merge-tasks"),
    tasks: nextTasks,
  }).tasks;
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreSnapshot>(createBootstrapStore);
  const syncInFlightRef = useRef(false);
  const storeRef = useRef(store);
  const pendingTaskMutationsRef = useRef(new Map<string, "upsert" | "delete">());

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const persisted = await loadPersistedStore();
        if (cancelled) {
          return;
        }

        if (!persisted?.state || !persisted.meta) {
          setStore((current) =>
            withIndicator(
              {
                ...current,
                hydrated: true,
              },
            ),
          );
          return;
        }

        setStore(
          withIndicator({
            state: sortDashboardState(createTasklessState(persisted.state)),
            queue: withoutTaskOperations(persisted.queue ?? []),
            meta: persisted.meta,
            hydrated: true,
            syncIndicator: {
              syncState: "idle",
              pendingCount: withoutTaskOperations(persisted.queue ?? []).length,
              lastSyncedAt: persisted.meta.lastSyncedAt,
              lastSyncError: persisted.meta.lastSyncError,
              deviceId: persisted.meta.deviceId,
            },
          }),
        );
      } catch {
        setStore((current) => withIndicator({ ...current, hydrated: true }));
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!store.hydrated) {
      return;
    }

    void persistStore(store.state, store.queue, store.meta);
  }, [store.state, store.queue, store.meta, store.hydrated]);

  async function fetchHostedTasks() {
    const response = await fetch("/api/tasks", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Task fetch failed.");
    }

    return (await response.json()) as HostedTaskResponse;
  }

  async function refreshTasksFromServer() {
    if (!storeRef.current.hydrated) {
      return;
    }

    try {
      const response = await fetchHostedTasks();
      console.log("[tasks-api] task list returned", {
        count: response.tasks.length,
        canonicalUpdatedAt: response.canonicalUpdatedAt,
      });
      setStore((current) => {
        const tasks = mergeHostedTasksWithPending(current.state.tasks, response.tasks, pendingTaskMutationsRef.current);
        return withIndicator({
          ...current,
          state: sortDashboardState({
            ...current.state,
            tasks,
          }),
        });
      });
    } catch {
      // Keep current optimistic/local task view when hosted read fails.
    }
  }

  async function createTaskOnServer(task: TaskItem) {
    console.log("[tasks-api-client] create task request", {
      taskId: task.id,
    });
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Task save failed.");
    }

    return (await response.json()) as HostedTaskResponse;
  }

  async function updateTaskOnServer(task: TaskItem) {
    console.log("[tasks-api-client] update task request", {
      taskId: task.id,
    });
    const response = await fetch("/api/tasks", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Task update failed.");
    }

    return (await response.json()) as HostedTaskResponse;
  }

  async function removeTaskFromServer(id: string) {
    console.log("[tasks-api-client] delete task request", {
      taskId: id,
    });
    const response = await fetch("/api/tasks", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Task delete failed.");
    }

    return (await response.json()) as HostedTaskResponse;
  }

  function saveTaskDirect(item: TaskItem) {
    const snapshot = storeRef.current;
    const existing = snapshot.state.tasks.find((entry) => entry.id === item.id);
    const normalized = normalizeRecord(item, snapshot.meta.deviceId, existing);
    pendingTaskMutationsRef.current.set(normalized.id, "upsert");

    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          tasks: updateCollection(current.state.tasks, normalized as TaskItem),
        }),
      }),
    );

    void (existing ? updateTaskOnServer(normalized as TaskItem) : createTaskOnServer(normalized as TaskItem))
      .then((response) => {
        pendingTaskMutationsRef.current.delete(normalized.id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              tasks: response.tasks,
            }),
          }),
        );
      })
      .catch(() => {
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Task save failed.",
          }),
        );
      })
      .finally(() => {
        void refreshTasksFromServer();
      });
  }

  function deleteTaskDirect(id: string) {
    pendingTaskMutationsRef.current.set(id, "delete");
    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          tasks: current.state.tasks.filter((task) => task.id !== id),
        }),
      }),
    );

    void removeTaskFromServer(id)
      .then((response) => {
        pendingTaskMutationsRef.current.delete(id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              tasks: response.tasks,
            }),
          }),
        );
      })
      .catch(() => {
        pendingTaskMutationsRef.current.delete(id);
        void refreshTasksFromServer();
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Task delete failed.",
          }),
        );
      });
  }

  async function runSync() {
    const snapshot = storeRef.current;

    if (!snapshot.hydrated || syncInFlightRef.current) {
      return;
    }

    syncInFlightRef.current = true;
    console.log("[sync-client] sync trigger", {
      syncMode: snapshot.queue.length > 0 ? "push" : "pull",
      pendingQueueSummary: summarizePendingQueue(snapshot.queue),
      stateSummary: summarizeState(snapshot.state),
    });
    setStore((current) => withIndicator(current, { syncState: "syncing" }));

    try {
      const syncState = createTasklessState(snapshot.state);
      console.log("[tasks-sync-bypassed] tasks excluded from sync reconciliation", {
        localTaskCount: snapshot.state.tasks.length,
        queuedTaskMutations: Array.from(pendingTaskMutationsRef.current.entries()),
      });
      const response = await syncWithServer(syncState, snapshot.queue, {
        ...snapshot.meta,
        lastSyncAttemptAt: nowIso(),
      });

      setStore((current) => {
        const preservedTasks = current.state.tasks;
        const queue = current.queue.filter((operation) => !response.acknowledgedOperationIds.includes(operation.id));
        const incomingCanonicalState = sortDashboardState(response.state);
        incomingCanonicalState.tasks = preservedTasks;
        const previousRevision = current.meta.lastSyncedAt;
        const incomingRevision = response.canonicalUpdatedAt;
        const revisionComparison = compareIsoTimestamps(incomingRevision, previousRevision);
        const applyStrategy = queue.length === 0 ? "canonical-replace" : "merge-with-local-pending";
        const mergedState =
          queue.length === 0
            ? incomingCanonicalState
            : mergeDashboardStates(current.state, incomingCanonicalState);
        const state = {
          ...markStateSynced(mergedState, response.syncedAt, queue),
          tasks: preservedTasks,
        };
        const previousStateSummary = summarizeState(current.state);
        const incomingStateSummary = summarizeState(incomingCanonicalState);
        const resultingStateSummary = summarizeState(state);
        const stateChanged =
          JSON.stringify(previousStateSummary) !== JSON.stringify(resultingStateSummary);
        const remoteApplyReason = (() => {
          if (queue.length === 0) {
            return revisionComparison > 0
              ? "applied-newer-canonical-directly"
              : revisionComparison === 0
                ? "canonical-replace-same-revision"
                : "canonical-replace-older-revision";
          }

          return revisionComparison > 0
            ? "merged-newer-canonical-with-local-pending"
            : revisionComparison === 0
              ? "merged-same-revision-with-local-pending"
              : "merged-older-canonical-with-local-pending";
        })();
        const remoteSkipReason = stateChanged
          ? null
          : queue.length > 0
            ? "local-pending-state-preserved-after-merge"
            : revisionComparison <= 0
              ? "incoming-canonical-not-newer-than-local-revision"
              : "incoming-canonical-matched-existing-local-shape";
        const pendingQueueExistsAtApply = queue.length > 0;
        const removedTaskIds = current.state.tasks
          .filter((task) => !state.tasks.some((nextTask) => nextTask.id === task.id))
          .map((task) => task.id);

        if (removedTaskIds.length > 0) {
          console.warn("[sync-client] reconciliation removed local task(s)", {
            removedTaskIds,
            pendingQueueExistsAtApply,
            pendingQueueSummary: summarizePendingQueue(queue),
            previousCanonicalRevision: previousRevision,
            incomingCanonicalRevision: incomingRevision,
            remoteSkipReason,
            applyStrategy,
          });
        }

        console.log("[sync-client] incoming sync response", {
          incomingCanonicalRevision: incomingRevision,
          previousCanonicalRevision: previousRevision,
          revisionComparison,
          acknowledgedOperationCount: response.acknowledgedOperationIds.length,
          remainingQueueCount: queue.length,
          localPendingQueueSummary: summarizePendingQueue(queue),
          pendingQueueExistsAtApply,
          applyStrategy,
          remoteApplyReason,
          remoteChangesApplied: stateChanged,
          remoteSkipReason,
          incomingStateSummary,
          previousStateSummary,
          resultingStateSummary,
        });

        return withIndicator({
          ...current,
          state,
          queue,
          meta: {
            ...current.meta,
            lastSyncedAt: response.canonicalUpdatedAt,
            lastSyncError: response.conflicts.length > 0 ? `Resolved ${response.conflicts.length} conflict${response.conflicts.length > 1 ? "s" : ""}.` : null,
            lastSyncAttemptAt: response.syncedAt,
          },
        }, { syncState: "idle" });
      });
    } catch (error) {
      setStore((current) =>
        withIndicator(
          {
            ...current,
            meta: {
              ...current.meta,
              lastSyncError: error instanceof Error ? error.message : "Sync failed.",
              lastSyncAttemptAt: nowIso(),
            },
          },
          { syncState: "failed" },
        ),
      );
    } finally {
      syncInFlightRef.current = false;
    }
  }

  useEffect(() => {
    if (!store.hydrated) {
      return;
    }

    void runSync();
    void refreshTasksFromServer();
  }, [store.hydrated]);

  useEffect(() => {
    if (!store.hydrated) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void runSync();
    }, store.queue.length > 0 ? 600 : 1200);

    return () => window.clearTimeout(timeout);
  }, [store.hydrated, store.queue.length]);

  useEffect(() => {
    if (!store.hydrated) {
      return;
    }

    const interval = window.setInterval(() => {
      void runSync();
      void refreshTasksFromServer();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [store.hydrated]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void runSync();
        void refreshTasksFromServer();
      }
    }

    function onFocus() {
      void runSync();
      void refreshTasksFromServer();
    }

    function onPageShow() {
      void runSync();
      void refreshTasksFromServer();
    }

    function onOnline() {
      void runSync();
      void refreshTasksFromServer();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("online", onOnline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("online", onOnline);
    };
  }, [store.hydrated]);

  const value = useMemo<DashboardDataContextValue>(() => {
    const visibleState = {
      brands: visibleRecords(store.state.brands),
      brandSpaces: visibleRecords(store.state.brandSpaces),
      documents: visibleRecords(store.state.documents),
      tasks: visibleRecords(store.state.tasks),
      notes: visibleRecords(store.state.notes),
      calendarItems: visibleRecords(store.state.calendarItems),
      projects: visibleRecords(store.state.projects),
      contentItems: visibleRecords(store.state.contentItems),
      promptItems: visibleRecords(store.state.promptItems),
    };

    return {
      ...visibleState,
      hydrated: store.hydrated,
      syncIndicator: store.syncIndicator,
      syncNow: runSync,
      saveTask: saveTaskDirect,
      saveNote: (item) =>
        setStore((current) =>
          updateEntityState(current, "notes", {
            ...item,
            createdAt: item.createdAt ?? nowIso(),
          }),
        ),
      saveCalendarItem: (item) => setStore((current) => updateEntityState(current, "calendarItems", item)),
      saveContentItem: (item) => setStore((current) => updateEntityState(current, "contentItems", item)),
      saveProject: (item) => setStore((current) => updateEntityState(current, "projects", item)),
      savePromptItem: (item) => setStore((current) => updateEntityState(current, "promptItems", item)),
      saveDocument: (item) => setStore((current) => updateEntityState(current, "documents", item)),
      saveBrand: (item) => setStore((current) => updateEntityState(current, "brands", item)),
      saveBrandSpace: (item) => setStore((current) => updateEntityState(current, "brandSpaces", item)),
      deleteTask: deleteTaskDirect,
      deleteNote: (id) => setStore((current) => deleteEntityState(current, "notes", id)),
      deleteCalendarItem: (id) => setStore((current) => deleteEntityState(current, "calendarItems", id)),
      deleteContentItem: (id) => setStore((current) => deleteEntityState(current, "contentItems", id)),
      deleteProject: (id) => setStore((current) => deleteEntityState(current, "projects", id)),
      deletePromptItem: (id) => setStore((current) => deleteEntityState(current, "promptItems", id)),
      getBrandSpaceById: (id) => visibleState.brandSpaces.find((brand) => brand.id === id),
      getProjectById: (id) => visibleState.projects.find((project) => project.id === id),
    };
  }, [store]);

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);

  if (!context) {
    throw new Error("useDashboardData must be used within DashboardDataProvider");
  }

  return context;
}

export function createLocalRecordId(prefix: string) {
  return createId(prefix);
}
