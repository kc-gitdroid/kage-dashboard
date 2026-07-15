import { SyncStatusPill } from "@/components/sync-status-pill";
import { ThemeToggle } from "@/components/theme-toggle";

export function Topbar() {
  return (
    <header className="mb-3 flex w-full min-w-0 max-w-full flex-wrap items-end justify-between gap-2.5 pb-1 md:mb-4">
      <div className="min-w-0">
        <p className="ui-eyebrow">Kage Dashboard</p>
        <h1 className="pixel-title mt-2 min-w-0 max-w-full overflow-hidden whitespace-nowrap font-arcade text-[clamp(1.45rem,4.5vw,3.15rem)] uppercase leading-none tracking-[0.045em] sm:tracking-[0.07em]">
          Command Center
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <ThemeToggle />
        <SyncStatusPill className="flex" compact />
      </div>
    </header>
  );
}
