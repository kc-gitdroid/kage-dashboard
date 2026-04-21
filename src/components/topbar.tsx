import { SyncStatusPill } from "@/components/sync-status-pill";

export function Topbar() {
  return (
    <div className="mb-5 flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden border-b border-white/5 pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
      <div className="w-full min-w-0 max-w-full md:w-auto">
        <p className="ui-eyebrow">Kage Dashboard</p>
        <div className="mt-2.5 flex items-center justify-between gap-3 md:block">
          <h1 className="pixel-title min-w-0 max-w-full overflow-hidden whitespace-nowrap font-arcade text-[clamp(1.12rem,6.35vw,4.6rem)] uppercase leading-none tracking-[0.03em] sm:tracking-[0.08em]">
            Command Center
          </h1>
          <SyncStatusPill className="flex shrink-0 justify-end md:hidden" compact />
        </div>
      </div>

      <div className="grid w-full min-w-0 max-w-full gap-2 overflow-hidden rounded-[20px] border border-white/5 bg-white/[0.018] p-3 text-[13px] text-mute md:w-auto md:min-w-[18rem] md:p-3.5 md:text-sm">
        <div className="flex w-full min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 flex-none">Status</span>
          <span className="min-w-0 truncate text-right font-display text-[11px] uppercase tracking-[0.14em] text-blue md:text-xs">
            Phase 1
          </span>
        </div>
        <div className="flex w-full min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 flex-none">Focus</span>
          <span className="min-w-0 truncate text-right text-[13px] leading-5 text-ink md:text-sm">
            Workflow foundation
          </span>
        </div>
      </div>
    </div>
  );
}
