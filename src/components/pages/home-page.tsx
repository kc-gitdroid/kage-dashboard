"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { PreviewDrawer } from "@/components/preview-drawer";
import { createLocalRecordId, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { brandWorkspaceOrder, calendarTypes, contentFormats, noteTypes, taskCategories, taskPriorities, taskStatuses } from "@/data";
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
  NoteType,
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
  type: NoteType;
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
const HYDRATION_SAFE_NOW = new Date("2026-04-13T00:00:00");

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
    label: "New Task",
    hint: "Capture a task with ownership, due date, and priority without leaving the command flow.",
  },
  {
    id: "note",
    label: "New Note",
    hint: "Drop in an idea, reminder, or fragment before it disappears into the day.",
  },
  {
    id: "calendar",
    label: "New Calendar Item",
    hint: "Add a scheduled block, meeting, reminder, or planning marker without leaving the command flow.",
  },
  {
    id: "content",
    label: "New Content Item",
    hint: "Start a content item with format, pillar, and timing while the direction is still clear.",
  },
];

const initialNoteDraft: NoteDraft = {
  title: "",
  brandId: "personal",
  type: "idea",
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

const noteTypeOptions = noteTypes.map((type) => ({ value: type, label: formatTokenLabel(type) }));
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
    type: note.type,
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
        type: "overdue task",
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
        type: "task",
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
        type: "overdue content",
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
        type: "scheduled content",
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
        type: "active content",
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
    });

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
        type: "scheduled content",
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
        type: "task deadline",
        targetType: "task" as const,
        timing: `Due ${formatMonthDay(task.dueDate)}`,
        sortTime: new Date(task.dueDate).getTime(),
      })),
  ]
    .sort((a, b) => a.sortTime - b.sortTime)
    .slice(0, 6);

  const brandSnapshots = [...brandSpaces]
    .sort((a, b) => brandWorkspaceOrder.indexOf(a.id) - brandWorkspaceOrder.indexOf(b.id))
    .map((brand) => {
    const activeProjectCount = projects.filter((project) => project.brandId === brand.id && project.status === "active").length;
    const openTaskCount = tasks.filter((task) => task.brandId === brand.id && task.status !== "completed").length;
    const scheduledContentCount = contentItems.filter(
      (item) => item.brandId === brand.id && item.status === "scheduled" && item.scheduleDate,
    ).length;

    const nextCandidates: BrandSnapshotRow[] = [
      ...tasks
        .filter((task) => task.brandId === brand.id && task.status !== "completed")
        .map((task) => ({
          id: task.id,
          label: task.title,
          timing: `Task deadline / ${formatRelativeDay(task.dueDate, today)}`,
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
          timing: `Content / ${formatMonthDayTime(item.scheduleDate as string)}`,
          sortTime: new Date(item.scheduleDate as string).getTime(),
        })),
    ].sort((a, b) => a.sortTime - b.sortTime);

      return {
        ...brand,
        activeProjectCount,
        openTaskCount,
        scheduledContentCount,
        nextPriority: nextCandidates[0],
      };
    });

  const activeProjectRows = projects
    .filter((project) => project.status === "active")
    .sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })
    .slice(0, 4);

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
    <div className="w-full min-w-0 max-w-full space-y-5 overflow-x-hidden md:space-y-6">
      <section className="space-y-5 xl:grid xl:grid-cols-[1.04fr_0.96fr] xl:items-start xl:gap-5 xl:space-y-0">
        <div className="space-y-5">
          <Panel
            eyebrow="Home / Today"
            title="Today"
            subtitle="What needs attention now: overdue work, today’s commitments, and scheduled outputs in one focused list."
            accent="blue"
          >
          <div
            className={
              todayRows.length === 0
                ? ""
                : todayRows.length > 20
                  ? "space-y-3 max-h-[32rem] overflow-y-auto pr-1"
                  : "space-y-3"
            }
          >
            {todayRows.map((item, index) => {
              const brand = brands.find((entry) => entry.id === item.brandId);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => openHomeItem(item)}
                  className={`touch-manipulation rounded-2xl border px-4 py-3 md:px-4 ${
                    item.isOverdue
                      ? "border-orange/35 bg-orange/8"
                      : index === 0
                        ? "border-blue/35 bg-blue/8"
                        : "border-white/6 bg-black/10"
                  } w-full text-left transition hover:border-white/12`}
                >
                  <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="font-display text-[10px] uppercase tracking-[0.18em] text-mute">
                          {formatTokenLabel(item.type)}
                        </span>
                        <span className="text-[11px] text-mute">{item.timing}</span>
                        {brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}
                      </div>
                  </div>
                </button>
              );
            })}
            {todayRows.length === 0 && (
              <div className="inline-flex max-w-md items-center gap-3 rounded-2xl border border-white/6 bg-black/10 px-4 py-3 text-sm text-mute">
                <span className="font-display text-[10px] uppercase tracking-[0.18em] text-blue">Clear</span>
                <span>No urgent items right now. Use Quick Add to capture new work or check Upcoming for the next move.</span>
              </div>
            )}
          </div>
          </Panel>

          <Panel
            eyebrow="Home / Brand Snapshot"
            title="Brand Snapshot"
            subtitle="What matters across AAI, Masteryatelier, Massiveoutfit / MO Studio, Personal, and biro at a glance."
            accent="lime"
          >
            <div className="grid gap-3 md:grid-cols-2">
              {brandSnapshots.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => router.push(`/brands/${brand.id}`)}
                  className="rounded-2xl border border-white/6 bg-white/[0.02] p-4"
                  style={{ boxShadow: `inset 0 1px 0 0 ${brand.color}20` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: brand.color }} />
                        <h3 className="text-base font-semibold text-ink">{brand.shortName}</h3>
                      </div>
                      <p className="mt-1 text-sm text-mute">{brand.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/6 bg-black/10 px-3 py-3 text-right">
                      <p className="ui-micro-label min-h-[1.8rem] leading-tight">Projects</p>
                      <p className="mt-2 text-lg font-medium leading-none text-ink">{brand.activeProjectCount}</p>
                    </div>
                    <div className="rounded-xl border border-white/6 bg-black/10 px-3 py-3 text-right">
                      <p className="ui-micro-label min-h-[1.8rem] leading-tight">Open Tasks</p>
                      <p className="mt-2 text-lg font-medium leading-none text-ink">{brand.openTaskCount}</p>
                    </div>
                    <div className="rounded-xl border border-white/6 bg-black/10 px-3 py-3 text-right">
                      <p className="ui-micro-label min-h-[1.8rem] leading-tight">Scheduled</p>
                      <p className="mt-2 text-lg font-medium leading-none text-ink">{brand.scheduledContentCount}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/6 bg-black/10 px-3 py-3">
                    <p className="ui-micro-label">Next Priority</p>
                    {brand.nextPriority ? (
                      <>
                        <p className="mt-2 text-sm font-medium text-ink">{brand.nextPriority.label}</p>
                        <p className="mt-1 text-sm text-mute">{brand.nextPriority.timing}</p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-mute">No immediate items scheduled.</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel
            eyebrow="Home / Upcoming"
            title="Upcoming"
            subtitle="What is coming next across the next 7 days, with the most important items surfaced first."
          >
          <div className={upcomingRows.length > 6 ? "space-y-3 max-h-[32rem] overflow-y-auto pr-1" : "space-y-3"}>
            {upcomingRows.map((item) => {
              const brand = brands.find((entry) => entry.id === item.brandId);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => openHomeItem(item)}
                  className="touch-manipulation w-full rounded-2xl border border-white/6 bg-black/10 px-4 py-3 text-left transition hover:border-white/12"
                >
                  <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="font-display text-[10px] uppercase tracking-[0.18em] text-mute">
                            {formatTokenLabel(item.type)}
                          </span>
                          <span className="text-[11px] text-mute">{item.timing}</span>
                          {brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}
                        </div>
                    </div>
                </button>
              );
            })}
            {upcomingRows.length === 0 && (
              <div className="rounded-2xl border border-white/6 bg-black/10 px-4 py-4 text-sm text-mute">
                Nothing major is scheduled in the next 7 days.
              </div>
            )}
          </div>
          </Panel>

          <Panel
            eyebrow="Home / Quick Add"
            title="Quick Add"
            subtitle="Fast entry actions for the items that most often need to be captured in motion."
            accent="yellow"
          >
          <div className={quickActions.length > 2 ? "space-y-3 max-h-[32rem] overflow-y-auto pr-1" : "space-y-3"}>
            {quickActions.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openQuickAction(item.id)}
                className={`touch-manipulation flex w-full items-start justify-between rounded-2xl border px-4 py-4 text-left transition ${
                  index === 0
                    ? "border-yellow/20 bg-yellow/6 hover:border-yellow/35"
                    : "border-white/6 bg-white/[0.02] hover:border-white/12"
                }`}
              >
                <div>
                  <p className="font-display text-[11px] uppercase tracking-[0.24em] text-ink">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-mute">{item.hint}</p>
                </div>
                <span className="font-display text-lg text-mute">+</span>
              </button>
            ))}
          </div>
          </Panel>

          <Panel
            eyebrow="Home / Projects"
            title="Active Projects"
            subtitle="Active delivery streams only, ordered by nearest due date so pressure points surface quickly."
            accent="orange"
          >
          <div className="space-y-3">
            {activeProjectRows.map((project) => {
              const brand = brands.find((entry) => entry.id === project.brandId);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="block w-full rounded-2xl border border-white/6 bg-white/[0.02] p-4 text-left transition hover:border-white/12"
                >
                  <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{project.title}</p>
                      <p className="mt-2 text-sm leading-6 text-mute">{project.summary ?? project.goal}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                    <span className="font-display text-[10px] uppercase tracking-[0.18em] text-mute">
                      {formatTokenLabel(project.status)}
                    </span>
                    <span className="text-mute">
                      {project.dueDate ? `Due ${formatMonthDay(project.dueDate)}` : `Started ${formatMonthDay(project.startDate)}`}
                    </span>
                    {brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}
                  </div>
                </button>
              );
            })}
            {activeProjectRows.length === 0 && (
              <div className="rounded-2xl border border-white/6 bg-black/10 px-4 py-4 text-sm text-mute">
                No active projects are open right now.
              </div>
            )}
          </div>
          </Panel>
        </div>
      </section>

      <PreviewDrawer
        open={Boolean(taskDrawerMode)}
        onClose={closeTaskDrawer}
        eyebrow={`Home / Tasks / ${taskDrawerMode === "edit" ? "Edit" : "Create"}`}
        title={taskDrawerMode === "edit" ? "Edit task" : "New task"}
        subtitle="Task changes save locally and keep you in the Home workflow."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={taskDraft.title}
              onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Enter task title"
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
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Notes</label>
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
            {taskDrawerMode === "edit" ? "Save Task" : "Add Task"}
          </button>

          {taskDrawerMode === "edit" && taskDraft.id && (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              {!taskConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setTaskConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                >
                  Delete Task
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-mute">Delete this task from the local dashboard? Home and task views will update immediately.</p>
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
              )}
            </div>
          )}
        </div>
      </PreviewDrawer>

      <PreviewDrawer
        open={Boolean(noteDrawerMode)}
        onClose={closeNoteDrawer}
        eyebrow={`Home / Notes / ${noteDrawerMode === "edit" ? "Edit" : "Create"}`}
        title={noteDrawerMode === "edit" ? "Edit note" : "New note"}
        subtitle="Note changes save locally and keep you in the Home workflow."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={noteDraft.title}
              onChange={(event) => setNoteDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Capture note title"
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
              onChange={(value) => setNoteDraft((current) => ({ ...current, type: value as NoteType }))}
              options={noteTypeOptions}
            />
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Note Body</label>
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
            {noteDrawerMode === "edit" ? "Save Note" : "Add Note"}
          </button>

          {noteDrawerMode === "edit" && noteDraft.id && (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              {!noteConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setNoteConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                >
                  Delete Note
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-mute">Delete this note from the local dashboard? Notes will update immediately.</p>
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
        eyebrow={`Home / Content / ${contentDrawerMode === "edit" ? "Edit" : "Create"}`}
        title={contentDrawerMode === "edit" ? "Edit content item" : "New content item"}
        subtitle="Content changes save locally and keep you in the Home workflow."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={contentDraft.title}
              onChange={(event) => setContentDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Enter content title"
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
                placeholder="Enter content pillar"
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
            {contentDrawerMode === "edit" ? "Save Content Item" : "Add Content Item"}
          </button>

          {contentDrawerMode === "edit" && contentDraft.id && (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              {!contentConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setContentConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                >
                  Delete Content Item
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-mute">Delete this content item from the local dashboard? Content views will update immediately.</p>
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
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Task ID</label>
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
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Notes</label>
            <textarea
              rows={4}
              value={calendarDraft.notes}
              onChange={(event) => setCalendarDraft((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Planning notes or context"
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
