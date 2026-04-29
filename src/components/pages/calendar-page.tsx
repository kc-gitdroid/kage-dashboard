"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useEffect } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { PreviewDrawer } from "@/components/preview-drawer";
import { createLocalRecordId, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { calendarTypes, calendarViews } from "@/data";
import { formatTokenLabel } from "@/lib/format-token-label";
import { BrandId, CalendarItem, CalendarItemType, ContentItem, ProjectItem, Status, TaskItem } from "@/types";

const calendarStatuses: Status[] = ["planned", "active", "scheduled", "completed"];
const unifiedTypeFilters = ["Posts", "Actions", "Projects", "Calendar"] as const;
type UnifiedTypeFilter = (typeof unifiedTypeFilters)[number];

const typeToneMap = {
  task: "border-white/8 text-ink",
  content: "border-blue/30 text-blue",
  meeting: "border-orange/30 text-orange",
  reminder: "border-lime/30 text-lime",
  Posts: "border-blue/30 text-blue",
  Actions: "border-yellow/30 text-yellow",
  Projects: "border-orange/30 text-orange",
  Calendar: "border-lime/30 text-lime",
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

type UnifiedCalendarEvent = {
  id: string;
  sourceId: string;
  source: "calendar" | "post" | "action" | "project";
  title: string;
  brandId: BrandId;
  dateValue: string;
  date: string;
  dayLabel: string;
  time?: string;
  endTime?: string;
  itemType: UnifiedTypeFilter;
  status?: string;
  details?: string;
  calendarItem?: CalendarItem;
};

const initialDraft: CalendarDraft = {
  title: "",
  brandId: "aai",
  type: "task",
  start: "2026-04-30T10:00",
  end: "",
  status: "planned",
  linkedTaskId: "",
  linkedProjectId: "",
  linkedContentId: "",
  notes: "",
};

function getTypeTone(type: string) {
  return typeToneMap[type as keyof typeof typeToneMap] ?? "border-white/8 text-ink";
}

function formatShortTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatAgendaLabel(item: UnifiedCalendarEvent) {
  const start = new Date(item.dateValue);
  const dayLabel = start.toLocaleDateString("en-US", { weekday: "short", day: "2-digit" });
  return `${dayLabel}${item.time ? ` / ${item.time}${item.endTime ? ` - ${item.endTime}` : ""}` : " / All day"}`;
}

function buildMonthCells(referenceDate: Date) {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  const cells: string[] = Array(monthStart.getDay()).fill("");

  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    cells.push(String(day).padStart(2, "0"));
  }

  while (cells.length % 7 !== 0) {
    cells.push("");
  }

  const rows: string[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7));
  }

  return rows;
}

