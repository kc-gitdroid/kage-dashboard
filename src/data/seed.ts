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
  TaskItem,
} from "@/types";
import { brands } from "@/data/mock/brands";
import { brandSpaces } from "@/data/mock/brands";
import { calendarItems } from "@/data/mock/calendar";
import { contentItems } from "@/data/mock/content";
import { documents } from "@/data/mock/documents";
import { notes } from "@/data/mock/notes";
import { projects } from "@/data/mock/projects";
import { promptItems } from "@/data/mock/prompts";
import { tasks } from "@/data/mock/tasks";

function withSeedMetadata<
  T extends {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    lastSyncedAt?: string | null;
    syncStatus?: string;
    deviceUpdatedAt?: string;
  },
>(
  items: T[],
  deviceId = "seed",
): T[] {
  const seededAt = "2026-04-10T00:00:00.000Z";
  return items.map((item) => ({
    ...item,
    createdAt: item.createdAt ?? seededAt,
    updatedAt: item.updatedAt ?? item.createdAt ?? seededAt,
    deletedAt: item.deletedAt ?? null,
    lastSyncedAt: item.lastSyncedAt ?? seededAt,
    syncStatus: item.syncStatus ?? "synced",
    deviceUpdatedAt: item.deviceUpdatedAt ?? deviceId,
  }));
}

function sortTasks(items: TaskItem[]) {
  return [...items].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

function sortNotes(items: NoteItem[]) {
  return [...items].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}

function sortCalendarItems(items: CalendarItem[]) {
  return [...items].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

function sortContentItems(items: ContentItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.scheduleDate ? new Date(a.scheduleDate).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.scheduleDate ? new Date(b.scheduleDate).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
}

function sortDocuments(items: DocumentItem[]) {
  return [...items].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
}

function sortProjects(items: ProjectItem[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.dueDate ?? a.startDate).getTime();
    const bTime = new Date(b.dueDate ?? b.startDate).getTime();
    return aTime - bTime;
  });
}

function sortPromptItems(items: PromptItem[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function createSeedDashboardState(deviceId = "seed"): DashboardState {
  return {
    brands: withSeedMetadata<Brand>(brands, deviceId),
    brandSpaces: withSeedMetadata<BrandSpace>(brandSpaces, deviceId),
    documents: sortDocuments(withSeedMetadata<DocumentItem>(documents, deviceId)),
    tasks: sortTasks(withSeedMetadata<TaskItem>(tasks, deviceId)),
    notes: sortNotes(withSeedMetadata<NoteItem>(notes, deviceId)),
    calendarItems: sortCalendarItems(withSeedMetadata<CalendarItem>(calendarItems, deviceId)),
    projects: sortProjects(withSeedMetadata<ProjectItem>(projects, deviceId)),
    contentItems: sortContentItems(withSeedMetadata<ContentItem>(contentItems, deviceId)),
    promptItems: sortPromptItems(withSeedMetadata<PromptItem>(promptItems, deviceId)),
  };
}
