"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { workspaceSections } from "@/data";
import { BrandSpace } from "@/types";

type BrandDetailPageProps = {
  brand: BrandSpace;
};

type EditingSection = "overview" | "strategy" | "content" | "notes" | "tasks" | null;

type OverviewDraft = {
  name: string;
  shortName: string;
  description: string;
  summary: string;
  focus: string;
  currentPriority: string;
};

const sectionIds = {
  Overview: "overview",
  Strategy: "strategy",
  Content: "content",
  Projects: "projects",
  Prompts: "prompts",
  Notes: "notes",
  Tasks: "tasks",
} as const;

function SectionList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-6 text-mute">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function toMultiline(items: string[]) {
  return items.join("\n");
}

function fromMultiline(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toOverviewDraft(brand: BrandSpace): OverviewDraft {
  return {
    name: brand.name,
    shortName: brand.shortName,
    description: brand.description,
    summary: brand.summary,
    focus: brand.focus,
    currentPriority: brand.nextAction,
  };
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 5,
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
  accent?: "blue" | "yellow" | "orange" | "lime" | "purple" | "cyan";
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

export function BrandDetailPage({ brand }: BrandDetailPageProps) {
  const { brands, projects, promptItems, saveBrand, saveBrandSpace } = useDashboardData();
  const linkedProjects = projects.filter((project) => project.brandId === brand.id);
  const linkedPrompts = promptItems.filter((prompt) => prompt.brandId === brand.id);

  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [overviewDraft, setOverviewDraft] = useState<OverviewDraft>(() => toOverviewDraft(brand));
  const [blueprintDraft, setBlueprintDraft] = useState(() => toMultiline(brand.blueprint));
  const [guidelinesDraft, setGuidelinesDraft] = useState(() => toMultiline(brand.guidelines));
  const [worldDraft, setWorldDraft] = useState(() => toMultiline(brand.world));
  const [tasksDraft, setTasksDraft] = useState(() => toMultiline(brand.tasks));
  const [contentPlanDraft, setContentPlanDraft] = useState(() => toMultiline(brand.contentPlan));
  const [notesDraft, setNotesDraft] = useState(() => toMultiline(brand.notes));

  function resetSection(section: EditingSection) {
    if (section === "overview") {
      setOverviewDraft(toOverviewDraft(brand));
    } else if (section === "strategy") {
      setBlueprintDraft(toMultiline(brand.blueprint));
      setGuidelinesDraft(toMultiline(brand.guidelines));
      setWorldDraft(toMultiline(brand.world));
    } else if (section === "content") {
      setContentPlanDraft(toMultiline(brand.contentPlan));
    } else if (section === "tasks") {
      setTasksDraft(toMultiline(brand.tasks));
    } else if (section === "notes") {
      setNotesDraft(toMultiline(brand.notes));
    }
  }

  function updateBrandSpace(patch: Partial<BrandSpace>) {
    saveBrandSpace({ ...brand, ...patch });
  }

  function saveOverview() {
    const nextBrandSpace: BrandSpace = {
      ...brand,
      name: overviewDraft.name.trim() || brand.name,
      shortName: overviewDraft.shortName.trim() || brand.shortName,
      description: overviewDraft.description.trim(),
      summary: overviewDraft.summary.trim(),
      focus: overviewDraft.focus.trim(),
      nextAction: overviewDraft.currentPriority.trim(),
    };

    saveBrand({
      ...brands.find((entry) => entry.id === brand.id)!,
      name: nextBrandSpace.name,
      shortName: nextBrandSpace.shortName,
      color: brand.color,
      description: nextBrandSpace.description,
    });
    saveBrandSpace(nextBrandSpace);
    setEditingSection(null);
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel eyebrow={`Workspace / ${brand.name}`} title={brand.name} subtitle={brand.description} accent={brand.tone}>
        <div className="space-y-4">
          <div id={sectionIds.Overview} className="rounded-2xl border border-white/6 bg-black/10 p-4 scroll-mt-24">
            <div className="flex items-center justify-between gap-3">
              <p className="ui-micro-label">Overview</p>
              <div className="flex items-center gap-2">
                <BrandPill color={brand.color}>{brand.shortName}</BrandPill>
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
                      onClick={saveOverview}
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
                    <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Workspace Title</label>
                    <input
                      value={overviewDraft.name}
                      onChange={(event) => setOverviewDraft((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Short Name</label>
                    <input
                      value={overviewDraft.shortName}
                      onChange={(event) => setOverviewDraft((current) => ({ ...current, shortName: event.target.value }))}
                      className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
                    />
                  </div>
                </div>

                <TextAreaField label="Description" value={overviewDraft.description} onChange={(value) => setOverviewDraft((current) => ({ ...current, description: value }))} rows={3} />
                <TextAreaField label="Overview / Summary" value={overviewDraft.summary} onChange={(value) => setOverviewDraft((current) => ({ ...current, summary: value }))} rows={4} />

                <TextAreaField label="Focus" value={overviewDraft.focus} onChange={(value) => setOverviewDraft((current) => ({ ...current, focus: value }))} rows={3} />
                <TextAreaField label="Current Priority" value={overviewDraft.currentPriority} onChange={(value) => setOverviewDraft((current) => ({ ...current, currentPriority: value }))} rows={3} />
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm leading-6 text-mute">{brand.summary}</p>
                <div className="mt-4 rounded-2xl border border-white/6 bg-black/10 p-4">
                  <p className="ui-micro-label">Focus</p>
                  <p className="mt-3 text-sm leading-6 text-mute">{brand.focus}</p>
                </div>
                {brand.nextAction ? (
                  <div className="mt-4 rounded-2xl border border-white/6 bg-black/10 p-4">
                    <p className="ui-micro-label">Current Priority</p>
                    <p className="mt-3 text-sm leading-6 text-mute">{brand.nextAction}</p>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {workspaceSections.map((section) => (
              <a key={section} href={`#${sectionIds[section]}`} className="rounded-full border border-white/8 px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-mute transition hover:border-white/14 hover:text-ink">
                {section}
              </a>
            ))}
          </div>

          <div>
            <Link href="/brands" className="text-sm text-mute hover:text-ink">
              Back to brands overview
            </Link>
          </div>
        </div>
      </Panel>

      <section className="space-y-5 xl:grid xl:grid-cols-2 xl:items-start xl:gap-5 xl:space-y-0">
        <div className="space-y-5">
          <InlineSection
            id={sectionIds.Strategy}
            eyebrow="Workspace / Strategy"
            title="Strategy"
            editing={editingSection === "strategy"}
            onEdit={() => setEditingSection("strategy")}
            onCancel={() => {
              resetSection("strategy");
              setEditingSection(null);
            }}
            onSave={() => {
              updateBrandSpace({
                blueprint: fromMultiline(blueprintDraft),
                guidelines: fromMultiline(guidelinesDraft),
                world: fromMultiline(worldDraft),
              });
              setEditingSection(null);
            }}
            editor={
              <div className="space-y-4">
                <TextAreaField label="Blueprint" value={blueprintDraft} onChange={setBlueprintDraft} rows={6} />
                <TextAreaField label="Guidelines" value={guidelinesDraft} onChange={setGuidelinesDraft} rows={6} />
                <TextAreaField label="World" value={worldDraft} onChange={setWorldDraft} rows={6} />
              </div>
            }
          >
            <div className="space-y-4">
              <div>
                <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Blueprint</p>
                <div className="mt-3">
                  <SectionList items={brand.blueprint} />
                </div>
              </div>
              <div>
                <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Guidelines</p>
                <div className="mt-3">
                  <SectionList items={brand.guidelines} />
                </div>
              </div>
              <div>
                <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">World</p>
                <div className="mt-3">
                  <SectionList items={brand.world} />
                </div>
              </div>
            </div>
          </InlineSection>

          <div id={sectionIds.Projects} className="scroll-mt-24">
            <Panel eyebrow="Workspace / Projects" title="Projects" accent="orange">
              <div className="space-y-3">
                {linkedProjects.length > 0 ? (
                  linkedProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block rounded-2xl border border-white/6 bg-black/10 p-4 transition hover:border-white/12"
                    >
                      <p className="text-sm font-medium text-ink">{project.title}</p>
                      <p className="mt-2 text-sm leading-6 text-mute">{project.summary ?? project.goal}</p>
                      <p className="mt-3 text-xs text-mute">{project.dueDate ? `Due ${project.dueDate}` : `Started ${project.startDate}`}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-mute/75">No linked projects yet. Global project records tied to this workspace will appear here automatically.</p>
                )}
              </div>
            </Panel>
          </div>

          <InlineSection
            id={sectionIds.Notes}
            eyebrow="Workspace / Notes"
            title="Notes"
            editing={editingSection === "notes"}
            onEdit={() => setEditingSection("notes")}
            onCancel={() => {
              resetSection("notes");
              setEditingSection(null);
            }}
            onSave={() => {
              updateBrandSpace({ notes: fromMultiline(notesDraft) });
              setEditingSection(null);
            }}
            editor={<TextAreaField label="Notes" value={notesDraft} onChange={setNotesDraft} rows={8} />}
          >
            <SectionList items={brand.notes} />
          </InlineSection>
        </div>

        <div className="space-y-5">
          <InlineSection
            id={sectionIds.Content}
            eyebrow="Workspace / Content"
            title="Content"
            accent="blue"
            editing={editingSection === "content"}
            onEdit={() => setEditingSection("content")}
            onCancel={() => {
              resetSection("content");
              setEditingSection(null);
            }}
            onSave={() => {
              updateBrandSpace({ contentPlan: fromMultiline(contentPlanDraft) });
              setEditingSection(null);
            }}
            editor={<TextAreaField label="Content Plan" value={contentPlanDraft} onChange={setContentPlanDraft} rows={10} />}
          >
            <SectionList items={brand.contentPlan} />
          </InlineSection>

          <div id={sectionIds.Prompts} className="scroll-mt-24">
            <Panel eyebrow="Workspace / Prompts" title="Prompts">
              <div className="space-y-3">
                {linkedPrompts.length > 0 ? (
                  linkedPrompts.map((prompt) => (
                    <div key={prompt.id} className="rounded-2xl border border-white/6 bg-black/10 p-4">
                      <p className="text-sm font-medium text-ink">{prompt.title}</p>
                      <p className="mt-2 text-sm leading-6 text-mute">{prompt.summary}</p>
                      <p className="mt-3 text-xs text-mute">Updated {prompt.updatedAt}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-mute/75">No prompt records are connected to this workspace yet.</p>
                )}
              </div>
            </Panel>
          </div>

          <InlineSection
            id={sectionIds.Tasks}
            eyebrow="Workspace / Tasks"
            title="Tasks"
            accent="orange"
            editing={editingSection === "tasks"}
            onEdit={() => setEditingSection("tasks")}
            onCancel={() => {
              resetSection("tasks");
              setEditingSection(null);
            }}
            onSave={() => {
              updateBrandSpace({ tasks: fromMultiline(tasksDraft) });
              setEditingSection(null);
            }}
            editor={<TextAreaField label="Tasks" value={tasksDraft} onChange={setTasksDraft} rows={8} />}
          >
            <SectionList items={brand.tasks} />
          </InlineSection>
        </div>
      </section>
    </div>
  );
}
