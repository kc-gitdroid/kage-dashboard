"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useEffect } from "react";

import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { PreviewDrawer } from "@/components/preview-drawer";
import { createLocalRecordId, useDashboardData } from "@/components/providers/dashboard-data-provider";
import { noteTypes } from "@/data";
import { formatTokenLabel } from "@/lib/format-token-label";
import { BrandId, NoteItem, NoteType } from "@/types";

type DraftState = {
  id?: string;
  title: string;
  brandId?: BrandId;
  type: NoteType;
  body: string;
};

const initialDraft: DraftState = {
  title: "",
  brandId: "personal",
  type: "idea",
  body: "",
};

function toDraft(note: NoteItem): DraftState {
  return {
    id: note.id,
    title: note.title,
    brandId: note.brandId,
    type: note.type,
    body: note.body,
  };
}

export function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { brands, notes, saveNote, deleteNote } = useDashboardData();
  const origin = searchParams.get("origin");
  const returnPath = origin === "home" ? "/" : "/notes";
  const [draft, setDraft] = useState<DraftState>(initialDraft);
  const [brandFilter, setBrandFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesBrand = brandFilter === "All" || note.brandId === brandFilter;
      const matchesType = typeFilter === "All" || note.type === typeFilter;
      return matchesBrand && matchesType;
    });
  }, [notes, brandFilter, typeFilter]);

  const selectedNote = filteredNotes.find((note) => note.id === selectedNoteId) ?? notes.find((note) => note.id === selectedNoteId);

  useEffect(() => {
    const editId = searchParams.get("edit");
    const wantsNew = searchParams.get("new");

    if (editId) {
      const match = notes.find((note) => note.id === editId);
      if (match) {
        startEdit(match);
      }
      return;
    }

    if (wantsNew === "1") {
      resetDraft();
      setSelectedNoteId(null);
    }
  }, [notes, searchParams]);

  function resetDraft() {
    setDraft(initialDraft);
    setConfirmDelete(false);
    router.replace(returnPath);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim() || !draft.body.trim()) {
      return;
    }

    saveNote({
      id: draft.id ?? createLocalRecordId("note"),
      title: draft.title.trim(),
      brandId: draft.brandId,
      type: draft.type,
      body: draft.body.trim(),
      createdAt: draft.id && selectedNote ? selectedNote.createdAt : new Date().toISOString(),
    });

    resetDraft();
    setSelectedNoteId(null);
  }

  function startEdit(note: NoteItem) {
    setSelectedNoteId(note.id);
    setDraft(toDraft(note));
    setConfirmDelete(false);
  }

  function handleDelete() {
    if (!draft.id) {
      return;
    }
    deleteNote(draft.id);
    setSelectedNoteId(null);
    resetDraft();
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel
        eyebrow="Notes / Quick Capture"
        title="Quick Capture"
        subtitle="Fast note entry for ideas, references, meeting fragments, and reflections. Built to stay lightweight and direct."
      >
        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/6 bg-black/10 p-4 md:p-5">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Title</label>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Capture the note title"
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none placeholder:text-mute"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Brand</label>
                  <select
                    value={draft.brandId ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        brandId: event.target.value ? (event.target.value as BrandId) : undefined,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
                  >
                    <option value="">No brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Type</label>
                  <select
                    value={draft.type}
                    onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as NoteType }))}
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ink outline-none"
                  >
                    {noteTypes.map((type) => (
                      <option key={type} value={type}>
                        {formatTokenLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">Note Body</label>
                <textarea
                  value={draft.body}
                  onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
                  placeholder="Write the thought while it's still fresh."
                  rows={6}
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-mute"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl border border-blue/40 bg-blue/10 px-4 py-3 font-display text-[11px] uppercase tracking-[0.22em] text-ink"
                >
                  {draft.id ? "Save Note" : "Add Note"}
                </button>
                {draft.id && (
                  <>
                    <button
                      type="button"
                      onClick={resetDraft}
                      className="rounded-2xl border border-white/8 px-4 py-3 text-sm text-mute transition hover:border-white/14 hover:text-ink"
                    >
                      Clear Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete((current) => !current)}
                      className="rounded-2xl border border-orange/28 bg-orange/8 px-4 py-3 text-sm text-orange transition hover:border-orange/40"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              {draft.id && confirmDelete && (
                <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
                  <p className="text-sm text-mute">Delete this note from the local dashboard? This cannot be undone in the current prototype.</p>
                  <div className="mt-3 flex gap-3">
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
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryBox label="Notes Visible" value={String(filteredNotes.length).padStart(2, "0")} />
            <SummaryBox label="Capture Mode" value="Live" accent="blue" />
            <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4 sm:col-span-2">
              <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Capture Rules</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-mute">
                <p>Keep note entry fast enough for phone use.</p>
                <p>Store just enough metadata to route the note later.</p>
                <p>Stay closer to an inbox than an editor.</p>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Notes / List"
        title="Note Stream"
        subtitle="Recent captures stay easy to scan on desktop and mobile, with light filters for routing and review."
        accent="blue"
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
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
              <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">Type Filter</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterChip label="All" active={typeFilter === "All"} onClick={() => setTypeFilter("All")} />
                {noteTypes.map((type) => (
                  <FilterChip key={type} label={formatTokenLabel(type)} active={typeFilter === type} onClick={() => setTypeFilter(type)} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotes.map((note) => {
              const brand = brands.find((entry) => entry.id === note.brandId);
              const createdAtLabel = new Date(note.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => startEdit(note)}
                  className="block w-full rounded-2xl border border-white/6 bg-white/[0.02] p-4 text-left transition hover:border-white/12 md:p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-base font-medium text-ink">{note.title}</p>
                      <p className="mt-2 text-sm leading-6 text-mute">{note.body}</p>
                    </div>
                    {brand && <BrandPill color={brand.color}>{brand.shortName}</BrandPill>}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-mute">
                    <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px]">{formatTokenLabel(note.type)}</span>
                    <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px]">{createdAtLabel}</span>
                  </div>
                </button>
              );
            })}

            {filteredNotes.length === 0 && (
              <div className="rounded-2xl border border-white/6 bg-black/10 p-6 text-sm text-mute">
                No notes match the current filters.
              </div>
            )}
          </div>
        </div>
      </Panel>

      <PreviewDrawer
        open={Boolean(selectedNote)}
        onClose={() => setSelectedNoteId(null)}
        eyebrow="Notes / Preview"
        title={selectedNote?.title ?? ""}
        subtitle={
          selectedNote
            ? new Date(selectedNote.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : undefined
        }
      >
        {selectedNote && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">Type</p>
                <p className="mt-3 text-sm text-mute">{formatTokenLabel(selectedNote.type)}</p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
                <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">Brand</p>
                <div className="mt-3">
                  {(() => {
                    const brand = brands.find((entry) => entry.id === selectedNote.brandId);
                    return brand ? <BrandPill color={brand.color}>{brand.shortName}</BrandPill> : <p className="text-sm text-mute">No brand</p>;
                  })()}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/6 bg-black/10 p-4">
              <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">Edit State</p>
              <p className="mt-3 text-sm leading-6 text-mute">
                This note is loaded into the main capture form above. Update the fields there and press save to keep the editing flow simple on mobile.
              </p>
            </div>
          </>
        )}
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
