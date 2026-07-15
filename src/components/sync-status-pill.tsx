"use client";

import { useDashboardData } from "@/components/providers/dashboard-data-provider";

function getLabel({
  syncState,
  pendingCount,
}: {
  syncState: "idle" | "syncing" | "failed";
  pendingCount: number;
}) {
  if (syncState === "syncing") {
    return pendingCount > 0 ? `Syncing / ${pendingCount} pending` : "Syncing";
  }
  if (syncState === "failed") {
    return pendingCount > 0 ? `Sync failed / ${pendingCount} pending` : "Sync failed";
  }
  if (pendingCount > 0) {
    return `${pendingCount} pending`;
  }
  return "Synced";
}

function getTone({
  syncState,
  pendingCount,
}: {
  syncState: "idle" | "syncing" | "failed";
  pendingCount: number;
}) {
  if (syncState === "failed") {
    return "border-orange/30 text-orange";
  }
  if (syncState === "syncing" || pendingCount > 0) {
    return "border-blue/30 text-blue";
  }
  return "border-lime/30 text-lime";
}

export function SyncStatusPill({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { syncIndicator } = useDashboardData();
  const label = getLabel(syncIndicator);
  const tone = getTone(syncIndicator);

  return (
    <div className={className}>
      <div
        className={`ui-pill inline-flex min-h-8 gap-2 rounded-lg border bg-panel/80 ${
          compact ? "px-3 py-1.5" : "px-3 py-1.5"
        } ${tone}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        <span className="block font-display text-[10px] font-semibold uppercase leading-none tracking-[0.12em]">{label}</span>
      </div>
    </div>
  );
}
