"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useEffect } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { PreviewDrawer } from "@/components/preview-drawer";
import { createLocalRecordId, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { taskCategories, taskPriorities, taskStatuses } from "@/data";
import { formatTokenLabel } from "@/lib/format-token-label";
import { BrandId, Priority, Status, TaskCategory, TaskItem } from "@/types";

const priorityToneMap = {
  low: "border-white/8 text-mute",
  medium: "border-blue/30 text-blue",
  high: "border-orange/30 text-orange",
};

const statusToneMap = {
  draft: "border-white/8 text-mute",
  planned: "border-white/8 text-ink",
  active: "border-orange/30 text-orange",
  "in-progress": "border-blue/30 text-blue",
  scheduled: "border-blue/30 text-blue",
  completed: "border-lime/30 text-lime",
  archived: "border-white/8 text-mute",
};

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

const initialTaskDraft: TaskDraft = {
  title: "",
  brandId: "aai",
  dueDate: "2026-04-10",
  priority: "medium",
  category: "content",
  status: "planned",
  projectId: "",
  notes: "",
};

function toDraft(task: TaskItem): TaskDraft {
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

export function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { brands, tasks, saveTask, deleteTask } = useDashboardData();
  const [brandFilter, setBrandFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [draft, setDraft] = useState<TaskDraft>(initialTaskDraft);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesBrand = brandFilter === "All" || task.brandId === brandFilter;
        const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
        const matchesStatus = statusFilter === "All" || task.status === statusFilter;

        return matchesBrand && matchesPriority && matchesStatus;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [brandFilter, priorityFilter, statusFilter, tasks]);

  const openCount = filteredTasks.filter((task) => task.status !== "completed").length;

  useEffect(() => {
    const editId = searchParams.get("edit");
    const wantsNew = searchParams.get("new");

    if (editId) {
      const match = tasks.find((task) => task.id === editId);
      if (match) {
        openEdit(match);
      }
      return;
    }

    if (wantsNew === "1") {
      openCreate();
    }
  }, [searchParams, tasks]);

  function openCreate() {
    setDraft(initialTaskDraft);
    setDrawerMode("create");
    setConfirmDelete(false);
  }

  function openEdit(task: TaskItem) {
    setDraft(toDraft(task));
    setDrawerMode("edit");
    setConfirmDelete(false);
  }

  function closeDrawer() {
    setDrawerMode(null);
    setDraft(initialTaskDraft);
    setConfirmDelete(false);
    router.replace("/tasks");
  }

  function handleSave() {
    if (!draft.title.trim() || !draft.dueDate) {
      return;
    }

    saveTask({
      id: draft.id ?? createLocalRecordId("task"),
      title: draft.title.trim(),
      brandId: draft.brandId,
      dueDate: draft.dueDate,
      priority: draft.priority,
      category: draft.category,
      status: draft.status,
      projectId: draft.projectId.trim() || undefined,
      notes: draft.notes.trim() || undefined,
    });

    closeDrawer();
  }

  function handleDelete() {
    if (!draft.id) {
      return;
    }
    deleteTask(draft.id);
    closeDrawer();
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel
        eyebrow="Tasks / System"
        title="Task list"
        subtitle="A straightforward operating list for work that needs ownership, timing, and status without turning into a project-management maze."
      >
        <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
              <p className="font-display text-[11px] uppercase tracking-[0.24em] text-mute">Brand</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterChip label="All" active={brandFilter === "All"} onClick={() => setBrandFilter("All")} />
                {brands.map((brand) => (
                  <button key={brand.id} onClick={() => setBrandFilter(brand.id)} type="button">
                    <span className={brandFilter === brand.id ? "opacity-100" : "opacity-70"}>
                      <BrandPill color={brand.color}>{brand.shortName}</BrandPill>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
              <p className="font-display text-[11px] uppercase tracking-[0.24em] text-mute">Priority</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterChip label="All" active={priorityFilter === "All"} onClick={() => setPriorityFilter("All")} />
                {taskPriorities.map((priority) => (
                  <FilterChip
                    key={priority}
                    label={formatTokenLabel(priority)}
                    active={priorityFilter === priority}
                    onClick={() => setPriorityFilter(priority)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
              <p className="font-display text-[11px] uppercase tracking-[0.24em] text-mute">Status</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterChip label="All" active={statusFilter === "All"} onClick={() => setStatusFilter("All")} />
                {taskStatuses.map((status) => (
                  <FilterChip
                    key={status}
                    label={formatTokenLabel(status)}
                    active={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:w-72">
            <SummaryBox label="Visible Tasks" value={String(filteredTasks.length).padStart(2, "0")} />
            <SummaryBox label="Open Items" value={String(openCount).padStart(2, "0")} accent="blue" />
            <button
              type="button"
              onClick={openCreate}
              className="col-span-2 rounded-2xl border border-blue/30 bg-blue/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink transition hover:border-blue/40"
            >
              New Task
            </button>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Tasks / List"
        title="Active queue"
        subtitle="Cards stay generous on mobile, while larger screens tighten into more row-like scans."
        accent="blue"
      >
        <div className="space-y-3">
          <div className="hidden rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3 text-xs uppercase tracking-[0.18em] text-mute md:grid md:grid-cols-[1.9fr_0.8fr_0.8fr_0.9fr_0.9fr_0.9fr] md:gap-3">
            <span>Title</span>
            <span>Brand</span>
            <span>Due</span>
            <span>Priority</span>
            <span>Category</span>
            <span>Status</span>
          </div>

          {filteredTasks.map((task) => {
            const brand = brands.find((entry) => entry.id === task.brandId);

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => openEdit(task)}
                className="w-full rounded-2xl border border-white/6 bg-white/[0.02] p-4 text-left transition hover:border-white/12 md:grid md:grid-cols-[1.9fr_0.8fr_0.8fr_0.9fr_0.9fr_0.9fr] md:items-center md:gap-3"
              >
                <div className="mb-3 md:mb-0">
                  <p className="text-sm font-medium text-ink md:text-[15px]">{task.title}</p>
                  <p className="mt-1 text-sm text-mute md:hidden">{formatTokenLabel(task.category)}</p>
                </div>

                <div className="mb-3 md:mb-0">{brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}</div>
                <div className="mb-3 text-sm text-mute md:mb-0">{task.dueDate}</div>

                <div className="mb-3 md:mb-0">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${priorityToneMap[task.priority]}`}>
                    {formatTokenLabel(task.priority)}
                  </span>
                </div>

                <div className="mb-3 text-sm text-mute md:mb-0">{formatTokenLabel(task.category)}</div>

                <div>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${statusToneMap[task.status]}`}>
                    {formatTokenLabel(task.status)}
                  </span>
                </div>
              </button>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="rounded-2xl border border-white/6 bg-black/10 p-6 text-sm text-mute">
              No tasks match the current filters.
            </div>
          )}
        </div>
      </Panel>

      <PreviewDrawer
        open={Boolean(drawerMode)}
        onClose={closeDrawer}
        eyebrow={`Tasks / ${drawerMode === "edit" ? "Edit" : "Create"}`}
        title={drawerMode === "edit" ? "Edit task" : "New task"}
        subtitle="Changes are saved locally and update the visible queue immediately."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Enter task title"
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
              label="Status"
              value={draft.status}
              onChange={(value) => setDraft((current) => ({ ...current, status: value as Status }))}
              options={taskStatuses.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
            <FieldSelect
              label="Priority"
              value={draft.priority}
              onChange={(value) => setDraft((current) => ({ ...current, priority: value as Priority }))}
              options={taskPriorities.map((priority) => ({ value: priority, label: formatTokenLabel(priority) }))}
            />
            <FieldSelect
              label="Category"
              value={draft.category}
              onChange={(value) => setDraft((current) => ({ ...current, category: value as TaskCategory }))}
              options={taskCategories.map((category) => ({ value: category, label: formatTokenLabel(category) }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Due Date</label>
              <input
                type="date"
                value={draft.dueDate}
                onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
                className="date-field w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-ink outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Project ID</label>
              <input
                value={draft.projectId}
                onChange={(event) => setDraft((current) => ({ ...current, projectId: event.target.value }))}
                placeholder="Optional project link"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Notes</label>
            <textarea
              rows={5}
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Add context or execution notes"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-mute"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            {drawerMode === "edit" ? "Save Changes" : "Save Task"}
          </button>

          {drawerMode === "edit" && draft.id && (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                >
                  Delete Task
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-mute">Delete this task from the local dashboard? This updates the visible UI immediately.</p>
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

function FilterChip({
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
      className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] ${
        active ? "border-blue/40 bg-blue/10 text-ink" : "border-white/8 text-mute"
      }`}
    >
      {label}
    </button>
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

function SummaryBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "blue";
}) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-blue/30 bg-blue/8" : "border-white/6 bg-white/[0.02]"}`}>
      <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">{label}</p>
      <p className={`mt-3 font-display text-3xl uppercase ${accent ? "text-blue" : "text-ink"}`}>{value}</p>
    </div>
  );
}
