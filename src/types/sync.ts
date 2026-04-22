import type { Brand } from "@/types/brand";
import type { BrandSpace } from "@/types/brand-space";
import type { CalendarItem } from "@/types/calendar";
import type { SyncStatus } from "@/types/common";
import type { ContentItem } from "@/types/content";
import type { DocumentItem } from "@/types/document";
import type { NoteItem } from "@/types/note";
import type { ProjectItem } from "@/types/project";
import type { PromptItem } from "@/types/prompt";
import type { TaskItem } from "@/types/task";

export type SyncEntityName =
  | "brands"
  | "brandSpaces"
  | "documents"
  | "tasks"
  | "notes"
  | "calendarItems"
  | "projects"
  | "contentItems"
  | "promptItems";

export type SyncMutationType = "upsert" | "delete";

export type DashboardState = {
  brands: Brand[];
  brandSpaces: BrandSpace[];
  documents: DocumentItem[];
  tasks: TaskItem[];
  notes: NoteItem[];
  calendarItems: CalendarItem[];
  projects: ProjectItem[];
  contentItems: ContentItem[];
  promptItems: PromptItem[];
};

export type SyncOperation = {
  id: string;
  entity: SyncEntityName;
  action: SyncMutationType;
  recordId: string;
  enqueuedAt: string;
  deviceId: string;
  attemptCount: number;
  payload: Record<string, unknown>;
  lastError?: string;
};

export type SyncConflict = {
  entity: SyncEntityName;
  recordId: string;
  incomingUpdatedAt: string;
  canonicalUpdatedAt: string;
  resolution: "incoming-won" | "canonical-kept";
  detectedAt: string;
};

export type PersistedSyncMeta = {
  deviceId: string;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  lastSyncAttemptAt: string | null;
  brandStateVersion?: number;
};

export type SyncIndicatorState = {
  syncState: "idle" | "syncing" | "failed";
  pendingCount: number;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  deviceId: string | null;
};

export type SyncResponse = {
  state: DashboardState;
  acknowledgedOperationIds: string[];
  conflicts: SyncConflict[];
  syncedAt: string;
  canonicalUpdatedAt: string;
};

export type SyncableRecord = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  lastSyncedAt?: string | null;
  syncStatus?: SyncStatus;
  deviceUpdatedAt?: string;
};
