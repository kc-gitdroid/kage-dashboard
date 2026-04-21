import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { CalendarPage } from "@/components/pages/calendar-page";

export default function Page() {
  return (
    <DashboardShell currentPath="/calendar">
      <Suspense fallback={null}>
        <CalendarPage />
      </Suspense>
    </DashboardShell>
  );
}
