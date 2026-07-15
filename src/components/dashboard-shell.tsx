import { ReactNode } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

type DashboardShellProps = {
  currentPath: string;
  children: ReactNode;
};

export function DashboardShell({ currentPath, children }: DashboardShellProps) {
  return (
    <div className="dashboard-grid min-h-screen overflow-x-hidden bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen w-full min-w-0 max-w-[1480px] overflow-x-hidden">
        <Sidebar currentPath={currentPath} />
        <main className="w-full min-w-0 flex-1 overflow-x-hidden px-3 pb-24 pt-3 sm:px-3.5 md:px-4 md:pb-6 md:pt-3.5 xl:px-5">
          <Topbar />
          {children}
        </main>
      </div>
      <MobileNav currentPath={currentPath} />
    </div>
  );
}
