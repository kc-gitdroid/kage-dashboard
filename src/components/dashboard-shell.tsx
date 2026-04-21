import { ReactNode } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { SyncStatusPill } from "@/components/sync-status-pill";
import { Topbar } from "@/components/topbar";

type DashboardShellProps = {
  currentPath: string;
  children: ReactNode;
};

export function DashboardShell({ currentPath, children }: DashboardShellProps) {
  return (
    <div className="dashboard-grid min-h-screen overflow-x-hidden bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen w-full min-w-0 max-w-[1600px] overflow-x-hidden">
        <Sidebar currentPath={currentPath} />
        <main className="flex-1 min-w-0 w-full overflow-x-hidden px-4 pb-24 pt-4 md:px-5 md:pb-9 md:pt-5 xl:px-7">
          <Topbar />
          <SyncStatusPill className="mb-4 hidden justify-end md:flex" />
          {children}
        </main>
      </div>
      <MobileNav currentPath={currentPath} />
    </div>
  );
}
