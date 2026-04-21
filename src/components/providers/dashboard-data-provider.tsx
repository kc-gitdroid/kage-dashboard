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
function createBootstrapStore(): StoreSnapshot {
  const deviceId = createDeviceId();
  const meta = createInitialMeta(deviceId);
  return {
    state: createInitialState(deviceId),
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
  const normalized = normalizeRecord(
    item,
    snapshot.meta.deviceId,
    ((snapshot.state[entity] as unknown as T[]).find((entry) => entry.id === item.id)),
  );
  const operation = createOperation(entity, "upsert", normalized, snapshot.meta.deviceId);
  const state = applyOperationToState(snapshot.state, operation);
  return withIndicator({
    ...snapshot,
    state,
    queue: [...snapshot.queue, operation],
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

function markStateSynced(state: DashboardState, syncedAt: string) {
  const mark = <T extends SyncableRecord>(items: T[]) =>
    items.map((item) => ({
      ...item,
      lastSyncedAt: item.deletedAt ? item.lastSyncedAt ?? syncedAt : syncedAt,
      syncStatus: item.deletedAt ? item.syncStatus ?? "synced" : "synced",
    }));

  return sortDashboardState({
    brands: mark(state.brands),
    brandSpaces: mark(state.brandSpaces),
    documents: mark(state.documents),
    tasks: mark(state.tasks),
    notes: mark(state.notes),
    calendarItems: mark(state.calendarItems),
    projects: mark(state.projects),
    contentItems: mark(state.contentItems),
    promptItems: mark(state.promptItems),
  });
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreSnapshot>(createBootstrapStore);
  const syncInFlightRef = useRef(false);
  const storeRef = useRef(store);

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
            state: sortDashboardState(persisted.state),
            queue: persisted.queue ?? [],
            meta: persisted.meta,
            hydrated: true,
            syncIndicator: {
              syncState: "idle",
              pendingCount: persisted.queue?.length ?? 0,
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

  async function runSync() {
    const snapshot = storeRef.current;

    if (!snapshot.hydrated || syncInFlightRef.current) {
      return;
    }

    syncInFlightRef.current = true;
    setStore((current) => withIndicator(current, { syncState: "syncing" }));

    try {
      const response = await syncWithServer(snapshot.state, snapshot.queue, {
        ...snapshot.meta,
        lastSyncAttemptAt: nowIso(),
      });

      setStore((current) => {
        const mergedState = mergeDashboardStates(current.state, response.state);
        const state = markStateSynced(mergedState, response.syncedAt);
        const queue = current.queue.filter((operation) => !response.acknowledgedOperationIds.includes(operation.id));
        return withIndicator({
          ...current,
          state,
          queue,
          meta: {
            ...current.meta,
            lastSyncedAt: response.syncedAt,
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
    }, 5000);

    return () => window.clearInterval(interval);
  }, [store.hydrated]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void runSync();
      }
    }

    function onFocus() {
      void runSync();
    }

    function onPageShow() {
      void runSync();
    }

    function onOnline() {
      void runSync();
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
      saveTask: (item) => setStore((current) => updateEntityState(current, "tasks", item)),
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
      deleteTask: (id) => setStore((current) => deleteEntityState(current, "tasks", id)),
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
