export type BrandId = "aai" | "masteryatelier" | "mo-studio" | "personal" | "biro";

export type Status =
  | "draft"
  | "planned"
  | "active"
  | "in-progress"
  | "scheduled"
  | "completed"
  | "archived";

export type Priority = "low" | "medium" | "high";

export type CalendarItemType = "task" | "content" | "meeting" | "reminder";

export type DocumentType =
  | "blueprint"
  | "guidelines"
  | "brand-world"
  | "campaign"
  | "content-plan"
  | "notes"
  | "business";

export type NoteType = "idea" | "reflection" | "reminder" | "reference";

export type ContentFormat = "feed" | "story" | "reel" | "carousel" | "article";

export type ContentAssetStatus = "needed" | "in-progress" | "ready";

export type ContentCaptionStatus = "none" | "draft" | "ready";

export type ProjectStatus = "active" | "paused" | "completed";

export type AccentTone = "blue" | "yellow" | "orange" | "lime" | "purple" | "cyan";

export type SyncStatus = "synced" | "pending" | "syncing" | "failed" | "conflict";

export interface SyncMetadata {
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  lastSyncedAt?: string | null;
  syncStatus?: SyncStatus;
  deviceUpdatedAt?: string;
}
