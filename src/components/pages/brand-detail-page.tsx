"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import type {
  BrandCompassStrategy,
  BrandCompassVisualLanguage,
  BrandCompassVoice,
  BrandCompassWorld,
  BrandContentSystem,
  BrandSpace,
  ContentConcept,
  ContentPillar,
  ContentPillarRotationItem,
  ContentRules,
  ContentSeries,
  PublishingCalendarItem,
} from "@/types";

type BrandDetailPageProps = {
  brand: BrandSpace;
};

type EditingSection =
  | "overview"
  | "compassStrategy"
  | "compassVisualLanguage"
  | "compassVoice"
  | "compassWorld"
  | "contentPillars"
  | "contentSeries"
  | "pillarRotation"
  | "contentRules"
  | "legacyContent"
  | "notes"
  | "tasks"
  | null;

type OverviewDraft = {
  name: string;
  shortName: string;
  description: string;
  summary: string;
  focus: string;
  currentPriority: string;
};

type StrategyDraft = Record<keyof BrandCompassStrategy, string>;
type VisualLanguageDraft = Omit<Record<keyof BrandCompassVisualLanguage, string>, "references" | "avoid"> & {
  references: string;
  avoid: string;
};
type VoiceDraft = Omit<Record<keyof BrandCompassVoice, string>, "wordsToUse" | "wordsToAvoid" | "exampleLines"> & {
  wordsToUse: string;
  wordsToAvoid: string;
  exampleLines: string;
};
type WorldDraft = Omit<Record<keyof BrandCompassWorld, string>, "recurringThemes"> & {
  recurringThemes: string;
};

const sectionIds = {
  Overview: "overview",
  Compass: "compass",
  "Content System": "content-system",
  Concepts: "concepts",
  "Publishing Calendar": "publishing-calendar",
  Projects: "projects",
  Prompts: "prompts",
  Notes: "notes",
  Tasks: "tasks",
} as const;

const brandPageSections = ["Compass", "Content System", "Concepts", "Publishing Calendar", "Projects", "Prompts", "Notes", "Tasks"] as const;

const emptyText = "Not defined yet";

const conceptStatuses = ["Idea", "Draft", "Ready", "Scheduled", "Published", "Archived"] as const;
const publishingStatuses = ["Idea", "Draft", "Ready", "Scheduled", "Published"] as const;
const publishingFormats = ["Single", "Carousel", "Reel", "Story", "Other"] as const;

type ConceptModalMode = "create" | "edit" | "view";
type PublishingModalMode = "create" | "edit" | "view";

type ConceptDraft = {
  id: string;
  title: string;
  seriesId: string;
  episodeNumber: string;
  pillarId: string;
  format: string;
  scene: string;
  visualDirection: string;
  productPlacement: string;
  englishCaptionDraft: string;
  japaneseCaptionDraft: string;
  notes: string;
  status: string;
  linkedPromptIds: string;
  linkedActionIds: string;
};

type PublishingDraft = {
  id: string;
  date: string;
  title: string;
  pillarId: string;
  format: string;
  status: string;
  contentConceptId: string;
  sceneBrief: string;
  visualDirection: string;
  productPlacement: string;
  englishCaption: string;
  japaneseCaption: string;
  workingNotes: string;
  linkedPromptIds: string;
  linkedActionIds: string;
};

