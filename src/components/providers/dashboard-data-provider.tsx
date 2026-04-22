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
    notes: [],
    calendarItems: [],
    projects: [],
    contentItems: [],
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

function preserveCollectionIfIncomingEmpty<T extends SyncableRecord>(currentItems: T[], incomingItems: T[]) {
  return incomingItems.length === 0 && currentItems.length > 0 ? currentItems : incomingItems;
}

function preserveBootstrapBrands(currentState: DashboardState, incomingState: DashboardState): DashboardState {
  return {
    ...incomingState,
    brands: preserveCollectionIfIncomingEmpty(currentState.brands, incomingState.brands),
    brandSpaces: preserveCollectionIfIncomingEmpty(currentState.brandSpaces, incomingState.brandSpaces),
  };
}

type HostedTaskResponse = {
  task?: TaskItem;
  tasks: TaskItem[];
  canonicalUpdatedAt: string;
};

type HostedNoteResponse = {
  note?: NoteItem;
  notes: NoteItem[];
  canonicalUpdatedAt: string;
};

type HostedCalendarResponse = {
  calendarItem?: CalendarItem;
  calendarItems: CalendarItem[];
  canonicalUpdatedAt: string;
};

type HostedProjectResponse = {
  project?: ProjectItem;
  projects: ProjectItem[];
  canonicalUpdatedAt: string;
};

type HostedContentResponse = {
  contentItem?: ContentItem;
  contentItems: ContentItem[];
  canonicalUpdatedAt: string;
};

