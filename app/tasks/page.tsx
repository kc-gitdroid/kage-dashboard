import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { TasksPage } from "@/components/pages/tasks-page";

export default function Page() {
  return (
    <DashboardShell currentPath="/tasks">
      <Suspense fallback={null}>
        <TasksPage />
      </Suspense>
    </DashboardShell>
  );
}