function SectionList({ items, empty = emptyText }: { items: string[]; empty?: string }) {
  if (items.length === 0) {
    return <p className="text-sm leading-6 text-mute/55">{empty}</p>;
  }

  return (
    <ul className="space-y-2 text-sm leading-6 text-mute">
      {items.map((item) => (
        <li key={item} className="break-words">{item}</li>
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

function compactText(value?: string | null) {
  return value?.trim() ?? "";
}

function firstDefined(...values: Array<string | undefined | null>) {
  return values.map(compactText).find(Boolean) ?? "";
}

function legacyValue(items: string[], prefix: string) {
  const line = items.find((item) => item.toLowerCase().startsWith(`${prefix.toLowerCase()}:`));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
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

function toStrategyDraft(brand: BrandSpace): StrategyDraft {
  const strategy = brand.brandCompass?.strategy ?? {};

  return {
    purpose: firstDefined(strategy.purpose, legacyValue(brand.blueprint, "Purpose")),
    coreBelief: compactText(strategy.coreBelief),
    positioning: firstDefined(strategy.positioning, legacyValue(brand.blueprint, "Audience")),
    promise: firstDefined(strategy.promise, legacyValue(brand.blueprint, "Promise")),
    tension: compactText(strategy.tension),
    neverBecome: compactText(strategy.neverBecome),
  };
}

function toVisualLanguageDraft(brand: BrandSpace): VisualLanguageDraft {
  const visualLanguage = brand.brandCompass?.visualLanguage ?? {};

  return {
    photography: compactText(visualLanguage.photography),
    composition: compactText(visualLanguage.composition),
    colorMood: compactText(visualLanguage.colorMood),
    texture: compactText(visualLanguage.texture),
    lighting: compactText(visualLanguage.lighting),
    references: toMultiline(visualLanguage.references?.length ? visualLanguage.references : brand.guidelines),
    avoid: toMultiline(visualLanguage.avoid),
  };
}

function toVoiceDraft(brand: BrandSpace): VoiceDraft {
  const voice = brand.brandCompass?.voice ?? {};

  return {
    tone: firstDefined(voice.tone, legacyValue(brand.guidelines, "Voice")),
    sentenceStyle: compactText(voice.sentenceStyle),
    wordsToUse: toMultiline(voice.wordsToUse),
    wordsToAvoid: toMultiline(voice.wordsToAvoid),
    captionLogic: compactText(voice.captionLogic),
    ctaStyle: compactText(voice.ctaStyle),
    exampleLines: toMultiline(voice.exampleLines),
  };
}

function toWorldDraft(brand: BrandSpace): WorldDraft {
  const brandWorld = brand.brandCompass?.brandWorld ?? {};

  return {
    emotionalTone: firstDefined(brandWorld.emotionalTone, legacyValue(brand.world, "World essence")),
    culturalTerritory: firstDefined(brandWorld.culturalTerritory, legacyValue(brand.world, "Core territories")),
    recurringThemes: toMultiline(brandWorld.recurringThemes?.length ? brandWorld.recurringThemes : brand.world),
    coreTension: compactText(brandWorld.coreTension),
    feeling: compactText(brandWorld.feeling),
    whatMattersMost: compactText(brandWorld.whatMattersMost),
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

function TextInputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "None",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/8 bg-black px-4 py-3 text-sm text-ink outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FieldRow({
  label,
  value,
  chips,
}: {
  label: string;
  value?: string;
  chips?: string[];
}) {
  const cleanValue = compactText(value);
  const cleanChips = (chips ?? []).filter(Boolean);

  return (
    <div className="min-w-0 rounded-2xl border border-white/6 bg-black/10 p-3">
      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-yellow/80">{label}</p>
      {cleanChips.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cleanChips.map((chip) => (
            <span key={chip} className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[11px] text-mute">
              {chip}
            </span>
          ))}
        </div>
      ) : (
        <p className={`mt-2 break-words text-sm leading-6 ${cleanValue ? "text-mute" : "text-mute/55"}`}>{cleanValue || emptyText}</p>
      )}
    </div>
  );
}

function DetailBlock({ label, items }: { label: string; items: string[] }) {
  if (items.length <= 2) {
    return <FieldRow label={label} chips={items} />;
  }

  return (
    <details className="min-w-0 rounded-2xl border border-white/6 bg-black/10 p-3">
      <summary className="cursor-pointer font-display text-[10px] uppercase tracking-[0.2em] text-yellow/80">
        {label}
      </summary>
      <div className="mt-3">
        <SectionList items={items} />
      </div>
    </details>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-blue/30 bg-blue/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-ink"
    >
      Edit
    </button>
  );
}

function SaveCancel({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
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
  );
}

function PrimaryActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-yellow/30 bg-yellow/10 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-ink"
    >
      {children}
    </button>
  );
}

function DangerButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-red-400/25 bg-red-400/10 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-red-100"
    >
      {children}
    </button>
  );
}

function ModalShell({
  title,
  eyebrow,
  onClose,
  headerMeta,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  headerMeta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[22px] border border-white/12 bg-panel p-4 shadow-panel sm:p-5">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 border-b border-white/8 bg-panel/95 px-4 py-4 backdrop-blur sm:-mx-5 sm:-mt-5 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="ui-micro-label">{eyebrow}</p>
              <h3 className="mt-1 break-words text-lg font-semibold text-ink">{title}</h3>
              {headerMeta ? <div className="mt-3 flex flex-wrap gap-2">{headerMeta}</div> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-mute"
            >
              Close
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConceptForm({
  draft,
  setDraft,
  pillarOptions,
  seriesOptions,
  onSave,
  onCancel,
}: {
  draft: ConceptDraft;
  setDraft: Dispatch<SetStateAction<ConceptDraft>>;
  pillarOptions: Array<{ value: string; label: string }>;
  seriesOptions: Array<{ value: string; label: string }>;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInputField label="Title" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} />
        <SelectField label="Status" value={draft.status} onChange={(value) => setDraft((current) => ({ ...current, status: value }))} options={conceptStatuses.map((status) => ({ value: status, label: status }))} placeholder="Select status" />
        <SelectField label="Pillar" value={draft.pillarId} onChange={(value) => setDraft((current) => ({ ...current, pillarId: value }))} options={pillarOptions} placeholder="Select pillar" />
        <SelectField label="Series" value={draft.seriesId} onChange={(value) => setDraft((current) => ({ ...current, seriesId: value }))} options={seriesOptions} placeholder="No series" />
        <TextInputField label="Episode Number" value={draft.episodeNumber} onChange={(value) => setDraft((current) => ({ ...current, episodeNumber: value }))} />
        <TextInputField label="Format" value={draft.format} onChange={(value) => setDraft((current) => ({ ...current, format: value }))} />
      </div>
      <TextAreaField label="Scene" value={draft.scene} onChange={(value) => setDraft((current) => ({ ...current, scene: value }))} rows={4} />
      <TextAreaField label="Visual Direction" value={draft.visualDirection} onChange={(value) => setDraft((current) => ({ ...current, visualDirection: value }))} rows={4} />
      <TextAreaField label="Product Placement" value={draft.productPlacement} onChange={(value) => setDraft((current) => ({ ...current, productPlacement: value }))} rows={3} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField label="English Caption Draft" value={draft.englishCaptionDraft} onChange={(value) => setDraft((current) => ({ ...current, englishCaptionDraft: value }))} rows={5} />
        <TextAreaField label="Japanese Caption Draft" value={draft.japaneseCaptionDraft} onChange={(value) => setDraft((current) => ({ ...current, japaneseCaptionDraft: value }))} rows={5} />
      </div>
      <TextAreaField label="Notes" value={draft.notes} onChange={(value) => setDraft((current) => ({ ...current, notes: value }))} rows={4} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField label="Linked Prompt IDs" value={draft.linkedPromptIds} onChange={(value) => setDraft((current) => ({ ...current, linkedPromptIds: value }))} rows={3} />
        <TextAreaField label="Linked Action IDs" value={draft.linkedActionIds} onChange={(value) => setDraft((current) => ({ ...current, linkedActionIds: value }))} rows={3} />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <SaveCancel onCancel={onCancel} onSave={onSave} />
      </div>
    </div>
  );
}

function PublishingForm({
  draft,
  setDraft,
  pillarOptions,
  conceptOptions,
  onConceptChange,
  onSave,
  onCancel,
}: {
  draft: PublishingDraft;
  setDraft: Dispatch<SetStateAction<PublishingDraft>>;
  pillarOptions: Array<{ value: string; label: string }>;
  conceptOptions: Array<{ value: string; label: string }>;
  onConceptChange: (conceptId: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInputField label="Date" type="date" value={draft.date} onChange={(value) => setDraft((current) => ({ ...current, date: value }))} />
        <TextInputField label="Title" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} />
        <SelectField label="Pillar" value={draft.pillarId} onChange={(value) => setDraft((current) => ({ ...current, pillarId: value }))} options={pillarOptions} placeholder="Select pillar" />
        <SelectField label="Format" value={draft.format} onChange={(value) => setDraft((current) => ({ ...current, format: value }))} options={publishingFormats.map((format) => ({ value: format, label: format }))} placeholder="Select format" />
        <SelectField label="Status" value={draft.status} onChange={(value) => setDraft((current) => ({ ...current, status: value }))} options={publishingStatuses.map((status) => ({ value: status, label: status }))} placeholder="Select status" />
        <SelectField label="Content Concept" value={draft.contentConceptId} onChange={onConceptChange} options={conceptOptions} placeholder="No linked concept" />
      </div>
      <TextAreaField label="Scene Brief" value={draft.sceneBrief} onChange={(value) => setDraft((current) => ({ ...current, sceneBrief: value }))} rows={4} />
      <TextAreaField label="Visual Direction" value={draft.visualDirection} onChange={(value) => setDraft((current) => ({ ...current, visualDirection: value }))} rows={4} />
      <TextAreaField label="Product Placement" value={draft.productPlacement} onChange={(value) => setDraft((current) => ({ ...current, productPlacement: value }))} rows={3} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField label="English Caption" value={draft.englishCaption} onChange={(value) => setDraft((current) => ({ ...current, englishCaption: value }))} rows={5} />
        <TextAreaField label="Japanese Caption" value={draft.japaneseCaption} onChange={(value) => setDraft((current) => ({ ...current, japaneseCaption: value }))} rows={5} />
      </div>
      <TextAreaField label="Working Notes" value={draft.workingNotes} onChange={(value) => setDraft((current) => ({ ...current, workingNotes: value }))} rows={4} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField label="Linked Prompt IDs" value={draft.linkedPromptIds} onChange={(value) => setDraft((current) => ({ ...current, linkedPromptIds: value }))} rows={3} />
        <TextAreaField label="Linked Action IDs" value={draft.linkedActionIds} onChange={(value) => setDraft((current) => ({ ...current, linkedActionIds: value }))} rows={3} />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <SaveCancel onCancel={onCancel} onSave={onSave} />
      </div>
    </div>
  );
}

function CompassCard({
  title,
  microLabel,
  editing,
  onEdit,
  onCancel,
  onSave,
  children,
  editor,
}: {
  title: string;
  microLabel: string;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: ReactNode;
  editor: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[18px] border border-white/10 bg-black/15 p-4">
      <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <p className="ui-micro-label">{microLabel}</p>
          <h3 className="mt-1 text-base font-semibold text-ink">{title}</h3>
        </div>
        {editing ? <SaveCancel onCancel={onCancel} onSave={onSave} /> : <EditButton onClick={onEdit} />}
      </div>
      <div className="mt-4 space-y-3">{editing ? editor : children}</div>
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
        headerAction={editing ? <SaveCancel onCancel={onCancel} onSave={onSave} /> : <EditButton onClick={onEdit} />}
      >
        <div className="space-y-4">{editing ? editor : children}</div>
      </Panel>
    </div>
  );
}

function normalizeContentSystem(contentSystem?: BrandContentSystem): BrandContentSystem {
  return {
    ...contentSystem,
    contentPillars: contentSystem?.contentPillars ?? [],
    contentSeries: contentSystem?.contentSeries ?? [],
    pillarRotation: contentSystem?.pillarRotation ?? [],
    contentRules: contentSystem?.contentRules ?? [],
  };
}

function serializePillars(pillars: ContentPillar[]) {
  return pillars
    .map((pillar) => {
      const order = String(pillar.order).padStart(2, "0");
      return `${order} | ${pillar.name} | ${pillar.color} | ${pillar.tags.join(", ")} | ${pillar.description}`;
    })
    .join("\n");
}

function createIdFromName(prefix: string, name: string, index: number) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${prefix}-${slug || index + 1}`;
}

function parsePillars(value: string, existing: ContentPillar[]) {
  const existingByName = new Map(existing.map((pillar) => [pillar.name.toLowerCase(), pillar]));

  return fromMultiline(value).map((line, index) => {
    const [orderRaw, nameRaw, colorRaw, tagsRaw, ...descriptionParts] = line.split("|").map((part) => part.trim());
    const name = nameRaw || orderRaw || `Pillar ${index + 1}`;
    const existingPillar = existingByName.get(name.toLowerCase());

    return {
      id: existingPillar?.id ?? createIdFromName("content-pillar", name, index),
      order: Number.parseInt(orderRaw, 10) || index + 1,
      name,
      color: colorRaw || existingPillar?.color || "#F2C94C",
      tags: tagsRaw ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean) : existingPillar?.tags ?? [],
      description: descriptionParts.join(" | ") || existingPillar?.description || "",
      active: existingPillar?.active ?? true,
    };
  });
}

function serializeSeries(series: ContentSeries[]) {
  return series
    .map((item) => {
      const title = item.title ?? item.name;
      return [
        title,
        item.relatedPillarIds?.join(", ") ?? item.pillarId ?? "",
        item.episodeStructure ?? "",
        item.productLogic ?? "",
        item.description ?? "",
      ].join(" | ");
    })
    .join("\n");
}

function parseSeries(value: string, existing: ContentSeries[]) {
  const existingByTitle = new Map(existing.map((item) => [(item.title ?? item.name).toLowerCase(), item]));

  return fromMultiline(value).map((line, index) => {
    const [titleRaw, pillarsRaw, episodeStructureRaw, productLogicRaw, ...descriptionParts] = line.split("|").map((part) => part.trim());
    const title = titleRaw || `Series ${index + 1}`;
    const existingSeries = existingByTitle.get(title.toLowerCase());
    const relatedPillarIds = pillarsRaw.split(",").map((pillar) => pillar.trim()).filter(Boolean);

    return {
      id: existingSeries?.id ?? createIdFromName("content-series", title, index),
      order: existingSeries?.order ?? index + 1,
      name: title,
      title,
      description: descriptionParts.join(" | "),
      relatedPillarIds,
      pillarId: relatedPillarIds[0] ?? existingSeries?.pillarId,
      episodeStructure: episodeStructureRaw,
      productLogic: productLogicRaw,
      active: existingSeries?.active ?? true,
    };
  });
}

function serializeRotation(rotation: Array<string | ContentPillarRotationItem>) {
  return rotation
    .map((item, index) => {
      if (typeof item === "string") {
        return `${index + 1} | ${item} | | `;
      }

      return [item.postNumber ?? index + 1, item.pillarId ?? "", item.format ?? "", item.direction ?? ""].join(" | ");
    })
    .join("\n");
}

function parseRotation(value: string) {
  return fromMultiline(value).map((line, index) => {
    const [postNumberRaw, pillarIdRaw, formatRaw, directionRaw] = line.split("|").map((part) => part.trim());

    return {
      postNumber: Number.parseInt(postNumberRaw, 10) || index + 1,
      pillarId: pillarIdRaw,
      format: formatRaw,
      direction: directionRaw,
    };
  });
}

function serializeContentRules(rules?: string[] | ContentRules) {
  if (Array.isArray(rules)) {
    return rules.join("\n");
  }

  if (!rules) {
    return "";
  }

  return [
    ["Product Role", rules.productRole],
    ["Caption Rules", rules.captionRules],
    ["Visual Rules", rules.visualRules],
    ["Posting Rules", rules.postingRules],
    ["Avoid", rules.avoid],
  ]
    .filter(([, value]) => compactText(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function getContentRuleRows(rules?: string[] | ContentRules) {
  if (Array.isArray(rules)) {
    return rules.map((rule) => {
      const [label, ...rest] = rule.split(":");
      return rest.length > 0
        ? { label: label.trim(), value: rest.join(":").trim() }
        : { label: "Rule", value: rule };
    });
  }

  return [
    { label: "Product Role", value: rules?.productRole },
    { label: "Caption Rules", value: rules?.captionRules },
    { label: "Visual Rules", value: rules?.visualRules },
    { label: "Posting Rules", value: rules?.postingRules },
    { label: "Avoid", value: rules?.avoid },
  ];
}

function displayPillarName(pillars: ContentPillar[], pillarId?: string) {
  return pillars.find((pillar) => pillar.id === pillarId)?.name ?? pillarId ?? emptyText;
}

function getSeriesPillarIds(series: ContentSeries) {
  return series.relatedPillarIds ?? (series.pillarId ? [series.pillarId] : []);
}

function getSeriesTitle(series: ContentSeries) {
  return series.title ?? series.name;
}

function nowIso() {
  return new Date().toISOString();
}

function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function formatReadableDate(value?: string) {
  if (!value) {
    return emptyText;
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parseDateInput(value));
}

function getMonthDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const start = new Date(firstDay);
  const firstDayOffset = (firstDay.getDay() + 6) % 7;
  start.setDate(firstDay.getDate() - firstDayOffset);

  const end = new Date(lastDay);
  const lastDayOffset = (lastDay.getDay() + 6) % 7;
  end.setDate(lastDay.getDate() + (6 - lastDayOffset));

  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function getPillar(pillars: ContentPillar[], pillarId?: string) {
  return pillars.find((pillar) => pillar.id === pillarId);
}

function PillarPill({ pillar }: { pillar?: ContentPillar }) {
  if (!pillar) {
    return (
      <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[11px] text-mute">
        No pillar
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[11px] text-ink"
      title={pillar.name}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pillar.color }} />
      {pillar.name}
    </span>
  );
}

function createEmptyConceptDraft(brand: BrandSpace, pillars: ContentPillar[]): ConceptDraft {
  return {
    id: createLocalId("concept"),
    title: "",
    seriesId: "",
    episodeNumber: "",
    pillarId: pillars[0]?.id ?? "",
    format: "",
    scene: "",
    visualDirection: "",
    productPlacement: "",
    englishCaptionDraft: "",
    japaneseCaptionDraft: "",
    notes: "",
    status: conceptStatuses[0],
    linkedPromptIds: "",
    linkedActionIds: "",
  };
}

function toConceptDraft(concept: ContentConcept): ConceptDraft {
  return {
    id: concept.id,
    title: concept.title,
    seriesId: concept.seriesId ?? "",
    episodeNumber: concept.episodeNumber ? String(concept.episodeNumber) : "",
    pillarId: concept.pillarId ?? "",
    format: concept.format ?? "",
    scene: concept.scene ?? "",
    visualDirection: concept.visualDirection ?? "",
    productPlacement: concept.productPlacement ?? "",
    englishCaptionDraft: concept.englishCaptionDraft ?? "",
    japaneseCaptionDraft: concept.japaneseCaptionDraft ?? "",
    notes: concept.notes ?? "",
    status: concept.status ?? conceptStatuses[0],
    linkedPromptIds: toMultiline(concept.linkedPromptIds),
    linkedActionIds: toMultiline(concept.linkedActionIds),
  };
}

function conceptFromDraft(draft: ConceptDraft, brand: BrandSpace, existing?: ContentConcept): ContentConcept {
  const timestamp = nowIso();

  return {
    id: draft.id || existing?.id || createLocalId("concept"),
    brandId: brand.id,
    title: draft.title.trim() || "Untitled concept",
    seriesId: draft.seriesId || undefined,
    episodeNumber: draft.episodeNumber ? Number.parseInt(draft.episodeNumber, 10) : undefined,
    pillarId: draft.pillarId,
    format: draft.format.trim(),
    scene: draft.scene.trim(),
    visualDirection: draft.visualDirection.trim(),
    productPlacement: draft.productPlacement.trim(),
    englishCaptionDraft: draft.englishCaptionDraft.trim(),
    japaneseCaptionDraft: draft.japaneseCaptionDraft.trim(),
    notes: draft.notes.trim(),
    status: draft.status || conceptStatuses[0],
    linkedPromptIds: fromMultiline(draft.linkedPromptIds),
    linkedActionIds: fromMultiline(draft.linkedActionIds),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function createEmptyPublishingDraft(brand: BrandSpace, pillars: ContentPillar[]): PublishingDraft {
  return {
    id: createLocalId("post"),
    date: toDateInputValue(new Date()),
    title: "",
    pillarId: pillars[0]?.id ?? "",
    format: publishingFormats[0],
    status: "Scheduled",
    contentConceptId: "",
    sceneBrief: "",
    visualDirection: "",
    productPlacement: "",
    englishCaption: "",
    japaneseCaption: "",
    workingNotes: "",
    linkedPromptIds: "",
    linkedActionIds: "",
  };
}

function toPublishingDraft(post: PublishingCalendarItem): PublishingDraft {
  return {
    id: post.id,
    date: post.date,
    title: post.title,
    pillarId: post.pillarId ?? "",
    format: post.format ?? publishingFormats[0],
    status: post.status ?? "Scheduled",
    contentConceptId: post.contentConceptId ?? "",
    sceneBrief: post.sceneBrief ?? "",
    visualDirection: post.visualDirection ?? "",
    productPlacement: post.productPlacement ?? "",
    englishCaption: post.englishCaption ?? "",
    japaneseCaption: post.japaneseCaption ?? "",
    workingNotes: post.workingNotes ?? "",
    linkedPromptIds: toMultiline(post.linkedPromptIds),
    linkedActionIds: toMultiline(post.linkedActionIds),
  };
}

function publishingFromDraft(draft: PublishingDraft, brand: BrandSpace, existing?: PublishingCalendarItem): PublishingCalendarItem {
  const timestamp = nowIso();

  return {
    id: draft.id || existing?.id || createLocalId("post"),
    brandId: brand.id,
    date: draft.date || toDateInputValue(new Date()),
    title: draft.title.trim() || "Untitled post",
    pillarId: draft.pillarId,
    format: draft.format,
    status: draft.status || "Scheduled",
    contentConceptId: draft.contentConceptId || undefined,
    sceneBrief: draft.sceneBrief.trim(),
    visualDirection: draft.visualDirection.trim(),
    productPlacement: draft.productPlacement.trim(),
    englishCaption: draft.englishCaption.trim(),
    japaneseCaption: draft.japaneseCaption.trim(),
    workingNotes: draft.workingNotes.trim(),
    linkedPromptIds: fromMultiline(draft.linkedPromptIds),
    linkedActionIds: fromMultiline(draft.linkedActionIds),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

export function BrandDetailPage({ brand }: BrandDetailPageProps) {
  const { brands, projects, promptItems, saveBrand, saveBrandSpace } = useDashboardData();
  const linkedProjects = projects.filter((project) => project.brandId === brand.id);
  const linkedPrompts = promptItems.filter((prompt) => prompt.brandId === brand.id);
  const contentSystem = normalizeContentSystem(brand.contentSystem);
  const contentPillars = contentSystem.contentPillars ?? [];
  const contentSeries = contentSystem.contentSeries ?? [];
  const pillarRotation = contentSystem.pillarRotation ?? [];
  const contentRules = contentSystem.contentRules;
  const contentConcepts = brand.contentConcepts ?? [];
  const publishingCalendar = brand.publishingCalendar ?? [];
  const seriesOptions = contentSeries.map((series) => ({ value: series.id, label: getSeriesTitle(series) }));
  const pillarOptions = contentPillars.map((pillar) => ({ value: pillar.id, label: pillar.name }));
  const conceptOptions = contentConcepts.map((concept) => ({ value: concept.id, label: concept.title }));
  const hasStructuredContentSystem =
    contentPillars.length > 0 ||
    contentSeries.length > 0 ||
    pillarRotation.length > 0 ||
    (Array.isArray(contentRules) ? contentRules.length > 0 : Boolean(contentRules && Object.keys(contentRules).length > 0));

  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [overviewDraft, setOverviewDraft] = useState<OverviewDraft>(() => toOverviewDraft(brand));
  const [strategyDraft, setStrategyDraft] = useState<StrategyDraft>(() => toStrategyDraft(brand));
  const [visualLanguageDraft, setVisualLanguageDraft] = useState<VisualLanguageDraft>(() => toVisualLanguageDraft(brand));
  const [voiceDraft, setVoiceDraft] = useState<VoiceDraft>(() => toVoiceDraft(brand));
  const [worldDraft, setWorldDraft] = useState<WorldDraft>(() => toWorldDraft(brand));
  const [pillarsDraft, setPillarsDraft] = useState(() => serializePillars(contentPillars));
  const [seriesDraft, setSeriesDraft] = useState(() => serializeSeries(contentSeries));
  const [rotationDraft, setRotationDraft] = useState(() => serializeRotation(pillarRotation));
  const [contentRulesDraft, setContentRulesDraft] = useState(() => serializeContentRules(contentRules));
  const [contentPlanDraft, setContentPlanDraft] = useState(() => toMultiline(brand.contentPlan));
  const [notesDraft, setNotesDraft] = useState(() => toMultiline(brand.notes));
  const [tasksDraft, setTasksDraft] = useState(() => toMultiline(brand.tasks));
  const [conceptModalMode, setConceptModalMode] = useState<ConceptModalMode | null>(null);
  const [conceptDraft, setConceptDraft] = useState<ConceptDraft>(() => createEmptyConceptDraft(brand, contentPillars));
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [conceptPillarFilter, setConceptPillarFilter] = useState("");
  const [conceptStatusFilter, setConceptStatusFilter] = useState("");
  const [publishingModalMode, setPublishingModalMode] = useState<PublishingModalMode | null>(null);
  const [publishingDraft, setPublishingDraft] = useState<PublishingDraft>(() => createEmptyPublishingDraft(brand, contentPillars));
  const [selectedPublishingId, setSelectedPublishingId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const strategyView = toStrategyDraft(brand);
  const visualLanguageView = toVisualLanguageDraft(brand);
  const voiceView = toVoiceDraft(brand);
  const worldView = toWorldDraft(brand);
  const selectedConcept = selectedConceptId ? contentConcepts.find((concept) => concept.id === selectedConceptId) : undefined;
  const selectedPublishingItem = selectedPublishingId
    ? publishingCalendar.find((post) => post.id === selectedPublishingId)
    : undefined;
  const filteredConcepts = contentConcepts.filter((concept) => {
    const pillarMatches = conceptPillarFilter ? concept.pillarId === conceptPillarFilter : true;
    const statusMatches = conceptStatusFilter ? concept.status === conceptStatusFilter : true;
    return pillarMatches && statusMatches;
  });
  const monthDays = getMonthDays(calendarMonth);
  const scheduledByDate = new Map<string, PublishingCalendarItem[]>();
  publishingCalendar.forEach((item) => {
    const existing = scheduledByDate.get(item.date) ?? [];
    scheduledByDate.set(item.date, [...existing, item]);
  });
  const activeConcept = selectedConcept ?? conceptFromDraft(conceptDraft, brand);
  const activePublishingItem = selectedPublishingItem ?? publishingFromDraft(publishingDraft, brand);

  function resetSection(section: EditingSection) {
    if (section === "overview") {
      setOverviewDraft(toOverviewDraft(brand));
    } else if (section === "compassStrategy") {
      setStrategyDraft(toStrategyDraft(brand));
    } else if (section === "compassVisualLanguage") {
      setVisualLanguageDraft(toVisualLanguageDraft(brand));
    } else if (section === "compassVoice") {
      setVoiceDraft(toVoiceDraft(brand));
    } else if (section === "compassWorld") {
      setWorldDraft(toWorldDraft(brand));
    } else if (section === "contentPillars") {
      setPillarsDraft(serializePillars(contentPillars));
    } else if (section === "contentSeries") {
      setSeriesDraft(serializeSeries(contentSeries));
    } else if (section === "pillarRotation") {
      setRotationDraft(serializeRotation(pillarRotation));
    } else if (section === "contentRules") {
      setContentRulesDraft(serializeContentRules(contentRules));
    } else if (section === "legacyContent") {
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

  function startEditing(section: Exclude<EditingSection, null>) {
    resetSection(section);
    setEditingSection(section);
  }

  function updateContentSystem(patch: Partial<BrandContentSystem>) {
    updateBrandSpace({
      contentSystem: {
        ...contentSystem,
        ...patch,
      },
    });
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
    const currentBrand = brands.find((entry) => entry.id === brand.id);

    if (currentBrand) {
      saveBrand({
        ...currentBrand,
        name: nextBrandSpace.name,
        shortName: nextBrandSpace.shortName,
        color: brand.color,
        description: nextBrandSpace.description,
      });
    }

    saveBrandSpace(nextBrandSpace);
    setEditingSection(null);
  }

  function saveCompassStrategy() {
    updateBrandSpace({
      brandCompass: {
        ...brand.brandCompass,
        strategy: { ...strategyDraft },
      },
    });
    setEditingSection(null);
  }

  function saveCompassVisualLanguage() {
    updateBrandSpace({
      brandCompass: {
        ...brand.brandCompass,
        visualLanguage: {
          photography: visualLanguageDraft.photography.trim(),
          composition: visualLanguageDraft.composition.trim(),
          colorMood: visualLanguageDraft.colorMood.trim(),
          texture: visualLanguageDraft.texture.trim(),
          lighting: visualLanguageDraft.lighting.trim(),
          references: fromMultiline(visualLanguageDraft.references),
          avoid: fromMultiline(visualLanguageDraft.avoid),
        },
      },
    });
    setEditingSection(null);
  }

  function saveCompassVoice() {
    updateBrandSpace({
      brandCompass: {
        ...brand.brandCompass,
        voice: {
          tone: voiceDraft.tone.trim(),
          sentenceStyle: voiceDraft.sentenceStyle.trim(),
          wordsToUse: fromMultiline(voiceDraft.wordsToUse),
          wordsToAvoid: fromMultiline(voiceDraft.wordsToAvoid),
          captionLogic: voiceDraft.captionLogic.trim(),
          ctaStyle: voiceDraft.ctaStyle.trim(),
          exampleLines: fromMultiline(voiceDraft.exampleLines),
        },
      },
    });
    setEditingSection(null);
  }

  function saveCompassWorld() {
    updateBrandSpace({
      brandCompass: {
        ...brand.brandCompass,
        brandWorld: {
          emotionalTone: worldDraft.emotionalTone.trim(),
          culturalTerritory: worldDraft.culturalTerritory.trim(),
          recurringThemes: fromMultiline(worldDraft.recurringThemes),
          coreTension: worldDraft.coreTension.trim(),
          feeling: worldDraft.feeling.trim(),
          whatMattersMost: worldDraft.whatMattersMost.trim(),
        },
      },
    });
    setEditingSection(null);
  }

  function openNewConcept() {
    setConceptDraft(createEmptyConceptDraft(brand, contentPillars));
    setSelectedConceptId(null);
    setConceptModalMode("create");
  }

  function openConcept(concept: ContentConcept, mode: ConceptModalMode = "view") {
    setConceptDraft(toConceptDraft(concept));
    setSelectedConceptId(concept.id);
    setConceptModalMode(mode);
  }

  function closeConceptModal() {
    setConceptModalMode(null);
    setSelectedConceptId(null);
  }

  function saveConcept() {
    const existing = contentConcepts.find((concept) => concept.id === conceptDraft.id);
    const nextConcept = conceptFromDraft(conceptDraft, brand, existing);
    const nextConcepts = existing
      ? contentConcepts.map((concept) => (concept.id === nextConcept.id ? nextConcept : concept))
      : [...contentConcepts, nextConcept];

    updateBrandSpace({ contentConcepts: nextConcepts });
    setSelectedConceptId(nextConcept.id);
    setConceptModalMode("view");
  }

  function deleteConcept(conceptId: string) {
    if (!window.confirm("Delete this content concept?")) {
      return;
    }

    updateBrandSpace({
      contentConcepts: contentConcepts.filter((concept) => concept.id !== conceptId),
      publishingCalendar: publishingCalendar.map((post) =>
        post.contentConceptId === conceptId ? { ...post, contentConceptId: undefined, updatedAt: nowIso() } : post,
      ),
    });
    closeConceptModal();
  }

  function openNewPublishingItem() {
    setPublishingDraft(createEmptyPublishingDraft(brand, contentPillars));
    setSelectedPublishingId(null);
    setPublishingModalMode("create");
  }

  function openPublishingItem(item: PublishingCalendarItem, mode: PublishingModalMode = "view") {
    setPublishingDraft(toPublishingDraft(item));
    setSelectedPublishingId(item.id);
    setPublishingModalMode(mode);
  }

  function closePublishingModal() {
    setPublishingModalMode(null);
    setSelectedPublishingId(null);
  }

  function applyConceptPrefill(conceptId: string) {
    const concept = contentConcepts.find((entry) => entry.id === conceptId);
    if (!concept) {
      setPublishingDraft((current) => ({ ...current, contentConceptId: conceptId }));
      return;
    }

    setPublishingDraft((current) => ({
      ...current,
      contentConceptId: concept.id,
      title: current.title || concept.title,
      pillarId: current.pillarId || concept.pillarId || "",
      format: current.format || concept.format || publishingFormats[0],
      sceneBrief: current.sceneBrief || concept.scene || "",
      visualDirection: current.visualDirection || concept.visualDirection || "",
      productPlacement: current.productPlacement || concept.productPlacement || "",
      englishCaption: current.englishCaption || concept.englishCaptionDraft || "",
      japaneseCaption: current.japaneseCaption || concept.japaneseCaptionDraft || "",
      workingNotes: current.workingNotes || concept.notes || "",
    }));
  }

  function savePublishingItem() {
    const existing = publishingCalendar.find((post) => post.id === publishingDraft.id);
    const nextPost = publishingFromDraft(publishingDraft, brand, existing);
    const nextPosts = existing
      ? publishingCalendar.map((post) => (post.id === nextPost.id ? nextPost : post))
      : [...publishingCalendar, nextPost];

    updateBrandSpace({ publishingCalendar: nextPosts });
    setSelectedPublishingId(nextPost.id);
    setPublishingModalMode("view");
  }

  function deletePublishingItem(postId: string) {
    if (!window.confirm("Delete this scheduled post?")) {
      return;
    }

    updateBrandSpace({ publishingCalendar: publishingCalendar.filter((post) => post.id !== postId) });
    closePublishingModal();
  }

  function savePublishingWorkingNotes(post: PublishingCalendarItem, workingNotes: string) {
    updateBrandSpace({
      publishingCalendar: publishingCalendar.map((item) =>
        item.id === post.id ? { ...item, workingNotes, updatedAt: nowIso() } : item,
      ),
    });
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel eyebrow={`Workspace / ${brand.name}`} title={brand.name} subtitle={brand.description} accent={brand.tone}>
        <div className="space-y-4">
          <div id={sectionIds.Overview} className="scroll-mt-24 rounded-2xl border border-white/6 bg-black/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="ui-micro-label">Overview</p>
              <div className="flex flex-wrap items-center gap-2">
                <BrandPill color={brand.color}>{brand.shortName}</BrandPill>
                {editingSection === "overview" ? (
                  <SaveCancel
                    onCancel={() => {
                      resetSection("overview");
                      setEditingSection(null);
                    }}
                    onSave={saveOverview}
                  />
                ) : (
                  <EditButton onClick={() => startEditing("overview")} />
                )}
              </div>
            </div>

            {editingSection === "overview" ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInputField
                    label="Workspace Title"
                    value={overviewDraft.name}
                    onChange={(value) => setOverviewDraft((current) => ({ ...current, name: value }))}
                  />
                  <TextInputField
                    label="Short Name"
                    value={overviewDraft.shortName}
                    onChange={(value) => setOverviewDraft((current) => ({ ...current, shortName: value }))}
                  />
                </div>

                <TextAreaField label="Description" value={overviewDraft.description} onChange={(value) => setOverviewDraft((current) => ({ ...current, description: value }))} rows={3} />
                <TextAreaField label="Overview / Summary" value={overviewDraft.summary} onChange={(value) => setOverviewDraft((current) => ({ ...current, summary: value }))} rows={4} />
                <TextAreaField label="Focus" value={overviewDraft.focus} onChange={(value) => setOverviewDraft((current) => ({ ...current, focus: value }))} rows={3} />
                <TextAreaField label="Current Priority" value={overviewDraft.currentPriority} onChange={(value) => setOverviewDraft((current) => ({ ...current, currentPriority: value }))} rows={3} />
              </div>
            ) : (
              <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
                  <p className="ui-micro-label">Summary</p>
                  <p className="mt-3 text-sm leading-6 text-mute">{brand.summary || emptyText}</p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
                    <p className="ui-micro-label">Focus</p>
                    <p className="mt-3 text-sm leading-6 text-mute">{brand.focus || emptyText}</p>
                  </div>
                  <div className="rounded-2xl border border-yellow/18 bg-yellow/[0.04] p-4">
                    <p className="ui-micro-label">Current Priority</p>
                    <p className="mt-3 text-sm leading-6 text-ink">{brand.nextAction || emptyText}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {brandPageSections.map((section) => (
              <a
                key={section}
                href={`#${sectionIds[section]}`}
                className="rounded-full border border-white/8 px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-mute transition hover:border-white/14 hover:text-ink"
              >
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

      <div id={sectionIds.Compass} className="scroll-mt-24">
        <Panel eyebrow="Workspace / Compass" title="Brand Compass" accent={brand.tone}>
          <div className="grid gap-4 xl:grid-cols-2">
          <CompassCard
            title="Strategy"
            microLabel="Compass / Strategy"
            editing={editingSection === "compassStrategy"}
            onEdit={() => startEditing("compassStrategy")}
            onCancel={() => {
              resetSection("compassStrategy");
              setEditingSection(null);
            }}
            onSave={saveCompassStrategy}
            editor={
              <div className="grid gap-4 md:grid-cols-2">
                <TextAreaField label="Purpose" value={strategyDraft.purpose} onChange={(value) => setStrategyDraft((current) => ({ ...current, purpose: value }))} rows={3} />
                <TextAreaField label="Core Belief" value={strategyDraft.coreBelief} onChange={(value) => setStrategyDraft((current) => ({ ...current, coreBelief: value }))} rows={3} />
                <TextAreaField label="Positioning" value={strategyDraft.positioning} onChange={(value) => setStrategyDraft((current) => ({ ...current, positioning: value }))} rows={3} />
                <TextAreaField label="Promise" value={strategyDraft.promise} onChange={(value) => setStrategyDraft((current) => ({ ...current, promise: value }))} rows={3} />
                <TextAreaField label="Tension" value={strategyDraft.tension} onChange={(value) => setStrategyDraft((current) => ({ ...current, tension: value }))} rows={3} />
                <TextAreaField label="Never Become" value={strategyDraft.neverBecome} onChange={(value) => setStrategyDraft((current) => ({ ...current, neverBecome: value }))} rows={3} />
              </div>
            }
          >
            <FieldRow label="Purpose" value={strategyView.purpose} />
            <FieldRow label="Core Belief" value={strategyView.coreBelief} />
            <FieldRow label="Positioning" value={strategyView.positioning} />
            <FieldRow label="Promise" value={strategyView.promise} />
            <FieldRow label="Tension" value={strategyView.tension} />
            <FieldRow label="Never Become" value={strategyView.neverBecome} />
          </CompassCard>

          <CompassCard
            title="Visual Language"
            microLabel="Compass / Visual"
            editing={editingSection === "compassVisualLanguage"}
            onEdit={() => startEditing("compassVisualLanguage")}
            onCancel={() => {
              resetSection("compassVisualLanguage");
              setEditingSection(null);
            }}
            onSave={saveCompassVisualLanguage}
            editor={
              <div className="grid gap-4 md:grid-cols-2">
                <TextAreaField label="Photography" value={visualLanguageDraft.photography} onChange={(value) => setVisualLanguageDraft((current) => ({ ...current, photography: value }))} rows={3} />
                <TextAreaField label="Composition" value={visualLanguageDraft.composition} onChange={(value) => setVisualLanguageDraft((current) => ({ ...current, composition: value }))} rows={3} />
                <TextAreaField label="Color Mood" value={visualLanguageDraft.colorMood} onChange={(value) => setVisualLanguageDraft((current) => ({ ...current, colorMood: value }))} rows={3} />
                <TextAreaField label="Texture" value={visualLanguageDraft.texture} onChange={(value) => setVisualLanguageDraft((current) => ({ ...current, texture: value }))} rows={3} />
                <TextAreaField label="Lighting" value={visualLanguageDraft.lighting} onChange={(value) => setVisualLanguageDraft((current) => ({ ...current, lighting: value }))} rows={3} />
                <TextAreaField label="References" value={visualLanguageDraft.references} onChange={(value) => setVisualLanguageDraft((current) => ({ ...current, references: value }))} rows={4} />
                <TextAreaField label="Avoid" value={visualLanguageDraft.avoid} onChange={(value) => setVisualLanguageDraft((current) => ({ ...current, avoid: value }))} rows={4} />
              </div>
            }
          >
            <FieldRow label="Photography" value={visualLanguageView.photography} />
            <FieldRow label="Composition" value={visualLanguageView.composition} />
            <FieldRow label="Color Mood" value={visualLanguageView.colorMood} />
            <FieldRow label="Texture" value={visualLanguageView.texture} />
            <FieldRow label="Lighting" value={visualLanguageView.lighting} />
            <DetailBlock label="References" items={fromMultiline(visualLanguageView.references)} />
            <DetailBlock label="Avoid" items={fromMultiline(visualLanguageView.avoid)} />
          </CompassCard>

          <CompassCard
            title="Voice"
            microLabel="Compass / Voice"
            editing={editingSection === "compassVoice"}
            onEdit={() => startEditing("compassVoice")}
            onCancel={() => {
              resetSection("compassVoice");
              setEditingSection(null);
            }}
            onSave={saveCompassVoice}
            editor={
              <div className="grid gap-4 md:grid-cols-2">
                <TextAreaField label="Tone" value={voiceDraft.tone} onChange={(value) => setVoiceDraft((current) => ({ ...current, tone: value }))} rows={3} />
                <TextAreaField label="Sentence Style" value={voiceDraft.sentenceStyle} onChange={(value) => setVoiceDraft((current) => ({ ...current, sentenceStyle: value }))} rows={3} />
                <TextAreaField label="Words to Use" value={voiceDraft.wordsToUse} onChange={(value) => setVoiceDraft((current) => ({ ...current, wordsToUse: value }))} rows={4} />
                <TextAreaField label="Words to Avoid" value={voiceDraft.wordsToAvoid} onChange={(value) => setVoiceDraft((current) => ({ ...current, wordsToAvoid: value }))} rows={4} />
                <TextAreaField label="Caption Logic" value={voiceDraft.captionLogic} onChange={(value) => setVoiceDraft((current) => ({ ...current, captionLogic: value }))} rows={3} />
                <TextAreaField label="CTA Style" value={voiceDraft.ctaStyle} onChange={(value) => setVoiceDraft((current) => ({ ...current, ctaStyle: value }))} rows={3} />
                <TextAreaField label="Example Lines" value={voiceDraft.exampleLines} onChange={(value) => setVoiceDraft((current) => ({ ...current, exampleLines: value }))} rows={4} />
              </div>
            }
          >
            <FieldRow label="Tone" value={voiceView.tone} />
            <FieldRow label="Sentence Style" value={voiceView.sentenceStyle} />
            <FieldRow label="Words to Use" chips={fromMultiline(voiceView.wordsToUse)} />
            <FieldRow label="Words to Avoid" chips={fromMultiline(voiceView.wordsToAvoid)} />
            <FieldRow label="Caption Logic" value={voiceView.captionLogic} />
            <FieldRow label="CTA Style" value={voiceView.ctaStyle} />
            <DetailBlock label="Example Lines" items={fromMultiline(voiceView.exampleLines)} />
          </CompassCard>

          <CompassCard
            title="Brand World"
            microLabel="Compass / World"
            editing={editingSection === "compassWorld"}
            onEdit={() => startEditing("compassWorld")}
            onCancel={() => {
              resetSection("compassWorld");
              setEditingSection(null);
            }}
            onSave={saveCompassWorld}
            editor={
              <div className="grid gap-4 md:grid-cols-2">
                <TextAreaField label="Emotional Tone" value={worldDraft.emotionalTone} onChange={(value) => setWorldDraft((current) => ({ ...current, emotionalTone: value }))} rows={3} />
                <TextAreaField label="Cultural Territory" value={worldDraft.culturalTerritory} onChange={(value) => setWorldDraft((current) => ({ ...current, culturalTerritory: value }))} rows={3} />
                <TextAreaField label="Recurring Themes" value={worldDraft.recurringThemes} onChange={(value) => setWorldDraft((current) => ({ ...current, recurringThemes: value }))} rows={4} />
                <TextAreaField label="Core Tension" value={worldDraft.coreTension} onChange={(value) => setWorldDraft((current) => ({ ...current, coreTension: value }))} rows={3} />
                <TextAreaField label="Feeling" value={worldDraft.feeling} onChange={(value) => setWorldDraft((current) => ({ ...current, feeling: value }))} rows={3} />
                <TextAreaField label="What Matters Most" value={worldDraft.whatMattersMost} onChange={(value) => setWorldDraft((current) => ({ ...current, whatMattersMost: value }))} rows={3} />
              </div>
            }
          >
            <FieldRow label="Emotional Tone" value={worldView.emotionalTone} />
            <FieldRow label="Cultural Territory" value={worldView.culturalTerritory} />
            <DetailBlock label="Recurring Themes" items={fromMultiline(worldView.recurringThemes)} />
            <FieldRow label="Core Tension" value={worldView.coreTension} />
            <FieldRow label="Feeling" value={worldView.feeling} />
            <FieldRow label="What Matters Most" value={worldView.whatMattersMost} />
          </CompassCard>
          </div>
        </Panel>
      </div>

      <div id={sectionIds["Content System"]} className="scroll-mt-24">
        <Panel eyebrow="Workspace / Content System" title="Content System" accent="yellow">
          <div className="space-y-5">
          <div className="rounded-[18px] border border-white/10 bg-black/15 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <p className="ui-micro-label">Content System / Pillars</p>
                <h3 className="mt-1 text-base font-semibold text-ink">Content Pillars</h3>
              </div>
              {editingSection === "contentPillars" ? (
                <SaveCancel
                  onCancel={() => {
                    resetSection("contentPillars");
                    setEditingSection(null);
                  }}
                  onSave={() => {
                    updateContentSystem({ contentPillars: parsePillars(pillarsDraft, contentPillars) });
                    setEditingSection(null);
                  }}
                />
              ) : (
                <EditButton onClick={() => startEditing("contentPillars")} />
              )}
            </div>

            {editingSection === "contentPillars" ? (
              <div className="mt-4">
                <TextAreaField
                  label="One pillar per line: order | name | color | tags | description"
                  value={pillarsDraft}
                  onChange={setPillarsDraft}
                  rows={8}
                />
              </div>
            ) : contentPillars.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {contentPillars
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((pillar) => (
                    <div key={pillar.id} className="min-w-0 rounded-2xl border border-white/8 bg-black/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-yellow/80">
                          {String(pillar.order).padStart(2, "0")}
                        </p>
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pillar.color }} />
                      </div>
                      <h4 className="mt-3 text-sm font-semibold text-ink">{pillar.name}</h4>
                      <p className="mt-2 text-sm leading-6 text-mute">{pillar.description || emptyText}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {pillar.tags.length > 0 ? (
                          pillar.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[11px] text-mute">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-mute/55">No tags yet</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-mute/60">No content pillars defined yet.</p>
            )}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-black/15 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <p className="ui-micro-label">Content System / Series</p>
                  <h3 className="mt-1 text-base font-semibold text-ink">Content Series</h3>
                </div>
                {editingSection === "contentSeries" ? (
                  <SaveCancel
                    onCancel={() => {
                      resetSection("contentSeries");
                      setEditingSection(null);
                    }}
                    onSave={() => {
                      updateContentSystem({ contentSeries: parseSeries(seriesDraft, contentSeries) });
                      setEditingSection(null);
                    }}
                  />
                ) : (
                  <EditButton onClick={() => startEditing("contentSeries")} />
                )}
              </div>

              {editingSection === "contentSeries" ? (
                <div className="mt-4">
                  <TextAreaField
                    label="One series per line: title | related pillar ids | episode structure | product logic | description"
                    value={seriesDraft}
                    onChange={setSeriesDraft}
                    rows={8}
                  />
                </div>
              ) : contentSeries.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {contentSeries.map((series) => (
                    <div key={series.id} className="rounded-2xl border border-white/6 bg-black/10 p-4">
                      <p className="text-sm font-semibold text-ink">{series.title ?? series.name}</p>
                      <p className="mt-2 text-sm leading-6 text-mute">{series.description || emptyText}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <FieldRow
                          label="Related Pillars"
                          chips={getSeriesPillarIds(series).map((pillarId) => displayPillarName(contentPillars, pillarId))}
                        />
                        <FieldRow label="Episode Structure" value={series.episodeStructure} />
                        <FieldRow label="Product Logic" value={series.productLogic} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-mute/60">No content series defined yet.</p>
              )}
            </div>

            <div className="rounded-[18px] border border-white/10 bg-black/15 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <p className="ui-micro-label">Content System / Rotation</p>
                  <h3 className="mt-1 text-base font-semibold text-ink">Pillar Rotation</h3>
                </div>
                {editingSection === "pillarRotation" ? (
                  <SaveCancel
                    onCancel={() => {
                      resetSection("pillarRotation");
                      setEditingSection(null);
                    }}
                    onSave={() => {
                      updateContentSystem({ pillarRotation: parseRotation(rotationDraft) });
                      setEditingSection(null);
                    }}
                  />
                ) : (
                  <EditButton onClick={() => startEditing("pillarRotation")} />
                )}
              </div>

              {editingSection === "pillarRotation" ? (
                <div className="mt-4">
                  <TextAreaField
                    label="One post per line: post number | pillar id | format | direction"
                    value={rotationDraft}
                    onChange={setRotationDraft}
                    rows={8}
                  />
                </div>
              ) : pillarRotation.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {pillarRotation.slice(0, 9).map((item, index) => {
                    const rotationItem = typeof item === "string" ? { postNumber: index + 1, pillarId: item } : item;

                    return (
                      <div key={`${rotationItem.postNumber ?? index}-${rotationItem.pillarId ?? "post"}`} className="min-w-0 rounded-2xl border border-white/6 bg-black/10 p-3">
                        <p className="font-display text-[10px] uppercase tracking-[0.18em] text-yellow/80">
                          Post {rotationItem.postNumber ?? index + 1}
                        </p>
                        <p className="mt-2 truncate text-sm font-medium text-ink">{displayPillarName(contentPillars, rotationItem.pillarId)}</p>
                        <p className="mt-1 text-xs leading-5 text-mute">{rotationItem.format || rotationItem.direction || emptyText}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-mute/60">No pillar rotation defined yet.</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-black/15 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                  <p className="ui-micro-label">Content System / Rules</p>
                  <h3 className="mt-1 text-base font-semibold text-ink">Content Rules</h3>
                </div>
                {editingSection === "contentRules" ? (
                  <SaveCancel
                    onCancel={() => {
                      resetSection("contentRules");
                      setEditingSection(null);
                    }}
                    onSave={() => {
                      updateContentSystem({ contentRules: fromMultiline(contentRulesDraft) });
                      setEditingSection(null);
                    }}
                  />
                ) : (
                  <EditButton onClick={() => startEditing("contentRules")} />
                )}
              </div>

              {editingSection === "contentRules" ? (
                <div className="mt-4">
                  <TextAreaField
                    label="One rule per line. Example: Product Role: product supports the scene"
                    value={contentRulesDraft}
                    onChange={setContentRulesDraft}
                    rows={8}
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {getContentRuleRows(contentRules).some((row) => compactText(row.value)) ? (
                    getContentRuleRows(contentRules).map((row) => <FieldRow key={row.label} label={row.label} value={row.value} />)
                  ) : (
                    <p className="text-sm leading-6 text-mute/60">No content rules defined yet.</p>
                  )}
                </div>
              )}
            </div>

            <InlineSection
              id="legacy-content"
              eyebrow="Workspace / Legacy Content"
              title="Legacy Content"
              accent="blue"
              editing={editingSection === "legacyContent"}
              onEdit={() => startEditing("legacyContent")}
              onCancel={() => {
                resetSection("legacyContent");
                setEditingSection(null);
              }}
              onSave={() => {
                updateBrandSpace({ contentPlan: fromMultiline(contentPlanDraft) });
                setEditingSection(null);
              }}
              editor={<TextAreaField label="Legacy Content Plan" value={contentPlanDraft} onChange={setContentPlanDraft} rows={8} />}
            >
              {hasStructuredContentSystem ? (
                <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
                  <p className="ui-micro-label">Old Content Data</p>
                  <div className="mt-3">
                    <SectionList items={brand.contentPlan} empty="No legacy content notes saved." />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
                  <p className="ui-micro-label">Fallback Source</p>
                  <p className="mt-2 text-sm leading-6 text-mute/75">
                    Structured content system data is not defined yet, so the existing content plan remains visible here.
                  </p>
                  <div className="mt-4">
                    <SectionList items={brand.contentPlan} empty="No legacy content notes saved." />
                  </div>
                </div>
              )}
            </InlineSection>
          </div>
          </div>
        </Panel>
      </div>

      <div id={sectionIds.Concepts} className="scroll-mt-24">
        <Panel
          eyebrow="Workspace / Concepts"
          title="Content Concepts"
          accent={brand.tone}
          headerAction={<PrimaryActionButton onClick={openNewConcept}>Add Content Concept</PrimaryActionButton>}
        >
          <div className="space-y-4">
            {contentPillars.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-black/10 p-4 text-sm leading-6 text-mute/70">
                No content pillars defined yet. Add pillars in Content System first.
              </p>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <SelectField
                label="Filter by pillar"
                value={conceptPillarFilter}
                onChange={setConceptPillarFilter}
                options={pillarOptions}
                placeholder="All pillars"
              />
              <SelectField
                label="Filter by status"
                value={conceptStatusFilter}
                onChange={setConceptStatusFilter}
                options={conceptStatuses.map((status) => ({ value: status, label: status }))}
                placeholder="All statuses"
              />
            </div>

            {contentConcepts.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-black/10 p-4 text-sm leading-6 text-mute/70">
                No content concepts yet. Add reusable ideas, episodes, or post directions for this brand.
              </p>
            ) : filteredConcepts.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-black/10 p-4 text-sm leading-6 text-mute/70">
                No content concepts match this filter.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredConcepts.map((concept) => {
                  const pillar = getPillar(contentPillars, concept.pillarId);
                  const series = contentSeries.find((entry) => entry.id === concept.seriesId);

                  return (
                    <article key={concept.id} className="min-w-0 rounded-[18px] border border-white/10 bg-black/15 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="ui-micro-label">
                            {concept.episodeNumber ? `Episode ${concept.episodeNumber}` : "Concept"}
                          </p>
                          <button
                            type="button"
                            onClick={() => openConcept(concept)}
                            className="mt-1 text-left text-base font-semibold text-ink hover:text-yellow"
                          >
                            {concept.title}
                          </button>
                        </div>
                        <span className="rounded-full border border-white/8 px-2 py-1 text-[11px] text-mute">
                          {concept.status ?? "Idea"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <PillarPill pillar={pillar} />
                        {series ? (
                          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[11px] text-mute">
                            {getSeriesTitle(series)}
                          </span>
                        ) : null}
                        {concept.format ? (
                          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[11px] text-mute">
                            {concept.format}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <FieldRow label="Scene" value={concept.scene} />
                        <FieldRow label="Visual Direction" value={concept.visualDirection} />
                        <FieldRow label="Product Placement" value={concept.productPlacement} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <EditButton onClick={() => openConcept(concept, "edit")} />
                        <DangerButton onClick={() => deleteConcept(concept.id)}>Delete</DangerButton>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </Panel>
      </div>

      <div id={sectionIds["Publishing Calendar"]} className="scroll-mt-24">
        <Panel
          eyebrow="Workspace / Publishing Calendar"
          title="Publishing Calendar"
          accent="yellow"
          headerAction={<PrimaryActionButton onClick={openNewPublishingItem}>Add Scheduled Post</PrimaryActionButton>}
        >
          <div className="space-y-4">
            {contentPillars.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-black/10 p-4 text-sm leading-6 text-mute/70">
                No content pillars defined yet. Add pillars in Content System first.
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/6 bg-black/10 p-4">
              <div>
                <p className="ui-micro-label">Month View</p>
                <h3 className="mt-1 text-lg font-semibold text-ink">{formatMonthTitle(calendarMonth)}</h3>
                <p className="mt-2 text-sm text-mute/70">Posting rhythm: define posts by pillar and date.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                  className="rounded-full border border-white/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-mute"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                  className="rounded-full border border-white/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-mute"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                  className="rounded-full border border-white/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-mute"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {contentPillars.length > 0 ? contentPillars.map((pillar) => <PillarPill key={pillar.id} pillar={pillar} />) : null}
            </div>

            {publishingCalendar.length === 0 ? (
              <p className="rounded-2xl border border-white/6 bg-black/10 p-4 text-sm leading-6 text-mute/70">
                No scheduled posts yet. Add a post to build this brand’s publishing rhythm.
              </p>
            ) : null}

            <div className="hidden overflow-hidden rounded-[18px] border border-white/10 md:block">
              <div className="grid grid-cols-7 border-b border-white/8 bg-white/[0.03]">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="p-3 font-display text-[10px] uppercase tracking-[0.2em] text-mute">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const dateKey = toDateInputValue(day);
                  const posts = scheduledByDate.get(dateKey) ?? [];
                  const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();

                  return (
                    <div key={dateKey} className={`min-h-32 border-b border-r border-white/6 p-2 ${isCurrentMonth ? "bg-black/10" : "bg-black/25 opacity-50"}`}>
                      <p className="font-display text-[10px] uppercase tracking-[0.18em] text-mute">{day.getDate()}</p>
                      <div className="mt-2 space-y-1.5">
                        {posts.map((post) => {
                          const pillar = getPillar(contentPillars, post.pillarId);

                          return (
                            <button
                              key={post.id}
                              type="button"
                              onClick={() => openPublishingItem(post)}
                              className="block w-full rounded-xl border border-white/8 bg-white/[0.03] px-2 py-1 text-left text-[11px] leading-4 text-ink"
                            >
                              <span className="mb-1 block h-1 rounded-full" style={{ backgroundColor: pillar?.color ?? "#F2C94C" }} />
                              <span className="line-clamp-2">{post.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {publishingCalendar
                .filter((post) => {
                  const date = parseDateInput(post.date);
                  return date.getFullYear() === calendarMonth.getFullYear() && date.getMonth() === calendarMonth.getMonth();
                })
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => openPublishingItem(post)}
                    className="w-full rounded-2xl border border-white/8 bg-black/10 p-4 text-left"
                  >
                    <p className="ui-micro-label">{formatReadableDate(post.date)}</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{post.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <PillarPill pillar={getPillar(contentPillars, post.pillarId)} />
                      <span className="rounded-full border border-white/8 px-2 py-1 text-[11px] text-mute">{post.format}</span>
                      <span className="rounded-full border border-white/8 px-2 py-1 text-[11px] text-mute">{post.status}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </Panel>
      </div>

      <section className="space-y-5 xl:grid xl:grid-cols-2 xl:items-start xl:gap-5 xl:space-y-0">
        <div className="space-y-5">
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
            onEdit={() => startEditing("notes")}
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
            onEdit={() => startEditing("tasks")}
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

      {conceptModalMode ? (
        <ModalShell
          eyebrow={conceptModalMode === "create" ? "Concept / New" : "Concept / Detail"}
          title={conceptModalMode === "create" ? "Add Content Concept" : activeConcept.title}
          onClose={closeConceptModal}
          headerMeta={
            <>
              <PillarPill pillar={getPillar(contentPillars, conceptDraft.pillarId || activeConcept.pillarId)} />
              <span className="rounded-full border border-white/8 px-2 py-1 text-[11px] text-mute">
                {conceptDraft.status || activeConcept.status || "Idea"}
              </span>
            </>
          }
        >
          {conceptModalMode === "view" ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <FieldRow label="Title" value={activeConcept.title} />
                <FieldRow label="Pillar" value={displayPillarName(contentPillars, activeConcept.pillarId)} />
                <FieldRow
                  label="Series"
                  value={contentSeries.find((series) => series.id === activeConcept.seriesId)?.name ?? activeConcept.seriesId}
                />
                <FieldRow label="Episode Number" value={activeConcept.episodeNumber ? String(activeConcept.episodeNumber) : ""} />
                <FieldRow label="Format" value={activeConcept.format} />
                <FieldRow label="Status" value={activeConcept.status} />
              </div>
              <FieldRow label="Scene" value={activeConcept.scene} />
              <FieldRow label="Visual Direction" value={activeConcept.visualDirection} />
              <FieldRow label="Product Placement" value={activeConcept.productPlacement} />
              <div className="grid gap-3 md:grid-cols-2">
                <FieldRow label="English Caption Draft" value={activeConcept.englishCaptionDraft} />
                <FieldRow label="Japanese Caption Draft" value={activeConcept.japaneseCaptionDraft} />
              </div>
              <FieldRow label="Notes" value={activeConcept.notes} />
              <div className="grid gap-3 md:grid-cols-2">
                <FieldRow label="Linked Prompts" chips={activeConcept.linkedPromptIds ?? []} />
                <FieldRow label="Linked Actions" chips={activeConcept.linkedActionIds ?? []} />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <EditButton onClick={() => setConceptModalMode("edit")} />
                <DangerButton onClick={() => deleteConcept(activeConcept.id)}>Delete</DangerButton>
              </div>
            </div>
          ) : (
            <ConceptForm
              draft={conceptDraft}
              setDraft={setConceptDraft}
              pillarOptions={pillarOptions}
              seriesOptions={seriesOptions}
              onSave={saveConcept}
              onCancel={closeConceptModal}
            />
          )}
        </ModalShell>
      ) : null}

      {publishingModalMode ? (
        <ModalShell
          eyebrow={publishingModalMode === "create" ? "Publishing / New" : "Publishing / Brief"}
          title={publishingModalMode === "create" ? "Add Scheduled Post" : activePublishingItem.title}
          onClose={closePublishingModal}
          headerMeta={
            <>
              <span className="rounded-full border border-white/8 px-2 py-1 text-[11px] text-mute">
                {formatReadableDate(publishingDraft.date || activePublishingItem.date)}
              </span>
              <PillarPill pillar={getPillar(contentPillars, publishingDraft.pillarId || activePublishingItem.pillarId)} />
              <span className="rounded-full border border-white/8 px-2 py-1 text-[11px] text-mute">
                {publishingDraft.format || activePublishingItem.format || publishingFormats[0]}
              </span>
              <span className="rounded-full border border-white/8 px-2 py-1 text-[11px] text-mute">
                {publishingDraft.status || activePublishingItem.status || "Scheduled"}
              </span>
            </>
          }
        >
          {publishingModalMode === "view" ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <FieldRow label="Date" value={formatReadableDate(activePublishingItem.date)} />
                <FieldRow label="Title" value={activePublishingItem.title} />
                <FieldRow label="Pillar" value={displayPillarName(contentPillars, activePublishingItem.pillarId)} />
                <FieldRow label="Format" value={activePublishingItem.format} />
                <FieldRow label="Status" value={activePublishingItem.status} />
                <FieldRow
                  label="Linked Concept"
                  value={contentConcepts.find((concept) => concept.id === activePublishingItem.contentConceptId)?.title ?? activePublishingItem.contentConceptId}
                />
              </div>
              <FieldRow label="Scene / Episode Brief" value={activePublishingItem.sceneBrief} />
              <FieldRow label="Visual Direction" value={activePublishingItem.visualDirection} />
              <FieldRow label="Product Placement" value={activePublishingItem.productPlacement} />
              <div className="grid gap-3 md:grid-cols-2">
                <FieldRow label="English Caption" value={activePublishingItem.englishCaption} />
                <FieldRow label="Japanese Caption" value={activePublishingItem.japaneseCaption} />
              </div>
              <TextAreaField
                label="Working Notes"
                value={publishingDraft.workingNotes}
                onChange={(value) => setPublishingDraft((current) => ({ ...current, workingNotes: value }))}
                rows={5}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <FieldRow label="Linked Prompts" chips={activePublishingItem.linkedPromptIds ?? []} />
                <FieldRow label="Linked Actions" chips={activePublishingItem.linkedActionIds ?? []} />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => savePublishingWorkingNotes(activePublishingItem, publishingDraft.workingNotes)}
                  className="rounded-full border border-blue/30 bg-blue/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-ink"
                >
                  Save Notes
                </button>
                <EditButton onClick={() => setPublishingModalMode("edit")} />
                <DangerButton onClick={() => deletePublishingItem(activePublishingItem.id)}>Delete</DangerButton>
              </div>
            </div>
          ) : (
            <PublishingForm
              draft={publishingDraft}
              setDraft={setPublishingDraft}
              pillarOptions={pillarOptions}
              conceptOptions={conceptOptions}
              onConceptChange={applyConceptPrefill}
              onSave={savePublishingItem}
              onCancel={closePublishingModal}
            />
          )}
        </ModalShell>
      ) : null}
    </div>
  );
}
