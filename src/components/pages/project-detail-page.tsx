"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { ProjectItem } from "@/data";
import { formatTokenLabel } from "@/lib/format-token-label";

type EditingSection = "overview" | "milestones" | "taskHooks" | "calendarAnchors" | "notes" | null;

type OverviewDraft = {
  title: string;
  summary: string;
  goal: string;
  status: ProjectItem["status"];
  startDate: string;
  dueDate: string;
};

const projectStatuses: ProjectItem["status"][] = ["active", "paused", "completed"];

const sectionIds = {
  Overview: "overview",
  Milestones: "milestones",
  "Linked Tasks": "linked-tasks",
  "Key Dates": "key-dates",
  "Project Notes": "project-notes",
} as const;

function formatDateRange(startDate: string, dueDate?: string) {
  const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  if (!dueDate) {
    return start;
  }
  const end = new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  return `${start} - ${end}`;
}

function List({
  items,
  emptyMessage,
}: {
  items: string[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm leading-6 text-mute/75">{emptyMessage ?? "No items added yet."}</p>;
  }

  return (
    <ul className="space-y-2 text-sm leading-6 text-mute">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function toMultiline(items?: string[]) {
  return (items ?? []).join("\n");
}

function fromMultiline(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none"
      />
    </div>
  );
}

function InlineSection({
  id,
  eyebrow,
  title,
  accent,
  editing,
  onEdit,
  onCancel,
  onSave,
  children,
  editor,
}: {
  id: string;
  eyebrow: string;
  title: string;
  accent?: "blue" | "yellow" | "orange" | "lime";
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
  editor: ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <Panel
        eyebrow={eyebrow}
        title={title}
        accent={accent}
        headerAction={
          editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-white/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-mute"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-full border border-blue/30 bg-blue/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-ink"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full border border-blue/30 bg-blue/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-ink"
            >
              Edit
            </button>
          )
        }
      >
        <div className="space-y-4">{editing ? editor : children}</div>
      </Panel>
    </div>
  );
}

export function ProjectDetailPage({ project }: { project: ProjectItem }) {
  const { brandSpaces, brands, saveProject } = useDashboardData();
  const brand = brands.find((entry) => entry.id === project.brandId);
  const brandSpace = brandSpaces.find((entry) => entry.id === project.brandId);

  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [overviewDraft, setOverviewDraft] = useState<OverviewDraft>({
    title: project.title,
    summary: project.summary ?? "",
    goal: project.goal,
    status: project.status,
    startDate: project.startDate,
    dueDate: project.dueDate ?? "",
  });
  const [milestonesDraft, setMilestonesDraft] = useState(() => toMultiline(project.milestones));
  const [taskHooksDraft, setTaskHooksDraft] = useState(() => toMultiline(project.taskHooks));
  const [calendarAnchorsDraft, setCalendarAnchorsDraft] = useState(() => toMultiline(project.calendarAnchors));
  const [notesDraft, setNotesDraft] = useState(() => toMultiline(project.notes));

  function resetSection(section: EditingSection) {
    if (section === "overview") {
      setOverviewDraft({
        title: project.title,
        summary: project.summary ?? "",
        goal: project.goal,
        status: project.status,
        startDate: project.startDate,
        dueDate: project.dueDate ?? "",
      });
    } else if (section === "milestones") {
      setMilestonesDraft(toMultiline(project.milestones));
    } else if (section === "taskHooks") {
      setTaskHooksDraft(toMultiline(project.taskHooks));
    } else if (section === "calendarAnchors") {
      setCalendarAnchorsDraft(toMultiline(project.calendarAnchors));
    } else if (section === "notes") {
      setNotesDraft(toMultiline(project.notes));
    }
  }

  function updateProject(patch: Partial<ProjectItem>) {
    saveProject({ ...project, ...patch });
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel eyebrow={`Project / ${brand?.name ?? "Project"}`} title={project.title} subtitle={project.summary ?? project.goal} accent={brandSpace?.tone}>
        <div className="space-y-4">
          <div id={sectionIds.Overview} className="scroll-mt-24 rounded-2xl border border-white/6 bg-black/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-[11px] uppercase tracking-[0.24em] text-mute">Overview</p>
              <div className="flex items-center gap-2">
                {brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}
                {editingSection === "overview" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        resetSection("overview");
                        setEditingSection(null);
                      }}
                      className="rounded-full border border-white/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-mute"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateProject({
                          title: overviewDraft.title.trim() || project.title,
                          summary: overviewDraft.summary.trim() || undefined,
                          goal: overviewDraft.goal.trim(),
                          status: overviewDraft.status,
                          startDate: overviewDraft.startDate,
                          dueDate: overviewDraft.dueDate || undefined,
                        });
                        setEditingSection(null);
                      }}
                      className="rounded-full border border-blue/30 bg-blue/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-ink"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingSection("overview")}
                    className="rounded-full border border-blue/30 bg-blue/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-ink"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {editingSection === "overview" ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Project Name</label>
                    <input
                      value={overviewDraft.title}
                      onChange={(event) => setOverviewDraft((current) => ({ ...current, title: event.target.value }))}
                      className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Status</label>
                    <select
                      value={overviewDraft.status}
                      onChange={(event) => setOverviewDraft((current) => ({ ...current, status: event.target.value as ProjectItem["status"] }))}
                      className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
                    >
                      {projectStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatTokenLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Start Date</label>
                    <input
                      type="date"
                      value={overviewDraft.startDate}
                      onChange={(event) => setOverviewDraft((current) => ({ ...current, startDate: event.target.value }))}
                      className="date-field w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-ink outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Due Date</label>
                    <input
                      type="date"
                      value={overviewDraft.dueDate}
                      onChange={(event) => setOverviewDraft((current) => ({ ...current, dueDate: event.target.value }))}
                      className="date-field w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-ink outline-none"
                    />
                  </div>
                </div>

                <TextAreaField label="Overview / Summary" value={overviewDraft.summary} onChange={(value) => setOverviewDraft((current) => ({ ...current, summary: value }))} rows={4} />
                <TextAreaField label="Goal" value={overviewDraft.goal} onChange={(value) => setOverviewDraft((current) => ({ ...current, goal: value }))} rows={4} />
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm leading-6 text-mute">{project.goal}</p>
                <p className="mt-3 text-sm leading-6 text-mute">
                  <span className="text-ink">Status:</span> {formatTokenLabel(project.status)}
                </p>
                <p className="mt-2 text-sm leading-6 text-mute">
                  <span className="text-ink">Timeline:</span> {formatDateRange(project.startDate, project.dueDate)}
                </p>
                {project.summary ? (
                  <p className="mt-2 text-sm leading-6 text-mute">
                    <span className="text-ink">Summary:</span> {project.summary}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-mute">This project is editable inline. Updates here stay in the project view and immediately reflect in connected project states.</p>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(sectionIds).map(([label, id]) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-mute transition hover:border-white/14 hover:text-ink">
                {label}
              </a>
            ))}
          </div>

          <div>
            <Link href="/projects" className="text-sm text-mute hover:text-ink">
              Back to projects overview
            </Link>
          </div>
        </div>
      </Panel>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <InlineSection
          id={sectionIds.Milestones}
          eyebrow="Project / Milestones"
          title="Milestones"
          accent="blue"
          editing={editingSection === "milestones"}
          onEdit={() => setEditingSection("milestones")}
          onCancel={() => {
            resetSection("milestones");
            setEditingSection(null);
          }}
          onSave={() => {
            updateProject({ milestones: fromMultiline(milestonesDraft) });
            setEditingSection(null);
          }}
          editor={<TextAreaField label="Milestones" value={milestonesDraft} onChange={setMilestonesDraft} rows={8} />}
        >
          <List
            items={project.milestones ?? []}
            emptyMessage="Add the major checkpoints this project needs to reach. Example: draft approved, assets finalized, delivery sent."
          />
        </InlineSection>

        <InlineSection
          id={sectionIds["Key Dates"]}
          eyebrow="Project / Calendar"
          title="Key Dates"
          accent="lime"
          editing={editingSection === "calendarAnchors"}
          onEdit={() => setEditingSection("calendarAnchors")}
          onCancel={() => {
            resetSection("calendarAnchors");
            setEditingSection(null);
          }}
          onSave={() => {
            updateProject({ calendarAnchors: fromMultiline(calendarAnchorsDraft) });
            setEditingSection(null);
          }}
          editor={<TextAreaField label="Key Dates" value={calendarAnchorsDraft} onChange={setCalendarAnchorsDraft} rows={8} />}
        >
          <List
            items={project.calendarAnchors ?? []}
            emptyMessage="Add the important dates connected to this project. Example: review date, delivery deadline, client meeting."
          />
        </InlineSection>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <InlineSection
          id={sectionIds["Linked Tasks"]}
          eyebrow="Project / Related Tasks"
          title="Linked Tasks"
          accent="orange"
          editing={editingSection === "taskHooks"}
          onEdit={() => setEditingSection("taskHooks")}
          onCancel={() => {
            resetSection("taskHooks");
            setEditingSection(null);
          }}
          onSave={() => {
            updateProject({ taskHooks: fromMultiline(taskHooksDraft) });
            setEditingSection(null);
          }}
          editor={<TextAreaField label="Linked Tasks" value={taskHooksDraft} onChange={setTaskHooksDraft} rows={8} />}
        >
          <List
            items={project.taskHooks ?? []}
            emptyMessage="Add the actionable tasks tied to this project. Example: export assets, revise copy, send review email."
          />
        </InlineSection>

        <InlineSection
          id={sectionIds["Project Notes"]}
          eyebrow="Project / Notes"
          title="Project Notes"
          editing={editingSection === "notes"}
          onEdit={() => setEditingSection("notes")}
          onCancel={() => {
            resetSection("notes");
            setEditingSection(null);
          }}
          onSave={() => {
            updateProject({ notes: fromMultiline(notesDraft) });
            setEditingSection(null);
          }}
          editor={<TextAreaField label="Project Notes" value={notesDraft} onChange={setNotesDraft} rows={8} />}
        >
          <List
            items={project.notes ?? []}
            emptyMessage="Add supporting context, reminders, or important details for this project. Example: client preferences, delivery notes, internal observations."
          />
        </InlineSection>
      </section>
    </div>
  );
}
