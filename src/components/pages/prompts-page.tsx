"use client";

import { useMemo, useState } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { PreviewDrawer } from "@/components/preview-drawer";
import { createLocalRecordId, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { brandWorkspaceOrder } from "@/data";
import { formatTokenLabel } from "@/lib/format-token-label";
import { BrandId, PromptItem, Status } from "@/types";

const statusToneMap = {
  draft: "border-white/8 text-mute",
  planned: "border-white/8 text-mute",
  active: "border-blue/30 text-blue",
  "in-progress": "border-blue/30 text-blue",
  scheduled: "border-orange/30 text-orange",
  completed: "border-lime/30 text-lime",
  archived: "border-white/8 text-mute",
};

const promptStatuses: Status[] = ["draft", "planned", "active", "in-progress", "completed", "archived"];

type PromptDraft = {
  id?: string;
  title: string;
  brandId: BrandId | "global";
  summary: string;
  body: string;
  status: Status;
};

const initialDraft: PromptDraft = {
  title: "",
  brandId: "global",
  summary: "",
  body: "",
  status: "draft",
};

function toDraft(item: PromptItem): PromptDraft {
  return {
    id: item.id,
    title: item.title,
    brandId: item.brandId ?? "global",
    summary: item.summary,
    body: item.body,
    status: item.status,
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

export function PromptsPage() {
  const { brands, promptItems, savePromptItem, deletePromptItem } = useDashboardData();
  const [brandFilter, setBrandFilter] = useState<string>("All");
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [draft, setDraft] = useState<PromptDraft>(initialDraft);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const orderedBrands = useMemo(
    () =>
      [...brands].sort(
        (a, b) => brandWorkspaceOrder.indexOf(a.id) - brandWorkspaceOrder.indexOf(b.id),
      ),
    [brands],
  );

  const filteredPrompts = useMemo(() => {
    return promptItems.filter((item) => brandFilter === "All" || item.brandId === brandFilter);
  }, [brandFilter, promptItems]);

  function openCreate() {
    setDraft(initialDraft);
    setDrawerMode("create");
    setConfirmDelete(false);
  }

  function openEdit(item: PromptItem) {
    setDraft(toDraft(item));
    setDrawerMode("edit");
    setConfirmDelete(false);
  }

  function closeDrawer() {
    setDrawerMode(null);
    setDraft(initialDraft);
    setConfirmDelete(false);
  }

  function handleSave() {
    if (!draft.title.trim() || !draft.summary.trim() || !draft.body.trim()) {
      return;
    }

    savePromptItem({
      id: draft.id ?? createLocalRecordId("prompt"),
      title: draft.title.trim(),
      brandId: draft.brandId === "global" ? undefined : draft.brandId,
      summary: draft.summary.trim(),
      body: draft.body.trim(),
      status: draft.status,
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    closeDrawer();
  }

  function handleDelete() {
    if (!draft.id) {
      return;
    }

    deletePromptItem(draft.id);
    closeDrawer();
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel
        eyebrow="Prompts / Workspace"
        title="Prompt Library"
        subtitle="A global working area for prompt systems, generation scaffolds, and reusable AI workflows across brands and private work."
      >
        <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
            <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Workspace Filter</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <FilterChip label="All" active={brandFilter === "All"} onClick={() => setBrandFilter("All")} />
              {orderedBrands.map((brand) => (
                <button key={brand.id} type="button" onClick={() => setBrandFilter(brand.id)}>
                  <span className={brandFilter === brand.id ? "opacity-100" : "opacity-70"}>
                    <BrandPill color={brand.color}>{brand.shortName}</BrandPill>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:w-72">
            <SummaryBox label="Visible" value={String(filteredPrompts.length).padStart(2, "0")} />
            <SummaryBox
              label="Active"
              value={String(filteredPrompts.filter((item) => item.status === "active").length).padStart(2, "0")}
              accent="blue"
            />
            <button
              type="button"
              onClick={openCreate}
              className="col-span-2 rounded-2xl border border-blue/30 bg-blue/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink transition hover:border-blue/40"
            >
              New Prompt
            </button>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Prompts / Index"
        title="Reusable prompt records"
        subtitle="Prompt records stay global here, but can also surface inside each brand workspace so prompt logic doesn’t feel detached from the work it supports."
        accent="blue"
      >
        <div className="space-y-3">
          {filteredPrompts.map((item) => {
            const brand = item.brandId ? orderedBrands.find((entry) => entry.id === item.brandId) : null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openEdit(item)}
                className="w-full rounded-2xl border border-white/6 bg-white/[0.02] p-4 text-left transition hover:border-white/12"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink md:text-[15px]">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-mute">{item.summary}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {brand ? <BrandPill color={brand.color}>{brand.shortName}</BrandPill> : null}
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${statusToneMap[item.status]}`}>
                      {formatTokenLabel(item.status)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredPrompts.length === 0 ? (
            <div className="rounded-2xl border border-white/6 bg-black/10 p-6 text-sm text-mute">
              No prompt records match the current workspace filter.
            </div>
          ) : null}
        </div>
      </Panel>

      <PreviewDrawer
        open={Boolean(drawerMode)}
        onClose={closeDrawer}
        eyebrow={`Prompts / ${drawerMode === "edit" ? "Edit" : "Create"}`}
        title={drawerMode === "edit" ? "Edit prompt" : "New prompt"}
        subtitle="Prompt changes save locally and update the app immediately."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
            />
          </div>

          <FieldSelect
            label="Workspace"
            value={draft.brandId}
            onChange={(value) => setDraft((current) => ({ ...current, brandId: value as BrandId | "global" }))}
            options={[
              { value: "global", label: "Global" },
              ...orderedBrands.map((brand) => ({ value: brand.id, label: brand.name })),
            ]}
          />

          <FieldSelect
            label="Status"
            value={draft.status}
            onChange={(value) => setDraft((current) => ({ ...current, status: value as Status }))}
            options={promptStatuses.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
          />

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Summary</label>
            <textarea
              rows={3}
              value={draft.summary}
              onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Prompt Body</label>
            <textarea
              rows={10}
              value={draft.body}
              onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-2xl border border-blue/30 bg-blue/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink transition hover:border-blue/40"
          >
            {drawerMode === "edit" ? "Save Prompt" : "Add Prompt"}
          </button>

          {drawerMode === "edit" && draft.id ? (
            <div className="space-y-3">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/30 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange transition hover:border-orange/45"
                >
                  Delete Prompt
                </button>
              ) : (
                <div className="rounded-2xl border border-orange/20 bg-orange/8 p-4">
                  <p className="text-sm text-mute">Delete this prompt record from the dashboard? Prompt views will update immediately.</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="rounded-full border border-orange/35 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-orange"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-full border border-white/8 px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-mute"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
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
