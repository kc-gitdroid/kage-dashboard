import { CalendarItem } from "@/types";

export const calendarViews = ["Month", "Week", "Agenda"] as const;
export const calendarTypes = ["task", "content", "meeting", "reminder"] as const;

export const calendarItems: CalendarItem[] = [
  {
    id: "cal-001",
    title: "AAI Reel Publish",
    brandId: "aai",
    type: "content",
    start: "2026-04-12T10:00:00",
    status: "scheduled",
    linkedContentId: "content-001",
    linkedProjectId: "proj-aai-april",
    notes: "Publish uniform sequence reel with approved caption set.",
  },
  {
    id: "cal-002",
    title: "MO Studio Client Check-in",
    brandId: "mo-studio",
    type: "meeting",
    start: "2026-04-13T14:00:00",
    end: "2026-04-13T15:00:00",
    status: "planned",
    linkedProjectId: "proj-mo-client",
    notes: "Client checkpoint on delivery timing and asset readiness.",
  },
  {
    id: "cal-003",
    title: "Masteryatelier Curriculum Mapping",
    brandId: "masteryatelier",
    type: "task",
    start: "2026-04-10T16:00:00",
    end: "2026-04-10T17:30:00",
    status: "planned",
    linkedTaskId: "task-002",
    linkedProjectId: "proj-mastery-framework",
  },
  {
    id: "cal-004",
    title: "Personal Weekly Reset",
    brandId: "personal",
    type: "reminder",
    start: "2026-04-12T12:00:00",
    end: "2026-04-12T13:00:00",
    status: "planned",
    linkedTaskId: "task-004",
    linkedProjectId: "proj-personal-reset",
  },
  {
    id: "cal-005",
    title: "AAI Product Detail Review",
    brandId: "aai",
    type: "task",
    start: "2026-04-14T10:00:00",
    end: "2026-04-14T11:00:00",
    status: "active",
    linkedTaskId: "task-005",
    linkedProjectId: "proj-aai-april",
  },
  {
    id: "cal-006",
    title: "Masteryatelier Lesson Framing Sync",
    brandId: "masteryatelier",
    type: "meeting",
    start: "2026-04-15T09:30:00",
    end: "2026-04-15T10:15:00",
    status: "active",
    linkedProjectId: "proj-mastery-framework",
  },
  {
    id: "cal-007",
    title: "MO Studio Delivery Timeline Revision",
    brandId: "mo-studio",
    type: "task",
    start: "2026-04-14T13:00:00",
    end: "2026-04-14T14:00:00",
    status: "active",
    linkedTaskId: "task-003",
    linkedProjectId: "proj-mo-client",
  },
  {
    id: "cal-008",
    title: "Personal Reading Review",
    brandId: "personal",
    type: "reminder",
    start: "2026-04-14T08:00:00",
    status: "planned",
    linkedTaskId: "task-008",
    linkedProjectId: "proj-personal-reset",
  },
];

function toDateParts(value: string) {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  return { day, dayLabel: `${weekday} ${day}`, time };
}

function getEndTime(item: CalendarItem) {
  return item.end ? toDateParts(item.end).time : undefined;
}

function getContext(item: CalendarItem) {
  if (item.notes) {
    return item.notes;
  }

  switch (item.type) {
    case "content":
      return "Scheduled content milestone";
    case "meeting":
      return "Planning and coordination";
    case "task":
      return "Execution block";
    case "reminder":
      return "Personal operating rhythm";
    default:
      return "";
  }
}

export const calendarEvents = calendarItems.map((item) => {
  const { day, dayLabel, time } = toDateParts(item.start);

  return {
    ...item,
    date: day,
    dayLabel,
    time,
    endTime: getEndTime(item),
    context: getContext(item),
  };
});

export const calendarPreview = [
  ...calendarEvents.slice(0, 3).map((item) => ({
    slot: item.time,
    title: item.title,
    brandId: item.brandId,
  })),
];

export const weekColumns = calendarEvents.reduce<
  { label: string; items: { time: string; brandId: CalendarItem["brandId"]; type: CalendarItem["type"]; title: string }[] }[]
>((acc, item) => {
  const existing = acc.find((entry) => entry.label === item.dayLabel);

  if (existing) {
    existing.items.push({
      time: item.time,
      brandId: item.brandId,
      type: item.type,
      title: item.title,
    });
    return acc;
  }

  acc.push({
    label: item.dayLabel,
    items: [
      {
        time: item.time,
        brandId: item.brandId,
        type: item.type,
        title: item.title,
      },
    ],
  });

  return acc;
}, []);
