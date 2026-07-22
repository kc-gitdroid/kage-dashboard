"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { PreviewDrawer } from "@/components/preview-drawer";
import { createLocalRecordId, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { brandWorkspaceOrder, calendarTypes, contentFormats, normalizeThinkingType, taskCategories, taskPriorities, taskStatuses, thinkingTypes } from "@/data";
import { formatTokenLabel } from "@/lib/format-token-label";
import {
  BrandId,
  CalendarItem,
  CalendarItemType,
  ContentAssetStatus,
  ContentCaptionStatus,
  ContentFormat,
  ContentItem,
  NoteItem,
  ThinkingType,
  Priority,
  Status,
  TaskCategory,
  TaskItem,
} from "@/types";

type TodayRow = {
  key: string;
  id: string;
  title: string;
  brandId: BrandId;
  type: string;
  targetType: "task" | "calendar" | "content";
  timing: string;
  sortTime: number;
  isOverdue: boolean;
  isHighPriority: boolean;
};

type UpcomingRow = {
  key: string;
  id: string;
  title: string;
  brandId: BrandId;
  type: string;
  targetType: "task" | "calendar" | "content";
  timing: string;
  sortTime: number;
};

type BrandSnapshotRow = {
  id: string;
  label: string;
  timing: string;
  sortTime: number;
};

type QuickActionId = "task" | "note" | "calendar" | "content";

type TaskDraft = {
  id?: string;
  title: string;
  brandId: BrandId;
  dueDate: string;
  priority: Priority;
  category: TaskCategory;
  status: Status;
  projectId: string;
  notes: string;
};

type NoteDraft = {
  id?: string;
  title: string;
  brandId?: BrandId;
  type: ThinkingType;
  body: string;
};

type ContentDraft = {
  id?: string;
  title: string;
  brandId: BrandId;
  format: ContentFormat;
  pillar: string;
  captionStatus: ContentCaptionStatus;
  assetStatus: ContentAssetStatus;
  scheduleDate: string;
  status: Status;
  linkedProjectId: string;
};

type CalendarDraft = {
  id?: string;
  title: string;
  brandId: BrandId;
  type: CalendarItemType;
  start: string;
  end: string;
  status: Status;
  linkedTaskId: string;
  linkedProjectId: string;
  linkedContentId: string;
  notes: string;
};

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const HYDRATION_SAFE_NOW = new Date("2026-04-29T00:00:00");

function parseDateParts(value: string) {
  const [datePart, timePart = "00:00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map((part) => Number(part));
  const [hour, minute] = timePart.split(":").map((part) => Number(part));
  return { year, month, day, hour, minute };
}

function formatHourMinute(value: string) {
  const { hour, minute } = parseDateParts(value);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatMonthDay(value: string) {
  const { month, day } = parseDateParts(value);
  return `${MONTH_LABELS[month - 1]} ${String(day).padStart(2, "0")}`;
}

function formatMonthDayTime(value: string) {
  return `${formatMonthDay(value)} at ${formatHourMinute(value)}`;
}

function formatRelativeDay(value: string, today: Date) {
  const itemDay = startOfDay(new Date(value)).getTime();
  const todayDay = startOfDay(today).getTime();
  const diffDays = Math.round((itemDay - todayDay) / 86400000);

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Tomorrow";
  }

  return formatMonthDay(value);
}

const quickActions: {
  id: QuickActionId;
  label: string;
  hint: string;
}[] = [
  {
    id: "task",
    label: "New Action",
    hint: "Capture a next move with ownership, due date, and priority without leaving the command flow.",
  },
  {
    id: "note",
    label: "New Thinking",
    hint: "Drop in an observation, reference, caption idea, or creative direction before it disappears.",
  },
  {
    id: "calendar",
    label: "New Calendar Item",
    hint: "Add a scheduled block, meeting, reminder, or planning marker without leaving the command flow.",
  },
  {
    id: "content",
    label: "New Post",
    hint: "Start a planned post with format, pillar, and timing while the direction is still clear.",
  },
];

const initialNoteDraft: NoteDraft = {
  title: "",
  brandId: "personal",
  type: thinkingTypes[0],
  body: "",
};

const initialContentDraft: ContentDraft = {
  title: "",
  brandId: "aai",
  format: "reel",
  pillar: "",
  captionStatus: "draft",
  assetStatus: "needed",
  scheduleDate: "",
  status: "planned",
  linkedProjectId: "",
};

function formatLocalDateInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalDateTimeInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function createInitialTaskDraft(referenceDate = new Date()): TaskDraft {
  return {
    title: "",
    brandId: "aai",
    dueDate: formatLocalDateInput(referenceDate),
    priority: "medium",
    category: "content",
    status: "planned",
    projectId: "",
    notes: "",
  };
}

function createInitialCalendarDraft(referenceDate = new Date()): CalendarDraft {
  const start = new Date(referenceDate);
  start.setHours(10, 0, 0, 0);

  return {
    title: "",
    brandId: "aai",
    type: "task",
    start: formatLocalDateTimeInput(start),
    end: "",
    status: "planned",
    linkedTaskId: "",
    linkedProjectId: "",
    linkedContentId: "",
    notes: "",
  };
}

const noteTypeOptions = thinkingTypes.map((type) => ({ value: type, label: type }));
const contentStatusOptions: Status[] = ["draft", "planned", "in-progress", "scheduled", "completed"];
const captionStatusOptions: ContentCaptionStatus[] = ["none", "draft", "ready"];
const assetStatusOptions: ContentAssetStatus[] = ["needed", "in-progress", "ready"];
const calendarStatusOptions: Status[] = ["planned", "active", "scheduled", "completed"];

function toTaskDraft(task: TaskItem): TaskDraft {
  return {
    id: task.id,
    title: task.title,
    brandId: task.brandId,
    dueDate: task.dueDate,
    priority: task.priority,
    category: task.category,
    status: task.status,
    projectId: task.projectId ?? "",
    notes: task.notes ?? "",
  };
}

function toNoteDraft(note: NoteItem): NoteDraft {
  return {
    id: note.id,
    title: note.title,
    brandId: note.brandId,
    type: normalizeThinkingType(note.type),
    body: note.body,
  };
}

function toContentDraft(item: ContentItem): ContentDraft {
  return {
    id: item.id,
    title: item.title,
    brandId: item.brandId,
    format: item.format,
    pillar: item.pillar,
    captionStatus: item.captionStatus,
    assetStatus: item.assetStatus,
    scheduleDate: item.scheduleDate ? item.scheduleDate.slice(0, 16) : "",
    status: item.status,
    linkedProjectId: item.linkedProjectId ?? "",
  };
}

function toCalendarDraft(item: CalendarItem): CalendarDraft {
  return {
    id: item.id,
    title: item.title,
    brandId: item.brandId,
    type: item.type,
    start: item.start.slice(0, 16),
    end: item.end ? item.end.slice(0, 16) : "",
    status: item.status,
    linkedTaskId: item.linkedTaskId ?? "",
    linkedProjectId: item.linkedProjectId ?? "",
    linkedContentId: item.linkedContentId ?? "",
    notes: item.notes ?? "",
  };
}

export function HomePage() {
  const router = useRouter();
  const {
    brands,
    brandSpaces,
    projects,
    tasks,
    notes,
    calendarItems,
    contentItems,
    promptItems,
    saveTask,
    saveNote,
    saveCalendarItem,
    saveContentItem,
    deleteTask,
    deleteNote,
    deleteCalendarItem,
    deleteContentItem,
  } = useDashboardData();
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(() => createInitialTaskDraft());
  const [taskDrawerMode, setTaskDrawerMode] = useState<"create" | "edit" | null>(null);
  const [noteDraft, setNoteDraft] = useState<NoteDraft>(initialNoteDraft);
  const [noteDrawerMode, setNoteDrawerMode] = useState<"create" | "edit" | null>(null);
  const [contentDraft, setContentDraft] = useState<ContentDraft>(initialContentDraft);
  const [contentDrawerMode, setContentDrawerMode] = useState<"create" | "edit" | null>(null);
  const [calendarDraft, setCalendarDraft] = useState<CalendarDraft>(() => createInitialCalendarDraft());
  const [calendarDrawerMode, setCalendarDrawerMode] = useState<"create" | "edit" | null>(null);
  const [taskConfirmDelete, setTaskConfirmDelete] = useState(false);
  const [noteConfirmDelete, setNoteConfirmDelete] = useState(false);
  const [contentConfirmDelete, setContentConfirmDelete] = useState(false);
  const [calendarConfirmDelete, setCalendarConfirmDelete] = useState(false);
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Set<string>>(() => new Set());
  const [today, setToday] = useState(HYDRATION_SAFE_NOW);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const todayStart = startOfDay(today);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const nextWeekEnd = new Date(todayStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 8);

  const todayRows: TodayRow[] = [
    ...tasks
      .filter((task) => task.status !== "completed" && new Date(task.dueDate) < todayStart)
      .map((task) => ({
        key: `${task.id}-overdue`,
        id: task.id,
        title: task.title,
        brandId: task.brandId,
        type: "overdue action",
        targetType: "task" as const,
        timing: `Due ${formatMonthDay(task.dueDate)}`,
        sortTime: new Date(task.dueDate).getTime(),
        isOverdue: true,
        isHighPriority: task.priority === "high",
      })),
    ...tasks
      .filter((task) => task.status !== "completed" && startOfDay(new Date(task.dueDate)).getTime() === todayStart.getTime())
      .map((task) => ({
        key: `${task.id}-today`,
        id: task.id,
        title: task.title,
        brandId: task.brandId,
        type: "action",
        targetType: "task" as const,
        timing: `Due today`,
        sortTime: new Date(task.dueDate).getTime(),
        isOverdue: false,
        isHighPriority: task.priority === "high",
      })),
    ...calendarItems
      .filter((item) => startOfDay(new Date(item.start)).getTime() === todayStart.getTime())
      .map((item) => ({
        key: item.id,
        id: item.id,
        title: item.title,
        brandId: item.brandId,
        type: item.type,
        targetType: "calendar" as const,
        timing: formatHourMinute(item.start),
        sortTime: new Date(item.start).getTime(),
        isOverdue: false,
        isHighPriority: false,
      })),
    ...contentItems
      .filter((item) => {
        if (item.status === "completed" || item.status === "archived") {
          return false;
        }

        if (item.scheduleDate) {
          return new Date(item.scheduleDate) < todayStart;
        }

        return false;
      })
      .map((item) => ({
        key: `${item.id}-overdue-content`,
        id: item.id,
        title: item.title,
        brandId: item.brandId,
        type: "overdue post",
        targetType: "content" as const,
        timing: item.scheduleDate ? `Due ${formatMonthDay(item.scheduleDate)}` : "Needs attention",
        sortTime: item.scheduleDate ? new Date(item.scheduleDate).getTime() : todayStart.getTime() - 1,
        isOverdue: true,
        isHighPriority: item.status === "in-progress" || item.status === "active",
      })),
    ...contentItems
      .filter((item) => {
        if (item.status === "completed" || item.status === "archived") {
          return false;
        }

        return item.scheduleDate ? startOfDay(new Date(item.scheduleDate)).getTime() === todayStart.getTime() : false;
      })
      .map((item) => ({
        key: item.id,
        id: item.id,
        title: item.title,
        brandId: item.brandId,
        type: "scheduled post",
        targetType: "content" as const,
        timing: formatHourMinute(item.scheduleDate as string),
        sortTime: new Date(item.scheduleDate as string).getTime(),
        isOverdue: false,
        isHighPriority: item.status === "in-progress" || item.status === "active",
      })),
    ...contentItems
      .filter((item) => {
        if (item.status !== "in-progress" && item.status !== "active") {
          return false;
        }

        if (!item.scheduleDate) {
          return true;
        }

        return startOfDay(new Date(item.scheduleDate)).getTime() === todayStart.getTime();
      })
      .map((item) => ({
        key: `${item.id}-active-content`,
        id: item.id,
        title: item.title,
        brandId: item.brandId,
        type: "active post",
        targetType: "content" as const,
        timing: item.scheduleDate ? `Today / ${formatHourMinute(item.scheduleDate)}` : "Needs attention",
        sortTime: item.scheduleDate ? new Date(item.scheduleDate).getTime() : todayStart.getTime() + 12 * 60 * 60 * 1000,
        isOverdue: false,
        isHighPriority: true,
      })),
  ]
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) {
        return a.isOverdue ? -1 : 1;
      }
      if (a.isHighPriority !== b.isHighPriority) {
        return a.isHighPriority ? -1 : 1;
      }
      return a.sortTime - b.sortTime;
    })
    .slice(0, 5);

  const upcomingRows: UpcomingRow[] = [
    ...calendarItems
      .filter((item) => {
        const start = new Date(item.start);
        return start >= tomorrowStart && start < nextWeekEnd;
      })
      .map((item) => ({
        key: item.id,
        id: item.id,
        title: item.title,
        brandId: item.brandId,
        type: item.type,
        targetType: "calendar" as const,
        timing: formatMonthDayTime(item.start),
        sortTime: new Date(item.start).getTime(),
      })),
    ...contentItems
      .filter((item) => {
        if (!item.scheduleDate || item.status === "completed" || item.status === "archived") {
          return false;
        }
        const start = new Date(item.scheduleDate);
        return start >= tomorrowStart && start < nextWeekEnd;
      })
      .map((item) => ({
        key: item.id,
        id: item.id,
        title: item.title,
        brandId: item.brandId,
        type: "scheduled post",
        targetType: "content" as const,
        timing: formatMonthDayTime(item.scheduleDate as string),
        sortTime: new Date(item.scheduleDate as string).getTime(),
      })),
    ...tasks
      .filter((task) => {
        const due = startOfDay(new Date(task.dueDate));
        return task.status !== "completed" && due >= tomorrowStart && due < nextWeekEnd;
      })
      .map((task) => ({
        key: task.id,
        id: task.id,
        title: task.title,
        brandId: task.brandId,
        type: "action deadline",
        targetType: "task" as const,
        timing: `Due ${formatMonthDay(task.dueDate)}`,
        sortTime: new Date(task.dueDate).getTime(),
      })),
  ]
    .sort((a, b) => a.sortTime - b.sortTime)
    .slice(0, 5);

  const recentThinking = [...notes]
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt ?? a.createdAt).getTime();
      const bTime = new Date(b.updatedAt ?? b.createdAt).getTime();
      return bTime - aTime;
    })
    .slice(0, 5);

  const publishingThisWeek = brandSpaces
    .flatMap((brand) =>
      (brand.publishingCalendar ?? []).map((post) => ({
        ...post,
        brand,
        pillar: brand.contentSystem?.contentPillars?.find((pillar) => pillar.id === post.pillarId),
      })),
    )
    .filter((post) => {
      const date = startOfDay(new Date(post.date));
      return date >= todayStart && date < nextWeekEnd;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const brandSnapshots = [...brandSpaces]
    .sort((a, b) => brandWorkspaceOrder.indexOf(a.id) - brandWorkspaceOrder.indexOf(b.id))
    .map((brand) => {
    const activeProjectCount = projects.filter((project) => project.brandId === brand.id && project.status === "active").length;
    const activeActionCount =
      (brand.actions ?? []).filter((action) => action.status !== "Done").length ||
      tasks.filter((task) => task.brandId === brand.id && task.status !== "completed").length;
    const upcomingScheduledPosts = (brand.publishingCalendar ?? []).filter((post) => {
      const date = startOfDay(new Date(post.date));
      return date >= todayStart && date < nextWeekEnd;
    }).length;
    const scheduledContentCount = upcomingScheduledPosts || contentItems.filter(
      (item) => item.brandId === brand.id && item.status === "scheduled" && item.scheduleDate,
    ).length;
    const thinkingCount = notes.filter((note) => note.brandId === brand.id).length + (brand.thinking ?? []).length;
    const promptCount = promptItems.filter((prompt) => prompt.brandId === brand.id).length;

    const nextCandidates: BrandSnapshotRow[] = [
      ...(brand.actions ?? [])
        .filter((action) => action.status !== "Done")
        .map((action) => ({
          id: action.id,
          label: action.title,
          timing: action.dueDate ? `Action / Due ${formatRelativeDay(action.dueDate, today)}` : `Action / ${action.status ?? "Next"}`,
          sortTime: action.dueDate ? new Date(action.dueDate).getTime() : todayStart.getTime(),
        })),
      ...(brand.publishingCalendar ?? [])
        .filter((post) => new Date(post.date) >= todayStart)
        .map((post) => ({
          id: post.id,
          label: post.title,
          timing: `Publishing / ${formatMonthDay(post.date)}`,
          sortTime: new Date(post.date).getTime(),
        })),
      ...tasks
        .filter((task) => task.brandId === brand.id && task.status !== "completed")
        .map((task) => ({
          id: task.id,
          label: task.title,
          timing: `Action deadline / ${formatRelativeDay(task.dueDate, today)}`,
          sortTime: new Date(task.dueDate).getTime(),
        })),
      ...calendarItems
        .filter((item) => item.brandId === brand.id && new Date(item.start) >= today)
        .map((item) => ({
          id: item.id,
          label: item.title,
          timing: `${formatTokenLabel(item.type)} / ${formatMonthDayTime(item.start)}`,
          sortTime: new Date(item.start).getTime(),
        })),
      ...contentItems
        .filter((item) => item.brandId === brand.id && item.scheduleDate && new Date(item.scheduleDate) >= today)
        .map((item) => ({
          id: item.id,
          label: item.title,
          timing: `Post / ${formatMonthDayTime(item.scheduleDate as string)}`,
          sortTime: new Date(item.scheduleDate as string).getTime(),
        })),
      ...projects
        .filter((project) => project.brandId === brand.id && project.status !== "completed" && project.dueDate && new Date(project.dueDate) >= todayStart)
        .map((project) => ({
          id: project.id,
          label: project.title,
          timing: `Project / Due ${formatRelativeDay(project.dueDate as string, today)}`,
          sortTime: new Date(project.dueDate as string).getTime(),
        })),
    ].sort((a, b) => a.sortTime - b.sortTime);

      return {
        ...brand,
        activeProjectCount,
        openTaskCount: activeActionCount,
        scheduledContentCount,
        thinkingCount,
        promptCount,
        nextPriority: nextCandidates[0],
      };
    });

  console.log("[brands-runtime] task form selector render", {
    brandsCount: brands.length,
    brandOptionCount: brands.length,
  });

  function openQuickAction(action: QuickActionId) {
    if (action === "task") {
      openTaskCreate();
      return;
    }

    if (action === "note") {
      openNoteCreate();
      return;
    }

    if (action === "calendar") {
      openCalendarCreate();
      return;
    }

    if (action === "content") {
      openContentCreate();
      return;
    }
  }

  function openTaskCreate() {
    setTaskDraft(createInitialTaskDraft(today));
    setTaskDrawerMode("create");
    setTaskConfirmDelete(false);
  }

  function openTaskEdit(task: TaskItem) {
    setTaskDraft(toTaskDraft(task));
    setTaskDrawerMode("edit");
    setTaskConfirmDelete(false);
  }

  function closeTaskDrawer() {
    setTaskDrawerMode(null);
    setTaskDraft(createInitialTaskDraft(today));
    setTaskConfirmDelete(false);
  }

  function handleTaskSave() {
    if (!taskDraft.title.trim() || !taskDraft.dueDate) {
      return;
    }

    saveTask({
      id: taskDraft.id ?? createLocalRecordId("task"),
      title: taskDraft.title.trim(),
      brandId: taskDraft.brandId,
      dueDate: taskDraft.dueDate,
      priority: taskDraft.priority,
      category: taskDraft.category,
      status: taskDraft.status,
      projectId: taskDraft.projectId.trim() || undefined,
      notes: taskDraft.notes.trim() || undefined,
    });

    closeTaskDrawer();
  }

  function handleTaskDelete() {
    if (!taskDraft.id) {
      return;
    }

    deleteTask(taskDraft.id);
    closeTaskDrawer();
  }

  function openNoteCreate() {
    setNoteDraft(initialNoteDraft);
    setNoteDrawerMode("create");
    setNoteConfirmDelete(false);
  }

  function openNoteEdit(note: NoteItem) {
    setNoteDraft(toNoteDraft(note));
    setNoteDrawerMode("edit");
    setNoteConfirmDelete(false);
  }

  function toggleThinkingExpanded(noteId: string) {
    setExpandedThinkingIds((current) => {
      const next = new Set(current);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  }

  function closeNoteDrawer() {
    setNoteDrawerMode(null);
    setNoteDraft(initialNoteDraft);
    setNoteConfirmDelete(false);
  }

  function handleNoteSave() {
    if (!noteDraft.title.trim() || !noteDraft.body.trim()) {
      return;
    }

    const existing = noteDraft.id ? notes.find((note) => note.id === noteDraft.id) : undefined;
    saveNote({
      id: noteDraft.id ?? createLocalRecordId("note"),
      title: noteDraft.title.trim(),
      brandId: noteDraft.brandId,
      type: noteDraft.type,
      body: noteDraft.body.trim(),
      possibleUse: existing?.possibleUse,
      status: existing?.status,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });

    closeNoteDrawer();
  }

  function handleNoteDelete() {
    if (!noteDraft.id) {
      return;
    }

    deleteNote(noteDraft.id);
    closeNoteDrawer();
  }

  function openContentCreate() {
    setContentDraft(initialContentDraft);
    setContentDrawerMode("create");
    setContentConfirmDelete(false);
  }

  function openContentEdit(item: ContentItem) {
    setContentDraft(toContentDraft(item));
    setContentDrawerMode("edit");
    setContentConfirmDelete(false);
  }

  function closeContentDrawer() {
    setContentDrawerMode(null);
    setContentDraft(initialContentDraft);
    setContentConfirmDelete(false);
  }

  function handleContentSave() {
    if (!contentDraft.title.trim() || !contentDraft.pillar.trim()) {
      return;
    }

    saveContentItem({
      id: contentDraft.id ?? createLocalRecordId("content"),
      title: contentDraft.title.trim(),
      brandId: contentDraft.brandId,
      format: contentDraft.format,
      pillar: contentDraft.pillar.trim(),
      captionStatus: contentDraft.captionStatus,
      assetStatus: contentDraft.assetStatus,
      scheduleDate: contentDraft.scheduleDate ? new Date(contentDraft.scheduleDate).toISOString().slice(0, 19) : undefined,
      status: contentDraft.status,
      linkedProjectId: contentDraft.linkedProjectId.trim() || undefined,
    });

    closeContentDrawer();
  }

  function handleContentDelete() {
    if (!contentDraft.id) {
      return;
    }

    deleteContentItem(contentDraft.id);
    closeContentDrawer();
  }

  function openCalendarCreate() {
    setCalendarDraft(createInitialCalendarDraft(today));
    setCalendarDrawerMode("create");
    setCalendarConfirmDelete(false);
  }

  function openCalendarEdit(item: CalendarItem) {
    setCalendarDraft(toCalendarDraft(item));
    setCalendarDrawerMode("edit");
    setCalendarConfirmDelete(false);
  }

  function closeCalendarDrawer() {
    setCalendarDrawerMode(null);
    setCalendarDraft(createInitialCalendarDraft(today));
    setCalendarConfirmDelete(false);
  }

  function handleCalendarSave() {
    if (!calendarDraft.title.trim() || !calendarDraft.start) {
      return;
    }

    saveCalendarItem({
      id: calendarDraft.id ?? createLocalRecordId("calendar"),
      title: calendarDraft.title.trim(),
      brandId: calendarDraft.brandId,
      type: calendarDraft.type,
      start: new Date(calendarDraft.start).toISOString().slice(0, 19),
      end: calendarDraft.end ? new Date(calendarDraft.end).toISOString().slice(0, 19) : undefined,
      status: calendarDraft.status,
      linkedTaskId: calendarDraft.linkedTaskId.trim() || undefined,
      linkedProjectId: calendarDraft.linkedProjectId.trim() || undefined,
      linkedContentId: calendarDraft.linkedContentId.trim() || undefined,
      notes: calendarDraft.notes.trim() || undefined,
    });

    closeCalendarDrawer();
  }

  function handleCalendarDelete() {
    if (!calendarDraft.id) {
      return;
    }

    deleteCalendarItem(calendarDraft.id);
    closeCalendarDrawer();
  }

  function openHomeItem(item: { id: string; targetType: "task" | "calendar" | "content" }) {
    if (item.targetType === "task") {
      const match = tasks.find((task) => task.id === item.id);
      if (match) {
        openTaskEdit(match);
      }
      return;
    }

    if (item.targetType === "content") {
      const match = contentItems.find((entry) => entry.id === item.id);
      if (match) {
        openContentEdit(match);
      }
      return;
    }

    const match = calendarItems.find((entry) => entry.id === item.id);
    if (match) {
      openCalendarEdit(match);
    }
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-3 overflow-x-hidden md:space-y-4">
      <section className="flex flex-col gap-3 xl:grid xl:grid-cols-[1.04fr_0.96fr] xl:items-start xl:gap-3">
        <div className="contents xl:block xl:space-y-3">
          <Panel
            eyebrow="Home / Today"
            title="Today"
            subtitle="Only the work that needs attention now."
            accent="blue"
            className="order-1"
          >
            <div className="space-y-3">
              {todayRows.map((item, index) => {
                const brand = brands.find((entry) => entry.id === item.brandId);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => openHomeItem(item)}
                    className={`touch-manipulation w-full rounded-2xl border px-4 py-3 text-left transition hover:border-white/12 ${
                      item.isOverdue
                        ? "border-orange/35 bg-orange/8"
                        : index === 0
                          ? "border-blue/35 bg-blue/8"
                          : "border-white/6 bg-black/10"
                    }`}
                  >
                    <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-display text-[10px] uppercase tracking-[0.16em] text-mute">{formatTokenLabel(item.type)}</span>
                      <span className="text-[11px] text-mute">{item.timing}</span>
                      {brand ? <BrandPill color={brand.color}>{brand.shortName}</BrandPill> : null}
                    </div>
                  </button>
                );
              })}
              {todayRows.length === 0 ? (
                <div className="rounded-2xl border border-white/6 bg-black/10 px-4 py-4 text-sm text-mute">
                  Nothing urgent right now.
                </div>
              ) : null}
              <button type="button" onClick={() => router.push("/tasks")} className="text-sm text-mute transition hover:text-ink">
                View all actions
              </button>
            </div>
          </Panel>

          <Panel
            eyebrow="Home / Workspaces"
            title="Workspace Status"
            subtitle="A compact read on active work across every brand."
            accent="lime"
            className="order-6"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {brandSnapshots.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => router.push(`/brands/${brand.id}`)}
                  className="min-w-0 rounded-2xl border border-white/6 bg-white/[0.02] p-4 text-left transition hover:border-white/12"
                  style={{ boxShadow: `inset 0 1px 0 0 ${brand.color}20` }}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: brand.color }} />
                    <h3 className="truncate text-sm font-semibold text-ink">{brand.shortName}</h3>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-mute">{brand.description}</p>
                  <p className="mt-3 text-xs text-mute">
                    {brand.activeProjectCount} projects · {brand.openTaskCount} actions · {brand.scheduledContentCount} posts
                  </p>
                  <p className="mt-2 truncate text-xs text-ink">
                    {brand.nextPriority ? `Next: ${brand.nextPriority.label}` : "No immediate priority"}
                  </p>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="contents xl:block xl:space-y-3">
          <Panel
            eyebrow="Home / Upcoming"
            title="Upcoming"
            subtitle="The next seven days, ordered by timing."
            className="order-2"
          >
            <div className="space-y-3">
              {upcomingRows.map((item) => {
                const brand = brands.find((entry) => entry.id === item.brandId);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => openHomeItem(item)}
                    className="touch-manipulation w-full rounded-2xl border border-white/6 bg-black/10 px-4 py-3 text-left transition hover:border-white/12"
                  >
                    <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-display text-[10px] uppercase tracking-[0.16em] text-mute">{formatTokenLabel(item.type)}</span>
                      <span className="text-[11px] text-mute">{item.timing}</span>
                      {brand ? <BrandPill color={brand.color}>{brand.shortName}</BrandPill> : null}
                    </div>
                  </button>
                );
              })}
              {upcomingRows.length === 0 ? (
                <div className="rounded-2xl border border-white/6 bg-black/10 px-4 py-4 text-sm text-mute">
                  Nothing major is scheduled in the next seven days.
                </div>
              ) : null}
              <button type="button" onClick={() => router.push("/calendar")} className="text-sm text-mute transition hover:text-ink">
                Open calendar
              </button>
            </div>
          </Panel>

          <Panel
            eyebrow="Home / Thinking"
            title="Recent Thinking"
            subtitle="The latest observations and creative direction across every workspace."
            accent="yellow"
            className="order-3"
          >
            <div className="space-y-3">
              {recentThinking.map((note) => {
                const brand = brands.find((entry) => entry.id === note.brandId);
                const isExpanded = expandedThinkingIds.has(note.id);
                return (
                  <div
                    key={note.id}
                    className="w-full rounded-2xl border border-white/6 bg-black/10 px-4 py-3 transition hover:border-white/12"
                  >
                    <button
                      type="button"
                      onClick={() => openNoteEdit(note)}
                      className="min-w-0 max-w-full touch-manipulation text-left"
                    >
                      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                          {note.title.trim() || note.body.split("\n")[0]?.trim() || "Untitled thinking"}
                        </p>
                        {brand ? <BrandPill color={brand.color}>{brand.shortName}</BrandPill> : null}
                      </div>
                      <p
                        className={`mt-2 max-w-full break-words text-sm leading-5 text-mute [overflow-wrap:anywhere] ${
                          isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"
                        }`}
                      >
                        {note.body}
                      </p>
                    </button>
                    <div className="mt-2 flex min-w-0 items-center justify-between gap-3">
                      <p className="min-w-0 truncate font-display text-[10px] uppercase tracking-[0.14em] text-mute">
                        {normalizeThinkingType(note.type)} · Updated {formatMonthDay(note.updatedAt ?? note.createdAt)}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleThinkingExpanded(note.id)}
                        aria-label={isExpanded ? `Collapse ${note.title}` : `Expand ${note.title}`}
                        aria-expanded={isExpanded}
                        className="flex h-6 w-6 shrink-0 touch-manipulation items-center justify-center rounded-full text-lg leading-none text-mute transition hover:bg-black/10 hover:text-ink"
                      >
                        <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              {recentThinking.length === 0 ? (
                <div className="rounded-2xl border border-white/6 bg-black/10 px-4 py-4 text-sm text-mute">
                  No thinking records yet. Capture an observation or creative direction from Quick Add.
                </div>
              ) : null}
              <button type="button" onClick={() => router.push("/notes")} className="text-sm text-mute transition hover:text-ink">
                View all thinking
              </button>
            </div>
          </Panel>

          <Panel
            eyebrow="Home / Publishing"
            title="Publishing This Week"
            subtitle="Scheduled posts across all workspaces."
            accent="lime"
            className="order-4"
          >
            <div className="space-y-3">
              {publishingThisWeek.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => router.push(`/brands/${post.brand.id}#publishing-calendar`)}
                  className="w-full rounded-2xl border border-white/6 bg-black/10 px-4 py-3 text-left transition hover:border-white/12"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{post.title}</p>
                    <BrandPill color={post.brand.color}>{post.brand.shortName}</BrandPill>
                  </div>
                  <p className="mt-2 text-xs text-mute">{formatMonthDay(post.date)} · {post.status ?? "Scheduled"}</p>
                </button>
              ))}
              {publishingThisWeek.length === 0 ? (
                <div className="rounded-2xl border border-white/6 bg-black/10 px-4 py-4 text-sm text-mute">
                  No posts are scheduled in the next seven days.
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel
            eyebrow="Home / Quick Add"
            title="Quick Add"
            subtitle="Capture the next item without leaving Home."
            accent="yellow"
            className="order-5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openQuickAction(item.id)}
                  className={`touch-manipulation flex min-w-0 items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    index === 0
                      ? "border-yellow/20 bg-yellow/6 hover:border-yellow/35"
                      : "border-white/6 bg-white/[0.02] hover:border-white/12"
                  }`}
                >
                  <span className="font-display text-[10px] uppercase tracking-[0.16em] text-ink">{item.label}</span>
                  <span className="font-display text-lg text-mute">+</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <PreviewDrawer
        open={Boolean(taskDrawerMode)}
        onClose={closeTaskDrawer}
        eyebrow={`Home / Actions / ${taskDrawerMode === "edit" ? "Edit" : "Create"}`}
        title={taskDrawerMode === "edit" ? "Edit action" : "New action"}
        subtitle="Action changes save locally and keep you in the Home workflow."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={taskDraft.title}
              onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Enter action title"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSelect
              label="Brand"
              value={taskDraft.brandId}
              onChange={(value) => setTaskDraft((current) => ({ ...current, brandId: value as BrandId }))}
              options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
            />
            <FieldSelect
              label="Status"
              value={taskDraft.status}
              onChange={(value) => setTaskDraft((current) => ({ ...current, status: value as Status }))}
              options={taskStatuses.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
            <FieldSelect
              label="Priority"
              value={taskDraft.priority}
              onChange={(value) => setTaskDraft((current) => ({ ...current, priority: value as Priority }))}
              options={taskPriorities.map((priority) => ({ value: priority, label: formatTokenLabel(priority) }))}
            />
            <FieldSelect
              label="Category"
              value={taskDraft.category}
              onChange={(value) => setTaskDraft((current) => ({ ...current, category: value as TaskCategory }))}
              options={taskCategories.map((category) => ({ value: category, label: formatTokenLabel(category) }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Due Date</label>
              <input
                type="date"
                value={taskDraft.dueDate}
                onChange={(event) => setTaskDraft((current) => ({ ...current, dueDate: event.target.value }))}
                className="date-field w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-ink outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Project ID</label>
              <input
                value={taskDraft.projectId}
                onChange={(event) => setTaskDraft((current) => ({ ...current, projectId: event.target.value }))}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Context</label>
            <textarea
              rows={4}
              value={taskDraft.notes}
              onChange={(event) => setTaskDraft((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Context or reminders"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-mute"
            />
          </div>

          <button
            type="button"
            onClick={handleTaskSave}
            className="w-full rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            {taskDrawerMode === "edit" ? "Save Action" : "Add Action"}
          </button>

          {taskDrawerMode === "edit" && taskDraft.id && (
            !taskConfirmDelete ? (
              <button
                type="button"
                onClick={() => setTaskConfirmDelete(true)}
                className="w-full rounded-2xl border border-orange/35 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
              >
                Delete Action
              </button>
            ) : (
              <div className="space-y-3 rounded-2xl border border-orange/20 bg-orange/5 p-4">
                <p className="text-sm text-mute">Delete this action from the dashboard? Home and action views will update immediately.</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleTaskDelete}
                    className="flex-1 rounded-2xl border border-orange/35 bg-orange/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskConfirmDelete(false)}
                    className="flex-1 rounded-2xl border border-white/8 px-4 py-3 text-sm text-mute"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </PreviewDrawer>

      <PreviewDrawer
        open={Boolean(noteDrawerMode)}
        onClose={closeNoteDrawer}
        eyebrow={`Home / Thinking / ${noteDrawerMode === "edit" ? "Edit" : "Create"}`}
        title={noteDrawerMode === "edit" ? "Edit thinking" : "New thinking"}
        subtitle="Thinking changes save locally and keep you in the Home workflow."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={noteDraft.title}
              onChange={(event) => setNoteDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Capture thinking title"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSelect
              label="Brand"
              value={noteDraft.brandId ?? ""}
              onChange={(value) => setNoteDraft((current) => ({ ...current, brandId: value ? (value as BrandId) : undefined }))}
              options={[{ value: "", label: "No brand" }, ...brands.map((brand) => ({ value: brand.id, label: brand.name }))]}
            />
            <FieldSelect
              label="Type"
              value={noteDraft.type}
              onChange={(value) => setNoteDraft((current) => ({ ...current, type: value as ThinkingType }))}
              options={noteTypeOptions}
            />
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Thinking Body</label>
            <textarea
              rows={6}
              value={noteDraft.body}
              onChange={(event) => setNoteDraft((current) => ({ ...current, body: event.target.value }))}
              placeholder="Write the thought while it is still fresh."
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-mute"
            />
          </div>

          <button
            type="button"
            onClick={handleNoteSave}
            className="w-full rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            {noteDrawerMode === "edit" ? "Save Thinking" : "Add Thinking"}
          </button>

          {noteDrawerMode === "edit" && noteDraft.id && (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              {!noteConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setNoteConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                >
                  Delete Thinking
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-mute">Delete this thinking item from the dashboard? Thinking will update immediately.</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleNoteDelete}
                      className="flex-1 rounded-2xl border border-orange/35 bg-orange/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteConfirmDelete(false)}
                      className="flex-1 rounded-2xl border border-white/8 px-4 py-3 text-sm text-mute"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PreviewDrawer>

      <PreviewDrawer
        open={Boolean(contentDrawerMode)}
        onClose={closeContentDrawer}
        eyebrow={`Home / Posts / ${contentDrawerMode === "edit" ? "Edit" : "Create"}`}
        title={contentDrawerMode === "edit" ? "Edit post" : "New post"}
        subtitle="Post changes save locally and keep you in the Home workflow."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={contentDraft.title}
              onChange={(event) => setContentDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Enter post title"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSelect
              label="Brand"
              value={contentDraft.brandId}
              onChange={(value) => setContentDraft((current) => ({ ...current, brandId: value as BrandId }))}
              options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
            />
            <FieldSelect
              label="Format"
              value={contentDraft.format}
              onChange={(value) => setContentDraft((current) => ({ ...current, format: value as ContentFormat }))}
              options={contentFormats.map((format) => ({ value: format, label: formatTokenLabel(format) }))}
            />
            <FieldSelect
              label="Status"
              value={contentDraft.status}
              onChange={(value) => setContentDraft((current) => ({ ...current, status: value as Status }))}
              options={contentStatusOptions.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
            <FieldSelect
              label="Caption"
              value={contentDraft.captionStatus}
              onChange={(value) => setContentDraft((current) => ({ ...current, captionStatus: value as ContentCaptionStatus }))}
              options={captionStatusOptions.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
            <FieldSelect
              label="Assets"
              value={contentDraft.assetStatus}
              onChange={(value) => setContentDraft((current) => ({ ...current, assetStatus: value as ContentAssetStatus }))}
              options={assetStatusOptions.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Pillar</label>
              <input
                value={contentDraft.pillar}
                onChange={(event) => setContentDraft((current) => ({ ...current, pillar: event.target.value }))}
                placeholder="Enter post pillar"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Schedule</label>
              <input
                type="datetime-local"
                value={contentDraft.scheduleDate}
                onChange={(event) => setContentDraft((current) => ({ ...current, scheduleDate: event.target.value }))}
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Project ID</label>
            <input
              value={contentDraft.linkedProjectId}
              onChange={(event) => setContentDraft((current) => ({ ...current, linkedProjectId: event.target.value }))}
              placeholder="Optional"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
            />
          </div>

          <button
            type="button"
            onClick={handleContentSave}
            className="w-full rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            {contentDrawerMode === "edit" ? "Save Post" : "Add Post"}
          </button>

          {contentDrawerMode === "edit" && contentDraft.id && (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              {!contentConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setContentConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                >
                  Delete Post
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-mute">Delete this post from the dashboard? Post views will update immediately.</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleContentDelete}
                      className="flex-1 rounded-2xl border border-orange/35 bg-orange/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentConfirmDelete(false)}
                      className="flex-1 rounded-2xl border border-white/8 px-4 py-3 text-sm text-mute"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PreviewDrawer>

      <PreviewDrawer
        open={Boolean(calendarDrawerMode)}
        onClose={closeCalendarDrawer}
        eyebrow={`Home / Calendar / ${calendarDrawerMode === "edit" ? "Edit" : "Create"}`}
        title={calendarDrawerMode === "edit" ? "Edit calendar item" : "New calendar item"}
        subtitle="Calendar changes save locally and keep you in the Home workflow."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={calendarDraft.title}
              onChange={(event) => setCalendarDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Enter calendar item title"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSelect
              label="Brand"
              value={calendarDraft.brandId}
              onChange={(value) => setCalendarDraft((current) => ({ ...current, brandId: value as BrandId }))}
              options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
            />
            <FieldSelect
              label="Type"
              value={calendarDraft.type}
              onChange={(value) => setCalendarDraft((current) => ({ ...current, type: value as CalendarItemType }))}
              options={calendarTypes.map((type) => ({ value: type, label: formatTokenLabel(type) }))}
            />
            <FieldSelect
              label="Status"
              value={calendarDraft.status}
              onChange={(value) => setCalendarDraft((current) => ({ ...current, status: value as Status }))}
              options={calendarStatusOptions.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Start</label>
              <input
                type="datetime-local"
                value={calendarDraft.start}
                onChange={(event) => setCalendarDraft((current) => ({ ...current, start: event.target.value }))}
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">End</label>
              <input
                type="datetime-local"
                value={calendarDraft.end}
                onChange={(event) => setCalendarDraft((current) => ({ ...current, end: event.target.value }))}
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Action ID</label>
              <input
                value={calendarDraft.linkedTaskId}
                onChange={(event) => setCalendarDraft((current) => ({ ...current, linkedTaskId: event.target.value }))}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Project ID</label>
              <input
                value={calendarDraft.linkedProjectId}
                onChange={(event) => setCalendarDraft((current) => ({ ...current, linkedProjectId: event.target.value }))}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Content ID</label>
              <input
                value={calendarDraft.linkedContentId}
                onChange={(event) => setCalendarDraft((current) => ({ ...current, linkedContentId: event.target.value }))}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Planning Context</label>
            <textarea
              rows={4}
              value={calendarDraft.notes}
              onChange={(event) => setCalendarDraft((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Planning context"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-mute"
            />
          </div>

          <button
            type="button"
            onClick={handleCalendarSave}
            className="w-full rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            {calendarDrawerMode === "edit" ? "Save Calendar Item" : "Add Calendar Item"}
          </button>

          {calendarDrawerMode === "edit" && calendarDraft.id && (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              {!calendarConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setCalendarConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                >
                  Delete Calendar Item
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-mute">Delete this calendar item from the local schedule? Calendar views will update immediately.</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCalendarDelete}
                      className="flex-1 rounded-2xl border border-orange/35 bg-orange/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarConfirmDelete(false)}
                      className="flex-1 rounded-2xl border border-white/8 px-4 py-3 text-sm text-mute"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PreviewDrawer>
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
