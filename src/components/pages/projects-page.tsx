"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { PreviewDrawer } from "@/components/preview-drawer";
import { createLocalRecordId, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { brandWorkspaceOrder } from "@/data";
import { formatTokenLabel } from "@/lib/format-token-label";
import { BrandId, ProjectItem } from "@/types";

function formatDateRange(startDate: string, dueDate?: string) {
  const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  if (!dueDate) {
    return start;
  }
  const end = new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  return `${start} - ${end}`;
}

type ProjectDraft = {
  title: string;
  brandId: BrandId | "";
  status: ProjectItem["status"];
  summary: string;
  dueDate: string;
};

const projectStatuses: ProjectItem["status"][] = ["active", "paused", "completed"];

const initialDraft: ProjectDraft = {
  title: "",
  brandId: "",
  status: "active",
  summary: "",
  dueDate: "",
};

function createTodayDateInput() {
  return new Date().toISOString().slice(0, 10);
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

export function ProjectsPage() {
  const { brands, calendarItems, projects, tasks, saveProject } = useDashboardData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectDraft>(initialDraft);

  const orderedBrands = useMemo(
    () =>
      [...brands].sort(
        (a, b) => brandWorkspaceOrder.indexOf(a.id) - brandWorkspaceOrder.indexOf(b.id),
      ),
    [brands],
  );

  function openCreate() {
    setDraft(initialDraft);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDraft(initialDraft);
  }

  function handleSave() {
    if (!draft.title.trim()) {
      return;
    }

    const summary = draft.summary.trim();
    const title = draft.title.trim();

    saveProject({
      id: createLocalRecordId("project"),
      title,
      brandId: draft.brandId || undefined,
      status: draft.status,
      summary: summary || undefined,
      goal: summary || `Define the next outcome for ${title}.`,
      startDate: createTodayDateInput(),
      dueDate: draft.dueDate || undefined,
      milestones: [],
      taskHooks: [],
      calendarAnchors: [],
      notes: [],
    });

    closeDrawer();
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel
        eyebrow="Projects / Overview"
        title="Projects"
        subtitle="A modular view of active work streams across brands, structured so tasks and calendar links can plug in without changing the page logic."
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className="rounded-2xl border border-blue/30 bg-blue/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink transition hover:border-blue/40"
          >
            New Project
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const brand = brands.find((entry) => entry.id === project.brandId);
            const relatedTasks = tasks.filter((task) => task.projectId === project.id);
            const relatedCalendarItems = calendarItems.filter((item) => item.linkedProjectId === project.id);

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-2xl border border-white/6 bg-white/[0.02] p-5 transition hover:border-white/12"
              >
                <article className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Project</p>
                      <h3 className="mt-3 text-2xl font-semibold text-ink">{project.title}</h3>
                    </div>
                    {brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}
                  </div>

                  {project.summary && <p className="text-sm leading-6 text-mute">{project.summary}</p>}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProjectMeta label="Status" value={project.status} />
                    <ProjectMeta label="Timeline" value={formatDateRange(project.startDate, project.dueDate)} />
                    <ProjectMeta label="Goal" value={project.goal} className="sm:col-span-2" />
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
                    <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Connectors</p>
                    <div className="mt-3 grid gap-2 text-sm text-mute">
                      <p>{relatedTasks.length} task references ready</p>
                      <p>{relatedCalendarItems.length} calendar anchors ready</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/6 pt-4">
                    <span className="text-sm text-mute">Open project shell</span>
                    <span className="font-display text-sm uppercase tracking-[0.18em] text-ink group-hover:text-blue">
                      Enter
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </Panel>

      <PreviewDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        eyebrow="Projects / Create"
        title="New project"
        subtitle="Create a new project shell and optionally tie it to a brand."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Project Name</label>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSelect
              label="Brand"
              value={draft.brandId}
              onChange={(value) => setDraft((current) => ({ ...current, brandId: value as BrandId | "" }))}
              options={[
                { value: "", label: "No brand" },
                ...orderedBrands.map((brand) => ({ value: brand.id, label: brand.name })),
              ]}
            />
            <FieldSelect
              label="Status"
              value={draft.status}
              onChange={(value) => setDraft((current) => ({ ...current, status: value as ProjectItem["status"] }))}
              options={projectStatuses.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Description</label>
            <textarea
              rows={4}
              value={draft.summary}
              onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Due Date</label>
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
              className="date-field w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-ink outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-2xl border border-blue/30 bg-blue/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink transition hover:border-blue/40"
          >
            Add Project
          </button>
        </div>
      </PreviewDrawer>
    </div>
  );
}

function ProjectMeta({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/6 bg-panelStrong p-4 ${className}`}>
      <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">{label}</p>
      <p className="mt-3 text-sm leading-6 text-mute">{label === "Status" ? formatTokenLabel(value) : value}</p>
    </div>
  );
}