function withoutTaskOperations(queue: SyncOperation[]) {
  return queue.filter(
    (operation) =>
      operation.entity !== "tasks" &&
      operation.entity !== "notes" &&
      operation.entity !== "calendarItems" &&
      operation.entity !== "projects" &&
      operation.entity !== "contentItems",
  );
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

function mergeHostedNotesWithPending(localNotes: NoteItem[], hostedNotes: NoteItem[], pendingMutations: Map<string, "upsert" | "delete">) {
  let nextNotes = [...hostedNotes];

  localNotes.forEach((note) => {
    const pendingMutation = pendingMutations.get(note.id);

    if (pendingMutation === "upsert") {
      nextNotes = updateCollection(nextNotes, note);
    }

    if (pendingMutation === "delete") {
      nextNotes = nextNotes.filter((entry) => entry.id !== note.id);
    }
  });

  return sortDashboardState({
    ...createInitialState("merge-notes"),
    notes: nextNotes,
  }).notes;
}

function mergeHostedCalendarWithPending(
  localItems: CalendarItem[],
  hostedItems: CalendarItem[],
  pendingMutations: Map<string, "upsert" | "delete">,
) {
  let nextItems = [...hostedItems];

  localItems.forEach((item) => {
    const pendingMutation = pendingMutations.get(item.id);

    if (pendingMutation === "upsert") {
      nextItems = updateCollection(nextItems, item);
    }

    if (pendingMutation === "delete") {
      nextItems = nextItems.filter((entry) => entry.id !== item.id);
    }
  });

  return sortDashboardState({
    ...createInitialState("merge-calendar"),
    calendarItems: nextItems,
  }).calendarItems;
}

function mergeHostedProjectsWithPending(
  localItems: ProjectItem[],
  hostedItems: ProjectItem[],
  pendingMutations: Map<string, "upsert" | "delete">,
) {
  let nextItems = [...hostedItems];

  localItems.forEach((item) => {
    const pendingMutation = pendingMutations.get(item.id);

    if (pendingMutation === "upsert") {
      nextItems = updateCollection(nextItems, item);
    }

    if (pendingMutation === "delete") {
      nextItems = nextItems.filter((entry) => entry.id !== item.id);
    }
  });

  return sortDashboardState({
    ...createInitialState("merge-projects"),
    projects: nextItems,
  }).projects;
}

function mergeHostedContentWithPending(
  localItems: ContentItem[],
  hostedItems: ContentItem[],
  pendingMutations: Map<string, "upsert" | "delete">,
) {
  let nextItems = [...hostedItems];

  localItems.forEach((item) => {
    const pendingMutation = pendingMutations.get(item.id);

    if (pendingMutation === "upsert") {
      nextItems = updateCollection(nextItems, item);
    }

    if (pendingMutation === "delete") {
      nextItems = nextItems.filter((entry) => entry.id !== item.id);
    }
  });

  return sortDashboardState({
    ...createInitialState("merge-content"),
    contentItems: nextItems,
  }).contentItems;
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreSnapshot>(createBootstrapStore);
  const syncInFlightRef = useRef(false);
  const storeRef = useRef(store);
  const pendingTaskMutationsRef = useRef(new Map<string, "upsert" | "delete">());
  const pendingNoteMutationsRef = useRef(new Map<string, "upsert" | "delete">());
  const pendingCalendarMutationsRef = useRef(new Map<string, "upsert" | "delete">());
  const pendingProjectMutationsRef = useRef(new Map<string, "upsert" | "delete">());
  const pendingContentMutationsRef = useRef(new Map<string, "upsert" | "delete">());

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
          console.log("[brands-runtime] initial load complete", {
            source: "bootstrap-only",
            brandsCount: storeRef.current.state.brands.length,
            brandSpacesCount: storeRef.current.state.brandSpaces.length,
          });
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

        const hydratedState = sortDashboardState(
          preserveBootstrapBrands(createBootstrapStore().state, createTasklessState(persisted.state)),
        );

        console.log("[brands-runtime] initial load complete", {
          source: "persisted-hydration",
          persistedBrandsCount: persisted.state.brands?.length ?? 0,
          persistedBrandSpacesCount: persisted.state.brandSpaces?.length ?? 0,
          brandsCountAfterHydration: hydratedState.brands.length,
          brandSpacesCountAfterHydration: hydratedState.brandSpaces.length,
        });

        setStore(
          withIndicator({
            state: hydratedState,
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
        console.log("[tasks-source] applied tasks from tasks-api only", {
          taskCount: tasks.length,
          canonicalUpdatedAt: response.canonicalUpdatedAt,
        });
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

  async function fetchHostedNotes() {
    const response = await fetch("/api/notes", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Note fetch failed.");
    }

    return (await response.json()) as HostedNoteResponse;
  }

  async function refreshNotesFromServer() {
    if (!storeRef.current.hydrated) {
      return;
    }

    try {
      const response = await fetchHostedNotes();
      setStore((current) => {
        const notes = mergeHostedNotesWithPending(current.state.notes, response.notes, pendingNoteMutationsRef.current);
        return withIndicator({
          ...current,
          state: sortDashboardState({
            ...current.state,
            notes,
          }),
        });
      });
    } catch {
      // Keep current optimistic/local note view when hosted read fails.
    }
  }

  async function fetchHostedCalendarItems() {
    const response = await fetch("/api/calendar-items", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Calendar fetch failed.");
    }

    return (await response.json()) as HostedCalendarResponse;
  }

  async function refreshCalendarItemsFromServer() {
    if (!storeRef.current.hydrated) {
      return;
    }

    try {
      const response = await fetchHostedCalendarItems();
      setStore((current) => {
        const calendarItems = mergeHostedCalendarWithPending(
          current.state.calendarItems,
          response.calendarItems,
          pendingCalendarMutationsRef.current,
        );
        return withIndicator({
          ...current,
          state: sortDashboardState({
            ...current.state,
            calendarItems,
          }),
        });
      });
    } catch {
      // Keep current optimistic/local calendar view when hosted read fails.
    }
  }

  async function fetchHostedProjects() {
    const response = await fetch("/api/projects", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Project fetch failed.");
    }

    return (await response.json()) as HostedProjectResponse;
  }

  async function refreshProjectsFromServer() {
    if (!storeRef.current.hydrated) {
      return;
    }

    try {
      const response = await fetchHostedProjects();
      setStore((current) => {
        const projects = mergeHostedProjectsWithPending(
          current.state.projects,
          response.projects,
          pendingProjectMutationsRef.current,
        );
        return withIndicator({
          ...current,
          state: sortDashboardState({
            ...current.state,
            projects,
          }),
        });
      });
    } catch {
      // Keep current optimistic/local project view when hosted read fails.
    }
  }

  async function fetchHostedContentItems() {
    const response = await fetch("/api/content-items", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Content fetch failed.");
    }

    return (await response.json()) as HostedContentResponse;
  }

  async function refreshContentItemsFromServer() {
    if (!storeRef.current.hydrated) {
      return;
    }

    try {
      const response = await fetchHostedContentItems();
      setStore((current) => {
        const contentItems = mergeHostedContentWithPending(
          current.state.contentItems,
          response.contentItems,
          pendingContentMutationsRef.current,
        );
        return withIndicator({
          ...current,
          state: sortDashboardState({
            ...current.state,
            contentItems,
          }),
        });
      });
    } catch {
      // Keep current optimistic/local content view when hosted read fails.
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

  async function createNoteOnServer(note: NoteItem) {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Note create failed.");
    }

    return (await response.json()) as HostedNoteResponse;
  }

  async function updateNoteOnServer(note: NoteItem) {
    const response = await fetch("/api/notes", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Note update failed.");
    }

    return (await response.json()) as HostedNoteResponse;
  }

  async function removeNoteFromServer(id: string) {
    const response = await fetch("/api/notes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Note delete failed.");
    }

    return (await response.json()) as HostedNoteResponse;
  }

  async function createCalendarItemOnServer(calendarItem: CalendarItem) {
    const response = await fetch("/api/calendar-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ calendarItem }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Calendar create failed.");
    }

    return (await response.json()) as HostedCalendarResponse;
  }

  async function updateCalendarItemOnServer(calendarItem: CalendarItem) {
    const response = await fetch("/api/calendar-items", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ calendarItem }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Calendar update failed.");
    }

    return (await response.json()) as HostedCalendarResponse;
  }

  async function removeCalendarItemFromServer(id: string) {
    const response = await fetch("/api/calendar-items", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Calendar delete failed.");
    }

    return (await response.json()) as HostedCalendarResponse;
  }

  async function createProjectOnServer(project: ProjectItem) {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Project create failed.");
    }

    return (await response.json()) as HostedProjectResponse;
  }

  async function updateProjectOnServer(project: ProjectItem) {
    const response = await fetch("/api/projects", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Project update failed.");
    }

    return (await response.json()) as HostedProjectResponse;
  }

  async function removeProjectFromServer(id: string) {
    const response = await fetch("/api/projects", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Project delete failed.");
    }

    return (await response.json()) as HostedProjectResponse;
  }

  async function createContentItemOnServer(contentItem: ContentItem) {
    const response = await fetch("/api/content-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentItem }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Content create failed.");
    }

    return (await response.json()) as HostedContentResponse;
  }

  async function updateContentItemOnServer(contentItem: ContentItem) {
    const response = await fetch("/api/content-items", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentItem }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Content update failed.");
    }

    return (await response.json()) as HostedContentResponse;
  }

  async function removeContentItemFromServer(id: string) {
    const response = await fetch("/api/content-items", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Content delete failed.");
    }

    return (await response.json()) as HostedContentResponse;
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

  function saveNoteDirect(item: NoteItem) {
    const snapshot = storeRef.current;
    const existing = snapshot.state.notes.find((entry) => entry.id === item.id);
    const normalized = normalizeRecord(
      {
        ...item,
        createdAt: item.createdAt ?? existing?.createdAt ?? nowIso(),
      },
      snapshot.meta.deviceId,
      existing,
    ) as NoteItem;

    pendingNoteMutationsRef.current.set(normalized.id, "upsert");

    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          notes: updateCollection(current.state.notes, normalized),
        }),
      }),
    );

    void (existing ? updateNoteOnServer(normalized) : createNoteOnServer(normalized))
      .then((response) => {
        pendingNoteMutationsRef.current.delete(normalized.id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              notes: response.notes,
            }),
          }),
        );
      })
      .catch(() => {
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Note save failed.",
          }),
        );
      })
      .finally(() => {
        void refreshNotesFromServer();
      });
  }

  function deleteNoteDirect(id: string) {
    pendingNoteMutationsRef.current.set(id, "delete");
    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          notes: current.state.notes.filter((note) => note.id !== id),
        }),
      }),
    );

    void removeNoteFromServer(id)
      .then((response) => {
        pendingNoteMutationsRef.current.delete(id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              notes: response.notes,
            }),
          }),
        );
      })
      .catch(() => {
        pendingNoteMutationsRef.current.delete(id);
        void refreshNotesFromServer();
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Note delete failed.",
          }),
        );
      });
  }

  function saveCalendarDirect(item: CalendarItem) {
    const snapshot = storeRef.current;
    const existing = snapshot.state.calendarItems.find((entry) => entry.id === item.id);
    const normalized = normalizeRecord(item, snapshot.meta.deviceId, existing) as CalendarItem;

    pendingCalendarMutationsRef.current.set(normalized.id, "upsert");

    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          calendarItems: updateCollection(current.state.calendarItems, normalized),
        }),
      }),
    );

    void (existing ? updateCalendarItemOnServer(normalized) : createCalendarItemOnServer(normalized))
      .then((response) => {
        pendingCalendarMutationsRef.current.delete(normalized.id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              calendarItems: response.calendarItems,
            }),
          }),
        );
      })
      .catch(() => {
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Calendar save failed.",
          }),
        );
      })
      .finally(() => {
        void refreshCalendarItemsFromServer();
      });
  }

  function deleteCalendarDirect(id: string) {
    pendingCalendarMutationsRef.current.set(id, "delete");
    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          calendarItems: current.state.calendarItems.filter((item) => item.id !== id),
        }),
      }),
    );

    void removeCalendarItemFromServer(id)
      .then((response) => {
        pendingCalendarMutationsRef.current.delete(id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              calendarItems: response.calendarItems,
            }),
          }),
        );
      })
      .catch(() => {
        pendingCalendarMutationsRef.current.delete(id);
        void refreshCalendarItemsFromServer();
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Calendar delete failed.",
          }),
        );
      });
  }

  function saveProjectDirect(item: ProjectItem) {
    const snapshot = storeRef.current;
    const existing = snapshot.state.projects.find((entry) => entry.id === item.id);
    const normalized = normalizeRecord(item, snapshot.meta.deviceId, existing) as ProjectItem;

    pendingProjectMutationsRef.current.set(normalized.id, "upsert");

    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          projects: updateCollection(current.state.projects, normalized),
        }),
      }),
    );

    void (existing ? updateProjectOnServer(normalized) : createProjectOnServer(normalized))
      .then((response) => {
        pendingProjectMutationsRef.current.delete(normalized.id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              projects: response.projects,
            }),
          }),
        );
      })
      .catch(() => {
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Project save failed.",
          }),
        );
      })
      .finally(() => {
        void refreshProjectsFromServer();
      });
  }

  function deleteProjectDirect(id: string) {
    pendingProjectMutationsRef.current.set(id, "delete");
    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          projects: current.state.projects.filter((project) => project.id !== id),
        }),
      }),
    );

    void removeProjectFromServer(id)
      .then((response) => {
        pendingProjectMutationsRef.current.delete(id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              projects: response.projects,
            }),
          }),
        );
      })
      .catch(() => {
        pendingProjectMutationsRef.current.delete(id);
        void refreshProjectsFromServer();
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Project delete failed.",
          }),
        );
      });
  }

  function saveContentDirect(item: ContentItem) {
    const snapshot = storeRef.current;
    const existing = snapshot.state.contentItems.find((entry) => entry.id === item.id);
    const normalized = normalizeRecord(item, snapshot.meta.deviceId, existing) as ContentItem;

    pendingContentMutationsRef.current.set(normalized.id, "upsert");

    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          contentItems: updateCollection(current.state.contentItems, normalized),
        }),
      }),
    );

    void (existing ? updateContentItemOnServer(normalized) : createContentItemOnServer(normalized))
      .then((response) => {
        pendingContentMutationsRef.current.delete(normalized.id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              contentItems: response.contentItems,
            }),
          }),
        );
      })
      .catch(() => {
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Content save failed.",
          }),
        );
      })
      .finally(() => {
        void refreshContentItemsFromServer();
      });
  }

  function deleteContentDirect(id: string) {
    pendingContentMutationsRef.current.set(id, "delete");
    setStore((current) =>
      withIndicator({
        ...current,
        state: sortDashboardState({
          ...current.state,
          contentItems: current.state.contentItems.filter((item) => item.id !== id),
        }),
      }),
    );

    void removeContentItemFromServer(id)
      .then((response) => {
        pendingContentMutationsRef.current.delete(id);
        setStore((current) =>
          withIndicator({
            ...current,
            state: sortDashboardState({
              ...current.state,
              contentItems: response.contentItems,
            }),
          }),
        );
      })
      .catch(() => {
        pendingContentMutationsRef.current.delete(id);
        void refreshContentItemsFromServer();
        setStore((current) =>
          withIndicator(current, {
            syncState: "failed",
            lastSyncError: "Content delete failed.",
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
        const preservedNotes = current.state.notes;
        const preservedCalendarItems = current.state.calendarItems;
        const preservedProjects = current.state.projects;
        const preservedContentItems = current.state.contentItems;
        const queue = current.queue.filter((operation) => !response.acknowledgedOperationIds.includes(operation.id));
        const incomingCanonicalState = sortDashboardState(response.state);
        const preservedBrands = preserveCollectionIfIncomingEmpty(current.state.brands, incomingCanonicalState.brands);
        const preservedBrandSpaces = preserveCollectionIfIncomingEmpty(
          current.state.brandSpaces,
          incomingCanonicalState.brandSpaces,
        );
        console.log("[tasks-source] ignored tasks from sync payload", {
          syncPayloadTaskCount: incomingCanonicalState.tasks.length,
          preservedTaskCount: preservedTasks.length,
          canonicalUpdatedAt: response.canonicalUpdatedAt,
        });
        incomingCanonicalState.brands = preservedBrands;
        incomingCanonicalState.brandSpaces = preservedBrandSpaces;
        incomingCanonicalState.tasks = preservedTasks;
        incomingCanonicalState.notes = preservedNotes;
        incomingCanonicalState.calendarItems = preservedCalendarItems;
        incomingCanonicalState.projects = preservedProjects;
        incomingCanonicalState.contentItems = preservedContentItems;
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
          notes: preservedNotes,
          calendarItems: preservedCalendarItems,
          projects: preservedProjects,
          contentItems: preservedContentItems,
        };
        const previousStateSummary = summarizeState(current.state);
        const incomingStateSummary = summarizeState(incomingCanonicalState);
        const resultingStateSummary = summarizeState(state);
        console.log("[brands-runtime] after sync apply", {
          incomingBrandsCount: response.state.brands.length,
          incomingBrandSpacesCount: response.state.brandSpaces.length,
          brandsCountAfterApply: state.brands.length,
          brandSpacesCountAfterApply: state.brandSpaces.length,
        });
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
    void refreshNotesFromServer();
    void refreshCalendarItemsFromServer();
    void refreshProjectsFromServer();
    void refreshContentItemsFromServer();
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
      void refreshNotesFromServer();
      void refreshCalendarItemsFromServer();
      void refreshProjectsFromServer();
      void refreshContentItemsFromServer();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [store.hydrated]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void runSync();
        void refreshTasksFromServer();
        void refreshNotesFromServer();
        void refreshCalendarItemsFromServer();
        void refreshProjectsFromServer();
        void refreshContentItemsFromServer();
      }
    }

    function onFocus() {
      void runSync();
      void refreshTasksFromServer();
      void refreshNotesFromServer();
      void refreshCalendarItemsFromServer();
      void refreshProjectsFromServer();
      void refreshContentItemsFromServer();
    }

    function onPageShow() {
      void runSync();
      void refreshTasksFromServer();
      void refreshNotesFromServer();
      void refreshCalendarItemsFromServer();
      void refreshProjectsFromServer();
      void refreshContentItemsFromServer();
    }

    function onOnline() {
      void runSync();
      void refreshTasksFromServer();
      void refreshNotesFromServer();
      void refreshCalendarItemsFromServer();
      void refreshProjectsFromServer();
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

    console.log("[tasks-source] using direct tasks store", {
      taskCount: visibleState.tasks.length,
      pendingTaskMutations: Array.from(pendingTaskMutationsRef.current.entries()),
    });

    return {
      ...visibleState,
      hydrated: store.hydrated,
      syncIndicator: store.syncIndicator,
      syncNow: runSync,
      saveTask: saveTaskDirect,
      saveNote: saveNoteDirect,
      saveCalendarItem: saveCalendarDirect,
      saveContentItem: saveContentDirect,
      saveProject: saveProjectDirect,
      savePromptItem: (item) => setStore((current) => updateEntityState(current, "promptItems", item)),
      saveDocument: (item) => setStore((current) => updateEntityState(current, "documents", item)),
      saveBrand: (item) => setStore((current) => updateEntityState(current, "brands", item)),
      saveBrandSpace: (item) => setStore((current) => updateEntityState(current, "brandSpaces", item)),
      deleteTask: deleteTaskDirect,
      deleteNote: deleteNoteDirect,
      deleteCalendarItem: deleteCalendarDirect,
      deleteContentItem: deleteContentDirect,
      deleteProject: deleteProjectDirect,
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