function toDateParts(value: string) {
  const [datePart, timePart] = value.split("T");
  const [year, month, rawDay] = datePart.split("-").map((part) => Number(part));
  const [hour = 0, minute = 0] = (timePart ?? "").split(":").map((part) => Number(part));
  const date = new Date(year, month - 1, rawDay, hour, minute);
  const day = String(rawDay).padStart(2, "0");
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const time = timePart ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` : "";
  return { day, dayLabel: `${weekday} ${day}`, time };
}

function toDraft(item: CalendarItem): CalendarDraft {
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

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition ${
        active ? "border-blue/40 bg-blue/10 text-ink" : "border-white/8 text-mute hover:border-white/12 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

export function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { brands, brandSpaces, calendarItems, tasks, projects, contentItems, saveCalendarItem, deleteCalendarItem } = useDashboardData();
  const origin = searchParams.get("origin");
  const returnPath = origin === "home" ? "/" : "/calendar";
  const currentDate = new Date();
  const currentMonthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const currentDayCell = String(currentDate.getDate()).padStart(2, "0");
  const monthCells = useMemo(() => buildMonthCells(currentDate), [currentDate]);
  const [activeView, setActiveView] = useState<(typeof calendarViews)[number]>("Month");
  const [selectedMonthDate, setSelectedMonthDate] = useState<string | null>(null);
  const [brandFilters, setBrandFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<UnifiedTypeFilter[]>([]);
  const [draft, setDraft] = useState<CalendarDraft>(initialDraft);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<UnifiedCalendarEvent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const calendarEvents = useMemo(
    () => {
      const fromCalendar: UnifiedCalendarEvent[] = calendarItems.map((item) => {
        const { day, dayLabel, time } = toDateParts(item.start);
        const endTime = item.end ? toDateParts(item.end).time : undefined;
        return {
          id: `calendar-${item.id}`,
          sourceId: item.id,
          source: "calendar",
          title: item.title,
          brandId: item.brandId,
          dateValue: item.start,
          date: day,
          dayLabel,
          time,
          endTime,
          itemType: "Calendar",
          status: item.status,
          details: item.notes,
          calendarItem: item,
        };
      });
      const fromPosts: UnifiedCalendarEvent[] = [
        ...contentItems
          .filter((item): item is ContentItem & { scheduleDate: string } => Boolean(item.scheduleDate))
          .map((item) => {
            const { day, dayLabel, time } = toDateParts(item.scheduleDate);
            return {
              id: `post-content-${item.id}`,
              sourceId: item.id,
              source: "post" as const,
              title: item.title,
              brandId: item.brandId,
              dateValue: item.scheduleDate,
              date: day,
              dayLabel,
              time,
              itemType: "Posts" as const,
              status: item.status,
              details: item.pillar,
            };
          }),
        ...brandSpaces.flatMap((brand) =>
          (brand.publishingCalendar ?? []).map((post) => {
            const { day, dayLabel } = toDateParts(post.date);
            return {
              id: `post-brand-${post.id}`,
              sourceId: post.id,
              source: "post" as const,
              title: post.title,
              brandId: brand.id,
              dateValue: post.date,
              date: day,
              dayLabel,
              itemType: "Posts" as const,
              status: post.status,
              details: post.sceneBrief ?? post.workingNotes,
            };
          }),
        ),
      ];
      const fromActions: UnifiedCalendarEvent[] = tasks
        .filter((task) => task.status !== "completed")
        .map((task: TaskItem) => {
          const { day, dayLabel } = toDateParts(task.dueDate);
          return {
            id: `action-${task.id}`,
            sourceId: task.id,
            source: "action" as const,
            title: task.title,
            brandId: task.brandId,
            dateValue: task.dueDate,
            date: day,
            dayLabel,
            itemType: "Actions" as const,
            status: task.status,
            details: task.notes,
          };
        });
      const fromProjects: UnifiedCalendarEvent[] = projects
        .filter((project): project is ProjectItem & { brandId: BrandId; dueDate: string } => Boolean(project.brandId && project.dueDate && project.status !== "completed"))
        .map((project) => {
          const { day, dayLabel } = toDateParts(project.dueDate);
          return {
            id: `project-${project.id}`,
            sourceId: project.id,
            source: "project" as const,
            title: project.title,
            brandId: project.brandId,
            dateValue: project.dueDate,
            date: day,
            dayLabel,
            itemType: "Projects" as const,
            status: project.status,
            details: project.summary ?? project.goal,
          };
        });

      return [...fromCalendar, ...fromPosts, ...fromActions, ...fromProjects].sort((a, b) => new Date(a.dateValue).getTime() - new Date(b.dateValue).getTime());
    },
    [brandSpaces, calendarItems, contentItems, projects, tasks],
  );

  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((event) => {
      const matchesBrand = brandFilters.length === 0 || brandFilters.includes(event.brandId);
      const matchesType = typeFilters.length === 0 || typeFilters.includes(event.itemType);
      return matchesBrand && matchesType;
    });
  }, [brandFilters, calendarEvents, typeFilters]);

  const dateEventMap = useMemo(
    () =>
      filteredEvents.reduce<Record<string, typeof filteredEvents>>((acc, event) => {
        acc[event.date] = [...(acc[event.date] ?? []), event];
        return acc;
      }, {}),
    [filteredEvents],
  );

  const filteredWeekColumns = useMemo(
    () =>
      filteredEvents.reduce<
        { label: string; items: { id: string; time: string; brandId: BrandId; itemType: UnifiedTypeFilter; title: string }[] }[]
      >((acc, item) => {
        const existing = acc.find((entry) => entry.label === item.dayLabel);

        if (existing) {
          existing.items.push({ id: item.id, time: item.time ?? "All day", brandId: item.brandId, itemType: item.itemType, title: item.title });
          return acc;
        }

        acc.push({
          label: item.dayLabel,
          items: [{ id: item.id, time: item.time ?? "All day", brandId: item.brandId, itemType: item.itemType, title: item.title }],
        });
        return acc;
      }, []),
    [filteredEvents],
  );

  useEffect(() => {
    const editId = searchParams.get("edit");
    const wantsNew = searchParams.get("new");
    const view = searchParams.get("view");

    if (view && (calendarViews as readonly string[]).includes(view)) {
      setActiveView(view as (typeof calendarViews)[number]);
    }

    if (editId) {
      const match = calendarItems.find((item) => item.id === editId);
      if (match) {
        openEdit(match);
      }
      return;
    }

    if (wantsNew === "1") {
      openCreate();
    }
  }, [calendarItems, searchParams]);

  useEffect(() => {
    if (selectedMonthDate && monthCells.flat().includes(selectedMonthDate)) {
      return;
    }

    if (monthCells.flat().includes(currentDayCell)) {
      setSelectedMonthDate(currentDayCell);
      return;
    }

    const firstDateWithItems = monthCells.flat().find((cell) => cell && (dateEventMap[cell] ?? []).length > 0);
    setSelectedMonthDate(firstDateWithItems ?? monthCells.flat().find(Boolean) ?? null);
  }, [currentDayCell, dateEventMap, monthCells, selectedMonthDate]);

  function toggleBrandFilter(id: string) {
    setBrandFilters((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleTypeFilter(type: UnifiedTypeFilter) {
    setTypeFilters((current) => (current.includes(type) ? current.filter((item) => item !== type) : [...current, type]));
  }

  function openCreate() {
    setDraft(initialDraft);
    setDrawerMode("create");
    setConfirmDelete(false);
  }

  function openEdit(item: CalendarItem) {
    setDraft(toDraft(item));
    setDrawerMode("edit");
    setConfirmDelete(false);
  }

  function closeDrawer() {
    setDrawerMode(null);
    setDraft(initialDraft);
    setConfirmDelete(false);
    router.replace(returnPath);
  }

  function openEvent(event: UnifiedCalendarEvent) {
    if (event.calendarItem) {
      openEdit(event.calendarItem);
      return;
    }

    setSelectedEvent(event);
    setConfirmDelete(false);
  }

  function closeEventPreview() {
    setSelectedEvent(null);
    setConfirmDelete(false);
  }

  function handleSave() {
    if (!draft.title.trim() || !draft.start) {
      return;
    }

    saveCalendarItem({
      id: draft.id ?? createLocalRecordId("calendar"),
      title: draft.title.trim(),
      brandId: draft.brandId,
      type: draft.type,
      start: new Date(draft.start).toISOString().slice(0, 19),
      end: draft.end ? new Date(draft.end).toISOString().slice(0, 19) : undefined,
      status: draft.status,
      linkedTaskId: draft.linkedTaskId.trim() || undefined,
      linkedProjectId: draft.linkedProjectId.trim() || undefined,
      linkedContentId: draft.linkedContentId.trim() || undefined,
      notes: draft.notes.trim() || undefined,
    });

    closeDrawer();
  }

  function handleDelete() {
    if (!draft.id) {
      return;
    }
    deleteCalendarItem(draft.id);
    closeDrawer();
  }

  const selectedDateEvents = selectedMonthDate ? dateEventMap[selectedMonthDate] ?? [] : [];

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel
        eyebrow="Calendar / Planning"
        title="Structured view across brands and commitments"
        subtitle="Month, week, and agenda surfaces switch cleanly while brand and type filters narrow what stays visible."
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/6 bg-black/10 p-1">
              {calendarViews.map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={`rounded-xl px-4 py-2 font-display text-[11px] uppercase tracking-[0.22em] transition ${
                    activeView === view ? "bg-blue/10 text-ink" : "text-mute hover:text-ink"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm">
                <span className="text-mute">Visible items</span>
                <span className="ml-3 font-display uppercase tracking-[0.18em] text-ink">
                  {String(filteredEvents.length).padStart(2, "0")}
                </span>
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="rounded-2xl border border-blue/30 bg-blue/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink transition hover:border-blue/40"
              >
                New Calendar Item
              </button>
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
            <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-[11px] uppercase tracking-[0.24em] text-mute">Brand Filters</p>
                {brandFilters.length > 0 && (
                  <button type="button" onClick={() => setBrandFilters([])} className="text-xs text-mute hover:text-ink">
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ToggleChip label="All Brands" active={brandFilters.length === 0} onClick={() => setBrandFilters([])} />
                {brands.map((brand) => (
                  <button key={brand.id} onClick={() => toggleBrandFilter(brand.id)} type="button">
                    <span className={brandFilters.length === 0 || brandFilters.includes(brand.id) ? "opacity-100" : "opacity-55"}>
                      <BrandPill color={brand.color}>{brand.shortName}</BrandPill>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-[11px] uppercase tracking-[0.24em] text-mute">Type Filters</p>
                {typeFilters.length > 0 && (
                  <button type="button" onClick={() => setTypeFilters([])} className="text-xs text-mute hover:text-ink">
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ToggleChip label="All" active={typeFilters.length === 0} onClick={() => setTypeFilters([])} />
                {unifiedTypeFilters.map((type) => (
                  <ToggleChip
                    key={type}
                    label={type}
                    active={typeFilters.length === 0 || typeFilters.includes(type)}
                    onClick={() => toggleTypeFilter(type)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {activeView === "Month" && (
        <Panel eyebrow="Month View" title={currentMonthLabel} subtitle="Calendar density stays light so filtered items remain readable." accent="blue">
          <div className="grid grid-cols-7 gap-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="rounded-xl border border-white/6 bg-white/[0.02] px-2 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-mute">
                {day}
              </div>
            ))}
            {monthCells.flat().map((cell, index) => (
              <div
                key={`${cell}-${index}`}
                role={cell ? "button" : undefined}
                tabIndex={cell ? 0 : -1}
                onClick={() => cell && setSelectedMonthDate(cell)}
                onKeyDown={(event) => {
                  if (!cell) {
                    return;
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedMonthDate(cell);
                  }
                }}
                className={`min-h-[72px] rounded-xl border p-2.5 text-left md:min-h-32 md:p-3 ${
                  selectedMonthDate === cell || cell === currentDayCell ? "border-blue/30 bg-blue/8" : "border-white/6 bg-black/10"
                } ${cell ? "cursor-pointer" : ""}`}
              >
                <p className="font-display text-xs uppercase tracking-[0.18em] text-mute">{cell || " "}</p>
                <div className="mt-2 flex min-h-6 items-center gap-1.5 md:hidden">
                  {(dateEventMap[cell] ?? []).slice(0, 4).map((event) => (
                    <span
                      key={event.id}
                      className={`h-1.5 w-1.5 rounded-full ${
                        event.itemType === "Posts"
                          ? "bg-blue"
                          : event.itemType === "Projects"
                            ? "bg-orange"
                            : event.itemType === "Calendar"
                              ? "bg-lime"
                              : "bg-yellow"
                      }`}
                    />
                  ))}
                  {(dateEventMap[cell] ?? []).length > 4 && <span className="text-[10px] text-mute">+</span>}
                </div>
                <div className="mt-3 hidden space-y-2 md:block">
                  {(dateEventMap[cell] ?? []).slice(0, 2).map((event) => {
                    const brand = brands.find((entry) => entry.id === event.brandId);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          openEvent(event);
                        }}
                        className="block w-full rounded-lg border border-white/6 bg-white/[0.03] px-2 py-2 text-left transition hover:border-white/12"
                      >
                        <p className="text-[11px] text-mute">{event.time ?? "All day"}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink">{event.title}</p>
                        {brand && (
                          <div className="mt-2">
                            <BrandPill color={brand.color} className="max-w-full px-2 text-[9px] tracking-[0.1em]">
                              {brand.shortName}
                            </BrandPill>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 md:hidden">
            <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-[11px] uppercase tracking-[0.24em] text-mute">
                  {selectedMonthDate ? `Selected Date / ${selectedMonthDate}` : "Selected Date"}
                </p>
                {selectedDateEvents.length > 0 && (
                  <span className="text-xs text-mute">{selectedDateEvents.length} item{selectedDateEvents.length === 1 ? "" : "s"}</span>
                )}
              </div>

              {selectedDateEvents.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {selectedDateEvents.map((event) => {
                    const brand = brands.find((entry) => entry.id === event.brandId);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => openEvent(event)}
                        className="block w-full rounded-xl border border-white/6 bg-black/10 px-3 py-3 text-left transition hover:border-white/12"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-mute">{event.time ?? "All day"}</p>
                            <p className="mt-2 text-sm font-medium text-ink">{event.title}</p>
                            <p className="mt-1 text-xs text-mute">{event.itemType}</p>
                          </div>
                          {brand && (
                            <BrandPill color={brand.color} className="max-w-[8.5rem] px-2 text-[9px] tracking-[0.1em]">
                              {brand.shortName}
                            </BrandPill>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-mute">Select a day with activity to inspect the scheduled items below the grid.</p>
              )}
            </div>
          </div>
        </Panel>
      )}

      {activeView === "Week" && (
        <Panel eyebrow="Week View" title="Week" subtitle="A compact week stack for phone-sized scanning and quick context." accent="yellow">
          <div className="space-y-3">
            {filteredWeekColumns.map((column) => (
              <div key={column.label} className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                <p className="font-display text-[11px] uppercase tracking-[0.24em] text-mute">{column.label}</p>
                <div className="mt-3 space-y-2">
                  {column.items.map((item) => {
                    const brand = brands.find((entry) => entry.id === item.brandId);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const match = filteredEvents.find((entry) => entry.id === item.id);
                          if (match) {
                            openEvent(match);
                          }
                        }}
                        className="block w-full rounded-xl border border-white/6 bg-black/10 px-3 py-3 text-left transition hover:border-white/12"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-mute">{item.time}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${getTypeTone(item.itemType)}`}>
                            {item.itemType}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-ink">{item.title}</p>
                        {brand && (
                          <div className="mt-2">
                            <BrandPill color={brand.color}>{brand.shortName}</BrandPill>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {activeView === "Agenda" && (
        <Panel eyebrow="Agenda View" title="Agenda" subtitle="All upcoming entries with brand and type metadata kept visible." accent="orange">
          <div className="space-y-3">
            {filteredEvents.map((event) => {
              const brand = brands.find((entry) => entry.id === event.brandId);
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => openEvent(event)}
                  className="block w-full rounded-2xl border border-white/6 bg-white/[0.02] p-4 text-left transition hover:border-white/12"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[11px] uppercase tracking-[0.24em] text-mute">{formatAgendaLabel(event)}</p>
                      <p className="mt-3 text-sm font-medium text-ink">{event.title}</p>
                      {event.details && <p className="mt-1 text-sm text-mute">{event.details}</p>}
                    </div>
                    {brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${getTypeTone(event.itemType)}`}>
                      {event.itemType}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      )}

      <PreviewDrawer
        open={Boolean(selectedEvent)}
        onClose={closeEventPreview}
        eyebrow={`Calendar / ${selectedEvent?.itemType ?? "Item"}`}
        title={selectedEvent?.title ?? ""}
        subtitle={selectedEvent ? formatAgendaLabel(selectedEvent) : undefined}
      >
        {selectedEvent ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">Brand</p>
                <div className="mt-3">
                  {(() => {
                    const brand = brands.find((entry) => entry.id === selectedEvent.brandId);
                    return brand ? <BrandPill color={brand.color}>{brand.shortName}</BrandPill> : <p className="text-sm text-mute">No brand</p>;
                  })()}
                </div>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">Type</p>
                <p className="mt-3 text-sm text-mute">{selectedEvent.itemType}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">Status</p>
                <p className="mt-3 text-sm text-mute">{selectedEvent.status ? formatTokenLabel(selectedEvent.status) : "No status"}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">Date / Time</p>
                <p className="mt-3 text-sm text-mute">{formatAgendaLabel(selectedEvent)}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
              <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">Details</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-mute">{selectedEvent.details || "No details added yet."}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedEvent.source === "action" ? (
                <button type="button" onClick={() => router.push(`/tasks?edit=${selectedEvent.sourceId}`)} className="flex-1 rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink">
                  Edit Action
                </button>
              ) : null}
              {selectedEvent.source === "project" ? (
                <button type="button" onClick={() => router.push(`/projects/${selectedEvent.sourceId}`)} className="flex-1 rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink">
                  Open Project
                </button>
              ) : null}
              {selectedEvent.source === "post" ? (
                <button type="button" onClick={() => router.push(selectedEvent.id.startsWith("post-brand-") ? `/brands/${selectedEvent.brandId}#publishing-calendar` : "/content")} className="flex-1 rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink">
                  Open Post
                </button>
              ) : null}
              <button type="button" onClick={closeEventPreview} className="flex-1 rounded-2xl border border-white/8 px-4 py-3 text-sm text-mute transition hover:border-white/14 hover:text-ink">
                Close
              </button>
            </div>
          </div>
        ) : null}
      </PreviewDrawer>

      <PreviewDrawer
        open={Boolean(drawerMode)}
        onClose={closeDrawer}
        eyebrow={`Calendar / ${drawerMode === "edit" ? "Edit" : "Create"}`}
        title={drawerMode === "edit" ? "Edit calendar item" : "New calendar item"}
        subtitle="Changes are saved locally and reflected across the calendar surfaces immediately."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Enter calendar item title"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSelect
              label="Brand"
              value={draft.brandId}
              onChange={(value) => setDraft((current) => ({ ...current, brandId: value as BrandId }))}
              options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
            />
            <FieldSelect
              label="Type"
              value={draft.type}
              onChange={(value) => setDraft((current) => ({ ...current, type: value as CalendarItemType }))}
              options={calendarTypes.map((type) => ({ value: type, label: formatTokenLabel(type) }))}
            />
            <FieldSelect
              label="Status"
              value={draft.status}
              onChange={(value) => setDraft((current) => ({ ...current, status: value as Status }))}
              options={calendarStatuses.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Start</label>
              <input
                type="datetime-local"
                value={draft.start}
                onChange={(event) => setDraft((current) => ({ ...current, start: event.target.value }))}
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">End</label>
              <input
                type="datetime-local"
                value={draft.end}
                onChange={(event) => setDraft((current) => ({ ...current, end: event.target.value }))}
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Action ID</label>
              <input
                value={draft.linkedTaskId}
                onChange={(event) => setDraft((current) => ({ ...current, linkedTaskId: event.target.value }))}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Project ID</label>
              <input
                value={draft.linkedProjectId}
                onChange={(event) => setDraft((current) => ({ ...current, linkedProjectId: event.target.value }))}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Content ID</label>
              <input
                value={draft.linkedContentId}
                onChange={(event) => setDraft((current) => ({ ...current, linkedContentId: event.target.value }))}
                placeholder="Optional"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Planning Context</label>
            <textarea
              rows={4}
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Planning context"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-mute"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            {drawerMode === "edit" ? "Save Changes" : "Save Calendar Item"}
          </button>

          {drawerMode === "edit" && draft.id && (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                >
                  Delete Calendar Item
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-mute">Delete this calendar item from the local schedule? All visible calendar views will update immediately.</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 rounded-2xl border border-orange/35 bg-orange/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
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
