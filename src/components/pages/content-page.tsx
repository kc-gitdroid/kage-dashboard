"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useEffect } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { PreviewDrawer } from "@/components/preview-drawer";
import { createLocalRecordId, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { contentFormats } from "@/data";
import { formatTokenLabel } from "@/lib/format-token-label";
import {
  BrandId,
  ContentAssetStatus,
  ContentCaptionStatus,
  ContentFormat,
  ContentItem,
  Status,
} from "@/types";

const statusToneMap = {
  draft: "border-white/8 text-mute",
  planned: "border-white/8 text-mute",
  active: "border-orange/30 text-orange",
  "in-progress": "border-blue/30 text-blue",
  scheduled: "border-orange/30 text-orange",
  completed: "border-lime/30 text-lime",
  archived: "border-white/8 text-mute",
};

const subStatusToneMap = {
  none: "border-white/8 text-mute",
  draft: "border-blue/30 text-blue",
  ready: "border-lime/30 text-lime",
  needed: "border-white/8 text-mute",
  "in-progress": "border-blue/30 text-blue",
};

const contentStatuses: Status[] = ["draft", "planned", "in-progress", "scheduled", "completed"];
const captionStatuses: ContentCaptionStatus[] = ["none", "draft", "ready"];
const assetStatuses: ContentAssetStatus[] = ["needed", "in-progress", "ready"];

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

const initialDraft: ContentDraft = {
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

function toDraft(item: ContentItem): ContentDraft {
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

export function ContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { brands, contentItems, saveContentItem, deleteContentItem } = useDashboardData();
  const origin = searchParams.get("origin");
  const returnPath = origin === "home" ? "/" : "/content";
  const [brandFilter, setBrandFilter] = useState<string>("All");
  const [formatFilter, setFormatFilter] = useState<string>("All");
  const [draft, setDraft] = useState<ContentDraft>(initialDraft);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filteredItems = useMemo(() => {
    return contentItems.filter((item) => {
      const matchesBrand = brandFilter === "All" || item.brandId === brandFilter;
      const matchesFormat = formatFilter === "All" || item.format === formatFilter;
      return matchesBrand && matchesFormat;
    });
  }, [brandFilter, contentItems, formatFilter]);

  const boardColumns = {
    draft: filteredItems.filter((item) => item.status === "draft"),
    "in-progress": filteredItems.filter((item) => item.status === "in-progress"),
    scheduled: filteredItems.filter((item) => item.status === "scheduled"),
  };

  useEffect(() => {
    const editId = searchParams.get("edit");
    const wantsNew = searchParams.get("new");

    if (editId) {
      const match = contentItems.find((item) => item.id === editId);
      if (match) {
        openEdit(match);
      }
      return;
    }

    if (wantsNew === "1") {
      openCreate();
    }
  }, [contentItems, searchParams]);

  function openCreate() {
    setDraft(initialDraft);
    setDrawerMode("create");
    setConfirmDelete(false);
  }

  function openEdit(item: ContentItem) {
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

  function handleSave() {
    if (!draft.title.trim() || !draft.pillar.trim()) {
      return;
    }

    saveContentItem({
      id: draft.id ?? createLocalRecordId("content"),
      title: draft.title.trim(),
      brandId: draft.brandId,
      format: draft.format,
      pillar: draft.pillar.trim(),
      captionStatus: draft.captionStatus,
      assetStatus: draft.assetStatus,
      scheduleDate: draft.scheduleDate ? new Date(draft.scheduleDate).toISOString().slice(0, 19) : undefined,
      status: draft.status,
      linkedProjectId: draft.linkedProjectId.trim() || undefined,
    });

    closeDrawer();
  }

  function handleDelete() {
    if (!draft.id) {
      return;
    }
    deleteContentItem(draft.id);
    closeDrawer();
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel
        eyebrow="Content / Planner"
        title="Content Planner"
        subtitle="A calm planning layer for brand-led content. Formats, pillars, captions, and assets stay visible together so scheduling reflects each brand world rather than a generic posting queue."
      >
        <div className="grid gap-3 xl:grid-cols-[1fr_1fr_auto]">
          <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
            <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Brand Filter</p>
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
            <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Format Filter</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <FilterChip label="All" active={formatFilter === "All"} onClick={() => setFormatFilter("All")} />
              {contentFormats.map((format) => (
                <FilterChip
                  key={format}
                  label={formatTokenLabel(format)}
                  active={formatFilter === format}
                  onClick={() => setFormatFilter(format)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:w-72">
            <SummaryBox label="Visible Items" value={String(filteredItems.length).padStart(2, "0")} />
            <SummaryBox
              label="Scheduled"
              value={String(filteredItems.filter((item) => item.status === "scheduled").length).padStart(2, "0")}
              accent="blue"
            />
            <button
              type="button"
              onClick={openCreate}
              className="col-span-2 rounded-2xl border border-blue/30 bg-blue/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink transition hover:border-blue/40"
            >
              New Content Item
            </button>
          </div>
        </div>
      </Panel>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel eyebrow="Content / List" title="List View" subtitle="Detailed planning rows for title, format, pillar, caption, assets, schedule, and overall status." accent="blue">
          <div className="space-y-3">
            <div className="hidden rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3 text-xs uppercase tracking-[0.18em] text-mute md:grid md:grid-cols-[1.7fr_0.75fr_0.8fr_1fr_0.9fr_0.9fr_0.8fr_0.8fr] md:gap-3">
              <span>Title</span>
              <span>Brand</span>
              <span>Format</span>
              <span>Pillar</span>
              <span>Caption</span>
              <span>Assets</span>
              <span>Schedule</span>
              <span>Status</span>
            </div>

            {filteredItems.map((item) => {
              const brand = brands.find((entry) => entry.id === item.brandId);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openEdit(item)}
                  className="w-full rounded-2xl border border-white/6 bg-white/[0.02] p-4 text-left transition hover:border-white/12 md:grid md:grid-cols-[1.7fr_0.75fr_0.8fr_1fr_0.9fr_0.9fr_0.8fr_0.8fr] md:items-start md:gap-3"
                >
                  <div className="mb-3 md:mb-0">
                    <p className="text-sm font-medium text-ink md:text-[15px]">{item.title}</p>
                    <p className="mt-2 text-sm text-mute md:hidden">{item.pillar}</p>
                  </div>

                  <div className="mb-3 md:mb-0">{brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}</div>
                  <div className="mb-3 text-sm text-mute md:mb-0">{formatTokenLabel(item.format)}</div>
                  <div className="mb-3 text-sm text-mute md:mb-0">{item.pillar}</div>

                  <div className="mb-3 md:mb-0">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${subStatusToneMap[item.captionStatus]}`}>
                      {formatTokenLabel(item.captionStatus)}
                    </span>
                  </div>

                  <div className="mb-3 md:mb-0">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${subStatusToneMap[item.assetStatus]}`}>
                      {formatTokenLabel(item.assetStatus)}
                    </span>
                  </div>

                  <div className="mb-3 text-sm text-mute md:mb-0">{item.scheduleDate ?? "-"}</div>

                  <div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${statusToneMap[item.status]}`}>
                      {formatTokenLabel(item.status)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel eyebrow="Content / Board" title="Board View" subtitle="A lighter board for quick planning states without turning the page into a heavy production tool." accent="orange">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            {Object.entries(boardColumns).map(([column, items]) => (
              <div key={column} className="rounded-2xl border border-white/6 bg-black/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">{formatTokenLabel(column)}</p>
                  <span className="text-xs text-mute">{String(items.length).padStart(2, "0")}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {items.map((item) => {
                    const brand = brands.find((entry) => entry.id === item.brandId);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openEdit(item)}
                        className="block w-full rounded-xl border border-white/6 bg-white/[0.03] p-3 text-left transition hover:border-white/12"
                      >
                        <p className="text-sm font-medium text-ink">{item.title}</p>
                        <p className="mt-1 text-xs text-mute">
                          {formatTokenLabel(item.format)} / {item.scheduleDate ?? "Unscheduled"}
                        </p>
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
      </section>

      <PreviewDrawer
        open={Boolean(drawerMode)}
        onClose={closeDrawer}
        eyebrow={`Content / ${drawerMode === "edit" ? "Edit" : "Create"}`}
        title={drawerMode === "edit" ? "Edit content item" : "New content item"}
        subtitle="Changes are saved locally and update both the list and board immediately."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Enter content title"
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
              label="Format"
              value={draft.format}
              onChange={(value) => setDraft((current) => ({ ...current, format: value as ContentFormat }))}
              options={contentFormats.map((format) => ({ value: format, label: formatTokenLabel(format) }))}
            />
            <FieldSelect
              label="Status"
              value={draft.status}
              onChange={(value) => setDraft((current) => ({ ...current, status: value as Status }))}
              options={contentStatuses.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
            <FieldSelect
              label="Caption"
              value={draft.captionStatus}
              onChange={(value) => setDraft((current) => ({ ...current, captionStatus: value as ContentCaptionStatus }))}
              options={captionStatuses.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
            <FieldSelect
              label="Assets"
              value={draft.assetStatus}
              onChange={(value) => setDraft((current) => ({ ...current, assetStatus: value as ContentAssetStatus }))}
              options={assetStatuses.map((status) => ({ value: status, label: formatTokenLabel(status) }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Pillar</label>
              <input
                value={draft.pillar}
                onChange={(event) => setDraft((current) => ({ ...current, pillar: event.target.value }))}
                placeholder="Enter content pillar"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Schedule</label>
              <input
                type="datetime-local"
                value={draft.scheduleDate}
                onChange={(event) => setDraft((current) => ({ ...current, scheduleDate: event.target.value }))}
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Linked Project ID</label>
            <input
              value={draft.linkedProjectId}
              onChange={(event) => setDraft((current) => ({ ...current, linkedProjectId: event.target.value }))}
              placeholder="Optional project link"
              className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink"
          >
            {drawerMode === "edit" ? "Save Changes" : "Save Content Item"}
          </button>

          {drawerMode === "edit" && draft.id && (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-orange"
                >
                  Delete Content Item
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-mute">Delete this content item from the local planner? The list and board will update immediately.</p>
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
